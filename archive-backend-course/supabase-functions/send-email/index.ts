/**
 * Send Email Edge Function
 * 
 * Sends transactional emails using Resend API
 * Supports custom templates and HTML/text content
 * 
 * Documentation: https://resend.com/docs
 * Context7 MCP used to fetch latest Resend API patterns
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, createCorsResponse } from '../_shared/cors.ts';

interface EmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: 'welcome' | 'order-confirmation' | 'password-reset';
  templateData?: Record<string, any>;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

Deno.serve(async (req) => {
  console.log('📧 Send Email function called');

  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const origin = req.headers.get('origin');

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('❌ Missing authorization header');
      return createCorsResponse(
        { error: 'Missing authorization header' },
        { status: 401 },
        origin
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('❌ Authentication failed:', authError?.message);
      return createCorsResponse(
        { error: 'Unauthorized' },
        { status: 401 },
        origin
      );
    }

    console.log(`✅ User authenticated: ${user.email}`);

    // Parse request
    const emailRequest: EmailRequest = await req.json();
    const { to, subject, html, text, template, templateData, cc, bcc, replyTo } = emailRequest;

    // Validate input
    if (!to || !subject) {
      console.log('❌ Missing required fields');
      return createCorsResponse(
        { error: 'Missing required fields: to, subject' },
        { status: 400 },
        origin
      );
    }

    // Generate email content from template if specified
    let emailHtml = html;
    let emailText = text;
    let emailSubject = subject;

    if (template) {
      console.log(`📝 Generating email from template: ${template}`);
      const generated = generateEmailFromTemplate(template, templateData || {});
      emailHtml = generated.html;
      emailText = generated.text;
      emailSubject = generated.subject || subject;
    }

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.log('❌ RESEND_API_KEY not configured');
      return createCorsResponse(
        { error: 'Email service not configured' },
        { status: 500 },
        origin
      );
    }

    // Send email with Resend
    console.log(`📤 Sending email to: ${Array.isArray(to) ? to.join(', ') : to}`);
    
    const emailPayload: any = {
      from: Deno.env.get('RESEND_FROM_EMAIL') || 'onboarding@resend.dev',
      to: Array.isArray(to) ? to : [to],
      subject: emailSubject,
    };

    if (emailHtml) emailPayload.html = emailHtml;
    if (emailText) emailPayload.text = emailText;
    if (cc) emailPayload.cc = Array.isArray(cc) ? cc : [cc];
    if (bcc) emailPayload.bcc = Array.isArray(bcc) ? bcc : [bcc];
    if (replyTo) emailPayload.reply_to = replyTo;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log('❌ Resend API error:', error);
      throw new Error(`Resend API error: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    console.log(`✅ Email sent successfully! ID: ${result.id}`);

    // Log email sent (optional - requires email_logs table)
    try {
      await supabase
        .from('email_logs')
        .insert({
          user_id: user.id,
          to: Array.isArray(to) ? to.join(',') : to,
          subject: emailSubject,
          template,
          email_id: result.id,
          status: 'sent',
        });
      console.log('📊 Email logged to database');
    } catch (logError) {
      // Non-critical error - email was sent successfully
      console.log('⚠️  Failed to log email (non-critical):', logError.message);
    }

    return createCorsResponse(
      {
        success: true,
        emailId: result.id,
        message: 'Email sent successfully',
      },
      { status: 200 },
      origin
    );

  } catch (error) {
    console.error('❌ Email sending failed:', error);

    return createCorsResponse(
      {
        error: 'Failed to send email',
        message: error.message,
      },
      { status: 500 },
      origin
    );
  }
});

/**
 * Generate email content from predefined templates
 */
