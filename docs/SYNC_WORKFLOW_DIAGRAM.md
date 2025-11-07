# Sync Workflow Diagram

## Visual Guide: Local → Production

```
┌─────────────────────────────────────────────────────────────────┐
│                     LOCAL DEVELOPMENT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Seed Products                                               │
│     ┌──────────────────────────────────────┐                   │
│     │ npx tsx scripts/seed-more-products.ts │                   │
│     └──────────────────┬───────────────────┘                   │
│                        │                                         │
│                        ▼                                         │
│  2. Generate Images                                             │
│     ┌──────────────────────────────────────┐                   │
│     │ node scripts/create-missing-images.js │                   │
│     └──────────────────┬───────────────────┘                   │
│                        │                                         │
│                        ▼                                         │
│  ┌─────────────────────────────────────────────┐               │
│  │  Local Database (PostgreSQL)                 │               │
│  │  • 57 products                               │               │
│  │  • 5 categories                              │               │
│  │  • Reviews                                   │               │
│  └─────────────────────────────────────────────┘               │
│                        │                                         │
│  ┌─────────────────────────────────────────────┐               │
│  │  Local Files                                 │               │
│  │  • public/products/*.svg (114 files)         │               │
│  └─────────────────────────────────────────────┘               │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ 3. Export Data
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │ node docs/database-migration/scripts/    │
        │       export-local-data.js               │
        └──────────────────┬───────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │  production_import.sql                   │
        │  • INSERT statements for all data        │
        │  • ON CONFLICT handling                  │
        │  • Ready to run in production            │
        └──────────────────┬───────────────────────┘
                           │
                           │
        ┌──────────────────┴───────────────────────┐
        │                                           │
        │ 4a. Upload Images        4b. Import Data │
        │                                           │
        ▼                                           ▼
┌─────────────────────┐              ┌─────────────────────────┐
│  Supabase Storage   │              │  Supabase SQL Editor    │
│  • Upload 114 SVGs  │              │  • Paste SQL            │
│  • To product-images│              │  • Run import           │
│    bucket           │              │  • Verify success       │
└─────────┬───────────┘              └───────────┬─────────────┘
          │                                      │
          │                                      │
          └──────────────┬───────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PRODUCTION (Supabase)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────┐               │
│  │  Production Database                         │               │
│  │  • 57 products                               │               │
│  │  • 5 categories                              │               │
│  │  • Reviews                                   │               │
│  │  • All synced from local                     │               │
│  └─────────────────────────────────────────────┘               │
│                                                                  │
│  ┌─────────────────────────────────────────────┐               │
│  │  Storage Bucket (product-images)             │               │
│  │  • products/*.svg (114 files)                │               │
│  │  • Publicly accessible                       │               │
│  └─────────────────────────────────────────────┘               │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ 5. Verify
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │  Test Production                         │
        │  • API calls return 57 products          │
        │  • Images load correctly                 │
        │  • App works as expected                 │
        └──────────────────────────────────────────┘
                           │
                           │ 6. Deploy
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │  git push → Vercel Deploy                │
        │  • Frontend updated                      │
        │  • Connected to production DB            │
        │  • Live for users                        │
        └──────────────────────────────────────────┘
```

## Timeline

| Step | Action | Time | Difficulty |
|------|--------|------|------------|
| 1 | Seed products locally | 1 min | Easy |
| 2 | Generate images | 1 min | Easy |
| 3 | Export data | 30 sec | Easy |
| 4a | Upload images | 3-5 min | Easy |
| 4b | Import SQL | 30 sec | Easy |
| 5 | Verify | 2 min | Easy |
| 6 | Deploy | 2-3 min | Easy |
| **Total** | **End-to-end** | **10-15 min** | **Easy** |

## Decision Points

### Image Storage Strategy

```
┌─────────────────────────────────────┐
│  Where to store product images?     │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌───────────────┐   ┌──────────────────┐
│ Local Public  │   │ Supabase Storage │
│ Folder        │   │                  │
├───────────────┤   ├──────────────────┤
│ ✅ Simple     │   │ ✅ CDN delivery  │
│ ✅ Fast dev   │   │ ✅ Scalable      │
│ ✅ No upload  │   │ ✅ Managed       │
│ ❌ Deploy size│   │ ❌ Upload needed │
└───────────────┘   └──────────────────┘
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
        ┌─────────────────┐
        │  Recommended:   │
        │  Local Public   │
        │  (for now)      │
        └─────────────────┘
```

### Sync Frequency

```
┌────────────────────────────────────┐
│  When to sync to production?       │
└────────────────┬───────────────────┘
                 │
     ┌───────────┼───────────┐
     │           │           │
     ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Daily   │ │ Weekly  │ │ As      │
│         │ │         │ │ Needed  │
├─────────┤ ├─────────┤ ├─────────┤
│ ❌ Too  │ │ ✅ Good │ │ ✅ Best │
│  often  │ │  rhythm │ │  for    │
│         │ │         │ │  changes│
└─────────┘ └─────────┘ └─────────┘
```

## Rollback Plan

If something goes wrong:

```
┌─────────────────────────────────────┐
│  Problem detected in production     │
└─────────────────┬───────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │  Quick Rollback │
        └─────────┬───────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌───────────────┐   ┌──────────────────┐
│ Database      │   │ Images           │
│               │   │                  │
│ Run previous  │   │ Delete new files │
│ import SQL    │   │ from storage     │
│               │   │                  │
│ OR            │   │ OR               │
│               │   │                  │
│ Restore from  │   │ Keep (harmless)  │
│ backup        │   │                  │
└───────────────┘   └──────────────────┘
```

## Best Practices

```
✅ DO:
  • Test locally first
  • Export before major changes
  • Verify after import
  • Keep backups
  • Document changes

❌ DON'T:
  • Sync user data
  • Sync orders/payments
  • Skip verification
  • Delete production data manually
  • Sync during peak hours
```
