# Project Structure

Clean, organized structure for the Ramen Bae e-commerce platform.

## Root Directory

```
ramen-bae-clone/
├── src/                    # Application source code
├── docs/                   # All documentation (organized by topic)
├── supabase/              # Supabase configuration & migrations
├── scripts/               # Utility scripts
├── public/                # Static assets
├── archive/               # Archived learning materials
├── .kiro/                 # Kiro AI configuration
├── README.md              # Main project documentation
└── [config files]         # Next.js, TypeScript, Tailwind configs
```

## Source Code (`/src/`)

```
src/
├── app/                   # Next.js App Router
│   ├── (auth)/           # Authentication pages
│   ├── (shop)/           # Shopping pages
│   ├── account/          # User account pages
│   └── api/              # API routes
├── components/            # React components
│   ├── layout/           # Header, Footer, Navigation
│   ├── product/          # Product displays
│   ├── cart/             # Shopping cart
│   ├── reviews/          # Review system
│   └── ui/               # Reusable UI components (shadcn/ui)
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities & configurations
│   ├── supabase/         # Supabase client & types
│   ├── stripe/           # Stripe integration
│   └── utils/            # Helper functions
├── providers/             # React context providers
└── stores/                # Zustand state management
```

## Documentation (`/docs/`)

```
docs/
├── README.md                      # Documentation index
├── guides/                        # Setup & usage guides
│   ├── SUPABASE_SETUP.md
│   ├── CART_STORAGE_STRATEGY.md
│   ├── CART_MERGE_STRATEGY.md
│   └── test-api.http
├── optimization/                  # Performance docs
│   ├── BUNDLE_OPTIMIZATION_SUMMARY.md
│   ├── IMAGE_OPTIMIZATION_SUMMARY.md
│   └── MOBILE_OPTIMIZATION_SUMMARY.md
├── database-migration/            # Database management
│   ├── README.md
│   ├── DATABASE_MIGRATION.md
│   ├── SYNC_CHECKLIST.md
│   └── scripts/
└── [deployment & workflow docs]
```

## Supabase (`/supabase/`)

```
supabase/
├── functions/             # Edge Functions
│   ├── create-checkout/
│   ├── stripe-webhook/
│   └── send-order-email/
├── migrations/            # Database migrations (timestamped)
└── config.toml           # Supabase configuration
```

## Scripts (`/scripts/`)

```
scripts/
├── verify-products-table.js       # Database verification
└── [other utility scripts]
```

## Archive (`/archive/`)

```
archive/
├── README.md                      # Archive documentation
├── backend-course/                # Backend learning materials
│   ├── supabase-functions/
│   ├── database/
│   └── scripts/
└── learning-materials/            # Database basics
```

## Configuration Files (Root)

- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts
- `pnpm-lock.yaml` - Dependency lock file
- `components.json` - shadcn/ui configuration
- `.env.example` - Environment variable template
- `.env.local` - Local environment variables (gitignored)
- `.gitignore` - Git ignore rules

## Key Principles

### 1. Separation of Concerns
- **Source code** in `/src/`
- **Documentation** in `/docs/`
- **Configuration** in `/supabase/`
- **Utilities** in `/scripts/`
- **Archives** in `/archive/`

### 2. Documentation Organization
- **By topic** not by date
- **Guides** for how-to instructions
- **Optimization** for performance
- **Database** for data management

### 3. Clean Root Directory
- Only essential files at root
- No scattered documentation
- Clear project entry point (README.md)

### 4. Logical Grouping
- Related files together
- Clear naming conventions
- Easy to navigate

## Finding What You Need

### "I want to..."

**...understand the project**
→ Start with `/README.md`

**...set up my environment**
→ `/docs/ENVIRONMENT_QUICK_START.md`

**...work on features**
→ `/src/` directory

**...deploy to production**
→ `/docs/DEPLOYMENT_GUIDE.md`

**...manage the database**
→ `/docs/database-migration/`

**...optimize performance**
→ `/docs/optimization/`

**...learn backend concepts**
→ `/archive/backend-course/`

## Maintenance

### Adding New Files

- **Source code** → `/src/` in appropriate subdirectory
- **Documentation** → `/docs/` organized by topic
- **Scripts** → `/scripts/` with descriptive names
- **Migrations** → Auto-generated in `/supabase/migrations/`
- **Edge Functions** → `/supabase/functions/`

### Keeping It Clean

1. Don't add documentation to root
2. Use existing subdirectories
3. Archive old materials properly
4. Update this file when structure changes
5. Keep README.md as the main entry point

## Benefits of This Structure

✅ **Easy Navigation** - Clear hierarchy and organization
✅ **Scalable** - Room to grow without clutter
✅ **Maintainable** - Easy to find and update files
✅ **Professional** - Clean, organized appearance
✅ **Collaborative** - Team members can find what they need
✅ **Documented** - Clear purpose for each directory

---

Last updated: November 2025