function generateEmailFromTemplate(
  template: string,
  data: Record<string, any>
): { html: string; text: string; subject?: string } {
  switch (template) {
    case 'welcome':
      return {
        subject: `Welcome to Our App, ${data.name || 'there'}!`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6; 
                  color: #333;
                  margin: 0;
                  padding: 0;
                }
                .container { 
                  max-width: 600px; 
                  margin: 0 auto; 
                  background: #ffffff;
                }
                .header { 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white; 
                  padding: 40px 20px; 
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 28px;
                  font-weight: 600;
                }
                .content { 
                  padding: 40px 30px; 
                  background: #f9fafb;
                }
                .content p {
                  margin: 0 0 16px 0;
                  font-size: 16px;
                }
                .content ul {
                  margin: 20px 0;
                  padding-left: 20px;
                }
                .content li {
                  margin: 8px 0;
                }
                .button { 
                  display: inline-block;
                  padding: 14px 28px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white !important;
                  text-decoration: none;
                  border-radius: 8px;
                  margin: 24px 0;
                  font-weight: 600;
                  font-size: 16px;
                }
                .footer {
                  padding: 20px;
                  text-align: center;
                  color: #6b7280;
                  font-size: 14px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Welcome to Our App!</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.name || 'there'},</p>
                  <p>Thanks for joining us! We're thrilled to have you on board.</p>
                  <p>Here's what you can do next:</p>
                  <ul>
                    <li>✨ Complete your profile</li>
                    <li>🚀 Explore our features</li>
                    <li>👥 Connect with other users</li>
                  </ul>
                  <div style="text-align: center;">
                    <a href="${data.dashboardUrl || 'https://yourapp.com/dashboard'}" class="button">
                      Get Started
                    </a>
                  </div>
                </div>
                <div class="footer">
                  <p>Need help? Reply to this email or visit our support center.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Welcome ${data.name || 'there'}! Thanks for joining us. Get started at: ${data.dashboardUrl || 'https://yourapp.com/dashboard'}`,
      };

    case 'order-confirmation':
      const items = data.items || [];
      const itemsHtml = items.map((item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">×${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price.toFixed(2)}</td>
        </tr>
      `).join('');

      return {
        subject: `Order Confirmation #${data.orderId}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  line-height: 1.6; 
                  color: #333;
                  margin: 0;
                  padding: 0;
                }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                .header { 
                  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                  color: white; 
                  padding: 40px 20px; 
                  text-align: center;
                }
                .content { padding: 40px 30px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .total-row { 
                  font-weight: 600; 
                  font-size: 18px;
                  border-top: 2px solid #333 !important;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✅ Order Confirmed!</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.name || 'there'},</p>
                  <p>Your order <strong>#${data.orderId}</strong> has been confirmed and is being processed.</p>
                  
                  <h2>Order Details</h2>
                  <table>
                    <thead>
                      <tr style="background: #f9fafb;">
                        <th style="padding: 12px; text-align: left;">Item</th>
                        <th style="padding: 12px; text-align: center;">Qty</th>
                        <th style="padding: 12px; text-align: right;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                      <tr class="total-row">
                        <td colspan="2" style="padding: 16px;">Total</td>
                        <td style="padding: 16px; text-align: right;">$${(data.total || 0).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <p>We'll send you another email when your order ships.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Order #${data.orderId} confirmed! Total: $${(data.total || 0).toFixed(2)}. We'll notify you when it ships.`,
      };

    case 'password-reset':
      return {
        subject: 'Reset Your Password',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  line-height: 1.6; 
                  color: #333;
                  margin: 0;
                  padding: 0;
                }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                .header { 
                  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                  color: white; 
                  padding: 40px 20px; 
                  text-align: center;
                }
                .content { padding: 40px 30px; }
                .button { 
                  display: inline-block;
                  padding: 14px 28px;
                  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                  color: white !important;
                  text-decoration: none;
                  border-radius: 8px;
                  margin: 24px 0;
                  font-weight: 600;
                }
                .warning {
                  background: #fef3c7;
                  border-left: 4px solid #f59e0b;
                  padding: 16px;
                  margin: 20px 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 Reset Your Password</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.name || 'there'},</p>
                  <p>We received a request to reset your password. Click the button below to create a new password:</p>
                  
                  <div style="text-align: center;">
                    <a href="${data.resetLink}" class="button">Reset Password</a>
                  </div>
                  
                  <div class="warning">
                    <strong>⚠️ Security Notice:</strong> This link expires in 1 hour. If you didn't request this, please ignore this email.
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${data.resetLink}" style="color: #3b82f6;">${data.resetLink}</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Reset your password by clicking this link: ${data.resetLink}\n\nThis link expires in 1 hour. If you didn't request this, please ignore this email.`,
      };

    default:
      return { html: '', text: '', subject: '' };
  }
}
