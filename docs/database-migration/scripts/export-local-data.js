#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔄 Exporting data from local database...\n');

const DB_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

// Function to export table data as INSERT statements
function exportTable(tableName) {
  console.log(`📦 Exporting ${tableName}...`);
  
  try {
    // Get data as JSON
    const query = `SELECT json_agg(t) FROM ${tableName} t`;
    const result = execSync(
      `psql "${DB_URL}" -t -A -c "${query}"`,
      { encoding: 'utf-8' }
    ).trim();
    
    if (!result || result === 'null') {
      console.log(`   ⚠️  No data in ${tableName}`);
      return '';
    }
    
    const data = JSON.parse(result);
    
    if (!data || data.length === 0) {
      console.log(`   ⚠️  No data in ${tableName}`);
      return '';
    }
    
    console.log(`   ✅ Found ${data.length} rows`);
    
    // Generate INSERT statements
    const columns = Object.keys(data[0]);
    const values = data.map(row => {
      const vals = columns.map(col => {
        const val = row[col];
        if (val === null) return 'NULL';
        if (Array.isArray(val)) {
          // Check if array contains objects (like images array)
          if (val.length > 0 && typeof val[0] === 'object') {
            // This is a JSONB array (images, media)
            return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
          }
          // Regular text array (tags, ingredients, allergens, features)
          if (val.length === 0) return "'{}'";
          return `ARRAY[${val.map(v => `'${String(v).replace(/'/g, "''")}'`).join(',')}]`;
        }
        if (typeof val === 'object') {
          // Handle JSON objects (nutrition_facts)
          return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
        }
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        return val;
      });
      return `(${vals.join(', ')})`;
    });
    
    const sql = `-- Data for ${tableName}\n` +
      `INSERT INTO ${tableName} (${columns.join(', ')})\nVALUES\n` +
      values.join(',\n') +
      ';\n\n';
    
    return sql;
  } catch (error) {
    console.error(`   ❌ Error exporting ${tableName}:`, error.message);
    return '';
  }
}

// Export all tables
const tables = ['categories', 'products', 'reviews', 'carts', 'cart_items'];
let fullSQL = `-- ============================================================================
-- LOCAL DATABASE DATA EXPORT
-- Generated: ${new Date().toISOString()}
-- ============================================================================
-- This file contains all data from your local database
-- Run this in production to sync data
-- ============================================================================
-- WARNING: This will DELETE existing data and replace with local data
-- ============================================================================

-- Disable triggers temporarily for faster import
SET session_replication_role = replica;

-- ============================================================================
-- STEP 1: Delete existing data (in reverse order to respect foreign keys)
-- ============================================================================
DELETE FROM cart_items;
DELETE FROM carts;
DELETE FROM reviews;
DELETE FROM products;
DELETE FROM categories;

-- ============================================================================
-- STEP 2: Insert fresh data from local database
-- ============================================================================

`;

for (const table of tables) {
  fullSQL += exportTable(table);
}

fullSQL += `-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- ============================================================================
-- Import complete!
-- ============================================================================
`;

// Write to file
fs.writeFileSync('production_import.sql', fullSQL);

console.log('\n✅ Export complete!');
console.log('📄 File created: production_import.sql');
console.log('\n📋 Next steps:');
console.log('1. Go to Supabase Dashboard → SQL Editor');
console.log('2. Copy content from production_import.sql');
console.log('3. Paste and run in production');
console.log('\nOr use CLI:');
console.log('supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.nfydvfhrepavcyclzfrh.supabase.co:5432/postgres" < production_import.sql');
