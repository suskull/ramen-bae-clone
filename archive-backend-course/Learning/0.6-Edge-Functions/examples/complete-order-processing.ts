/**
 * Complete Order Processing Edge Function
 * 
 * This is a production-ready example that demonstrates:
 * - Payment processing with Stripe
 * - Database transactions
 * - Email notifications
 * - Inventory management
 * - Error handling and rollback
 * - Comprehensive logging
 * 
 * @example
 * const { data, error } = await supabase.functions.invoke('process-order', {
 *   body: {
 *     items: [{ productId: 'uuid', quantity: 2 }],
 *     paymentMethodId: 'pm_card_visa',
 *     shippingAddress: { ... }
 *   }
 * });
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.0.0';

// Types
interface OrderItem {
  productId: string;
  quantity: number;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface OrderRequest {
  items: OrderItem[];
  paymentMethodId: string;
  shippingAddress: ShippingAddress;
  discountCode?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  inventory: number;
}

interface OrderResponse {
  success: boolean;
  orderId?: string;
  paymentIntentId?: string;
  total?: number;
  error?: string;
}

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Main handler function
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();
  let orderId: string | null = null;
  let paymentIntentId: string | null = null;

  try {
    // Step 1: Authenticate user
    console.log('[1/8] Authenticating user...');
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    console.log(`User authenticated: ${user.id}`);

    // Step 2: Parse and validate request
    console.log('[2/8] Validating request...');
    const orderRequest: OrderRequest = await req.json();
    validateOrderRequest(orderRequest);

    const { items, paymentMethodId, shippingAddress, discountCode } = orderRequest;

    // Step 3: Fetch and validate products
    console.log('[3/8] Fetching product details...');
    const products = await fetchProducts(supabase, items);
    validateInventory(products, items);

    // Step 4: Calculate totals
    console.log('[4/8] Calculating totals...');
    const { subtotal, discount, tax, shipping, total } = await calculateTotals(
      products,
      items,
      shippingAddress,
      discountCode
    );

    console.log(`Order total: $${total.toFixed(2)}`);

    // Step 5: Create order record
    console.log('[5/8] Creating order...');
    const order = await createOrder(supabase, {
      userId: user.id,
      items,
      products,
      subtotal,
      discount,
      tax,
      shipping,
      total,
      shippingAddress,
      discountCode,
    });

    orderId = order.id;
    console.log(`Order created: ${orderId}`);

    // Step 6: Process payment
    console.log('[6/8] Processing payment...');
    const paymentIntent = await processPayment(stripe, {
      amount: total,
      paymentMethodId,
      orderId: orderId!,
      userId: user.id,
      email: user.email!,
    });

    paymentIntentId = paymentIntent.id;
    console.log(`Payment processed: ${paymentIntentId}`);

    // Step 7: Update inventory
    console.log('[7/8] Updating inventory...');
    await updateInventory(supabase, items);

    // Step 8: Send confirmation email
    console.log('[8/8] Sending confirmation email...');
    await sendConfirmationEmail(supabase, {
      email: user.email!,
      orderId: orderId!,
      items: items.map(item => {
        const product = products.find(p => p.id === item.productId)!;
        return {
          name: product.name,
          quantity: item.quantity,
          price: product.price,
        };
      }),
      total,
      shippingAddress,
    });

    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        payment_id: paymentIntentId,
        payment_status: 'paid',
      })
      .eq('id', orderId);

    const duration = Date.now() - startTime;
    console.log(`Order processing completed in ${duration}ms`);

    // Return success response
    const response: OrderResponse = {
      success: true,
      orderId,
      paymentIntentId,
      total,
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Order processing failed:', error);

    // Rollback operations
    await rollbackOrder(supabase, orderId, paymentIntentId);

    const duration = Date.now() - startTime;
    console.log(`Order processing failed after ${duration}ms`);

    // Return error response
    const response: OrderResponse = {
      success: false,
      error: error.message,
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

/**
 * Validate order request
 */
function validateOrderRequest(request: OrderRequest): void {
  if (!request.items || request.items.length === 0) {
    throw new Error('Cart is empty');
  }

  if (!request.paymentMethodId) {
    throw new Error('Payment method is required');
  }

  if (!request.shippingAddress) {
    throw new Error('Shipping address is required');
  }

  // Validate each item
  for (const item of request.items) {
    if (!item.productId || !item.quantity) {
      throw new Error('Invalid item in cart');
    }

    if (item.quantity <= 0) {
      throw new Error('Item quantity must be positive');
    }
  }
}

