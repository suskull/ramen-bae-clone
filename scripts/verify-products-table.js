// Temporary script to verify products table structure
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyProductsTable() {
    try {
        // Get a sample product to verify all fields exist
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .limit(1)

        if (error) {
            console.error('Error:', error)
            return
        }

        if (products && products.length > 0) {
            const product = products[0]
            console.log('✅ Products table exists and contains data')
            console.log('📋 Available columns:', Object.keys(product))
            console.log('📝 Sample product structure:')
            console.log(JSON.stringify(product, null, 2))

            // Check required fields
            const requiredFields = [
                'id', 'slug', 'name', 'description', 'price', 'images',
                'category_id', 'tags', 'inventory', 'nutrition_facts',
                'ingredients', 'allergens', 'features', 'accent_color',
                'created_at', 'updated_at'
            ]

            const missingFields = requiredFields.filter(field => !(field in product))

            if (missingFields.length === 0) {
                console.log('✅ All required fields are present!')
            } else {
                console.log('❌ Missing fields:', missingFields)
            }
        } else {
            console.log('⚠️ Products table exists but is empty')
        }
    } catch (error) {
        console.error('Failed to verify products table:', error)
    }
}

verifyProductsTable()