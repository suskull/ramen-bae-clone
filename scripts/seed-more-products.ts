import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const productNames = [
  'Premium Green Onions', 'Roasted Sesame Mix', 'Black Sesame Seeds', 'White Sesame Seeds',
  'Crispy Shallots', 'Fried Onion Flakes', 'Garlic Chips Deluxe', 'Spicy Garlic Mix',
  'Nori Flakes', 'Wakame Seaweed', 'Kombu Strips', 'Dulse Flakes',
  'Chili Oil Extra Hot', 'Mild Chili Oil', 'Garlic Chili Oil', 'Szechuan Chili Oil',
  'Miso Powder', 'Dashi Powder', 'Bonito Flakes', 'Shiitake Powder',
  'Toasted Nori Sheets', 'Seasoned Nori', 'Wasabi Nori', 'Teriyaki Nori',
  'Ramen Spice Blend', 'Tonkotsu Seasoning', 'Shoyu Seasoning', 'Miso Seasoning',
  'Bamboo Shoots', 'Wood Ear Mushrooms', 'Enoki Mushrooms', 'Shiitake Slices',
  'Pickled Ginger', 'Pickled Radish', 'Menma Bamboo', 'Naruto Fish Cake',
  'Soft Boiled Egg Mix', 'Egg Topping Kit', 'Chashu Pork Seasoning', 'Chicken Seasoning',
  'Vegetarian Mix', 'Vegan Topping Set', 'Gluten-Free Mix', 'Keto Ramen Kit',
  'Ramen Bowl Set', 'Chopsticks Bundle', 'Ramen Hoodie', 'Ramen Socks'
]

const descriptions = [
  'Premium quality topping that elevates your ramen experience.',
  'Carefully selected ingredients for authentic flavor.',
  'Small batch production ensures maximum freshness.',
  'Perfect addition to any bowl of ramen.',
  'Traditional recipe with modern quality standards.',
]

const colors = ['#fe90b8', '#ff4100', '#96da2f', '#e47e4a', '#F999BF', '#FFB6C1', '#87CEEB', '#98D8C8']

const features = [
  ['Whole Ingredients', 'Small Batch', 'Non-GMO'],
  ['Organic', 'Gluten-Free', 'Vegan'],
  ['Low Sodium', 'No MSG', 'All Natural'],
  ['Artisan Made', 'Premium Quality', 'Hand Selected'],
]

const tags = [
  ['bestseller', 'popular'],
  ['new', 'trending'],
  ['spicy', 'hot'],
  ['mild', 'classic'],
  ['premium', 'gourmet'],
]

async function seedProducts() {
  console.log('Fetching categories...')
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug')
  
  if (catError || !categories) {
    console.error('Error fetching categories:', catError)
    return
  }

  console.log(`Found ${categories.length} categories`)
  
  const products = productNames.map((name, index) => {
    const categoryIndex = index % categories.length
    const price = (Math.random() * 30 + 9.99).toFixed(2)
    const hasComparePrice = Math.random() > 0.7
    const comparePrice = hasComparePrice ? (parseFloat(price) * 1.2).toFixed(2) : null
    
    return {
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      description: descriptions[index % descriptions.length],
      price: parseFloat(price),
      compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
      images: [
        { url: `/products/product-${index + 1}-1.svg`, alt: `${name} main`, type: 'main' },
        { url: `/products/product-${index + 1}-2.svg`, alt: `${name} hover`, type: 'hover' },
      ],
      category_id: categories[categoryIndex].id,
      tags: tags[index % tags.length],
      inventory: Math.floor(Math.random() * 300) + 50,
      nutrition_facts: {
        servings: Math.floor(Math.random() * 20) + 10,
        calories: Math.floor(Math.random() * 60) + 20,
        protein: `${Math.floor(Math.random() * 5) + 1}g`,
        carbs: `${Math.floor(Math.random() * 10) + 2}g`,
        fat: `${Math.floor(Math.random() * 5) + 1}g`,
        sodium: `${Math.floor(Math.random() * 200) + 50}mg`,
      },
      ingredients: ['Premium Ingredients', 'Natural Flavors', 'Sea Salt'],
      allergens: Math.random() > 0.5 ? ['Sesame'] : [],
      features: features[index % features.length],
      accent_color: colors[index % colors.length],
    }
  })

  console.log(`Inserting ${products.length} products...`)
  
  const { data, error } = await supabase
    .from('products')
    .insert(products)
    .select()

  if (error) {
    console.error('Error inserting products:', error)
    return
  }

  console.log(`✅ Successfully inserted ${data?.length || 0} products!`)
  console.log('\n📸 Run the following command to generate product images:')
  console.log('node scripts/create-missing-images.js')
}

seedProducts().catch(console.error)
