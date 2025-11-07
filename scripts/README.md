# Scripts

This directory contains utility scripts for the Ramen Bae project.

## Product Seeding Scripts

### Quick Start
```bash
# Run everything at once
./seed-and-generate-images.sh
```

### Individual Scripts

#### seed-more-products.ts
Generates and inserts 48 test products into Supabase.

```bash
npx tsx scripts/seed-more-products.ts
```

#### create-missing-images.js
Generates SVG placeholder images for all products and updates database.

```bash
node scripts/create-missing-images.js
```

## Requirements

- Node.js and pnpm installed
- `.env.local` with Supabase credentials
- Supabase database with categories seeded

## Documentation

See [SEEDING_WORKFLOW.md](../docs/SEEDING_WORKFLOW.md) for detailed documentation.