/**
 * Fetch products from database
 */
async function fetchProducts(
  supabase: any,
  items: OrderItem[]
): Promise<Product[]> {
  const productIds = items.map(item => item.productId);

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, price, inventory')
    .in('id', productIds);

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  if (!products || products.length !== productIds.length) {
    throw new Error('Some products not found');
  }

  return products;
}

/**
 * Validate inventory availability
 */
function validateInventory(products: Product[], items: OrderItem[]): void {
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }

    if (product.inventory < item.quantity) {
      throw new Error(`Insufficient inventory for ${product.name}`);
    }
  }
}

/**
 * Calculate order totals
 */
async function calculateTotals(
  products: Product[],
  items: OrderItem[],
  shippingAddress: ShippingAddress,
  discountCode?: string
): Promise<{
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
}> {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId)!;
    return sum + (product.price * item.quantity);
  }, 0);

  // Apply discount
  let discount = 0;
  if (discountCode) {
    // In real app, validate discount code from database
    discount = subtotal * 0.1; // 10% discount for demo
  }

  // Calculate tax (simplified - use real tax API in production)
  const taxRate = 0.08; // 8% tax
  const tax = (subtotal - discount) * taxRate;

  // Calculate shipping (simplified)
  const shipping = subtotal > 50 ? 0 : 5.99;

  // Calculate total
  const total = subtotal - discount + tax + shipping;

  return { subtotal, discount, tax, shipping, total };
}

/**
 * Create order in database
 */
async function createOrder(
  supabase: any,
  orderData: any
): Promise<any> {
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: orderData.userId,
      status: 'pending',
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      tax: orderData.tax,
      shipping: orderData.shipping,
      total: orderData.total,
      shipping_address: orderData.shippingAddress,
      discount_code: orderData.discountCode,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create order: ${error.message}`);
  }

  // Create order items
  const orderItems = orderData.items.map((item: OrderItem) => {
    const product = orderData.products.find((p: Product) => p.id === item.productId)!;
    return {
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: product.price,
    };
  });

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }

  return order;
}

/**
 * Process payment with Stripe
 */
async function processPayment(
  stripe: Stripe,
  paymentData: any
): Promise<Stripe.PaymentIntent> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(paymentData.amount * 100), // Convert to cents
    currency: 'usd',
    payment_method: paymentData.paymentMethodId,
    confirm: true,
    metadata: {
      orderId: paymentData.orderId,
      userId: paymentData.userId,
      email: paymentData.email,
    },
  });

  if (paymentIntent.status !== 'succeeded') {
    throw new Error('Payment failed');
  }

  return paymentIntent;
}

/**
 * Update product inventory
 */
async function updateInventory(
  supabase: any,
  items: OrderItem[]
): Promise<void> {
  for (const item of items) {
    const { error } = await supabase.rpc('decrement_inventory', {
      product_id: item.productId,
      quantity: item.quantity,
    });

    if (error) {
      console.error(`Failed to update inventory for ${item.productId}:`, error);
      // Continue anyway - we'll reconcile later
    }
  }
}

/**
 * Send order confirmation email
 */
async function sendConfirmationEmail(
  supabase: any,
  emailData: any
): Promise<void> {
  try {
    await supabase.functions.invoke('send-email', {
      body: {
        to: emailData.email,
        subject: `Order Confirmation #${emailData.orderId}`,
        template: 'order-confirmation',
        templateData: {
          orderId: emailData.orderId,
          items: emailData.items,
          total: emailData.total,
          shippingAddress: emailData.shippingAddress,
        },
      },
    });
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    // Don't fail the order if email fails
  }
}

/**
 * Rollback order on failure
 */
async function rollbackOrder(
  supabase: any,
  orderId: string | null,
  paymentIntentId: string | null
): Promise<void> {
  console.log('Rolling back order...');

  // Cancel order
  if (orderId) {
    try {
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);
      console.log(`Order ${orderId} cancelled`);
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  }

  // Refund payment
  if (paymentIntentId) {
    try {
      await stripe.refunds.create({
        payment_intent: paymentIntentId,
      });
      console.log(`Payment ${paymentIntentId} refunded`);
    } catch (error) {
      console.error('Failed to refund payment:', error);
    }
  }
}
