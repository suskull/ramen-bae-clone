# Documentation Index

Welcome to the Ramen Bae project documentation!

## 📚 Quick Navigation

### 🚀 Getting Started

- **[Environment Quick Start](./ENVIRONMENT_QUICK_START.md)** - Set up your environment in 5 minutes
- **[Supabase Quick Reference](./SUPABASE_QUICK_REFERENCE.md)** - Common commands and patterns
- **[Supabase FAQ](./SUPABASE_FAQ.md)** - Frequently asked questions ⭐

### 🌐 Deployment

- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Complete production deployment guide ⭐
- **[Deployment Quick Reference](./DEPLOYMENT_QUICK_REFERENCE.md)** - Quick commands and checklists
- **[Deployment Troubleshooting](./DEPLOYMENT_TROUBLESHOOTING.md)** - Solutions to common deployment issues

### 🔧 Development Workflows

- **[Supabase Workflow](./SUPABASE_WORKFLOW.md)** - Complete guide for schema changes and migrations
- **[Supabase Summary](./SUPABASE_SUMMARY.md)** - Overview of best practices
- **[Environment Management](./ENVIRONMENT_MANAGEMENT.md)** - Managing local, staging, and production

### 📊 Database

- **[Database Migration](./database-migration/README.md)** - Migration tools and guides
- **[Data Sync Guide](./database-migration/DATA_SYNC_GUIDE.md)** - Syncing data between environments
- **[Import Guide](./database-migration/FIXED_IMPORT_GUIDE.md)** - Importing data to production

### 📖 Reference

- **[Environment Summary](./ENVIRONMENT_SUMMARY.md)** - Environment variables reference
- **[Cleanup Summary](./database-migration/CLEANUP_SUMMARY.md)** - Project organization

## 🎯 Common Tasks

### I want to...

#### Set up my development environment
→ [Environment Quick Start](./ENVIRONMENT_QUICK_START.md)

#### Deploy to production
→ [Deployment Guide](./DEPLOYMENT_GUIDE.md) or [Quick Reference](./DEPLOYMENT_QUICK_REFERENCE.md)

#### Add a new table to the database
→ [Supabase Workflow - Adding a New Table](./SUPABASE_WORKFLOW.md#workflow-1-adding-a-new-table)

#### Modify an existing table
→ [Supabase Workflow - Modifying Existing Table](./SUPABASE_WORKFLOW.md#workflow-2-modifying-existing-table)

#### Sync data from local to production
→ [Data Sync Guide](./database-migration/DATA_SYNC_GUIDE.md)

#### Switch between local and production database
→ [Environment Quick Start - Switching Environments](./ENVIRONMENT_QUICK_START.md#switching-environments)

#### Pull latest changes from team
→ [Supabase Quick Reference - Pulling Latest Changes](./SUPABASE_QUICK_REFERENCE.md#-pulling-latest-changes-team-member)

#### Deploy schema changes to production
→ [Deployment Guide - Supabase Setup](./DEPLOYMENT_GUIDE.md#supabase-production-setup)

#### Fix a migration error
→ [Supabase Workflow - Fixing a Migration Error](./SUPABASE_WORKFLOW.md#scenario-2-fixing-a-migration-error)

#### Rollback a deployment
→ [Deployment Guide - Rollback Procedures](./DEPLOYMENT_GUIDE.md#rollback-procedures)

## 📋 Documentation Structure

```
docs/
├── README.md                           # This file
├── DEPLOYMENT_GUIDE.md                 # Complete deployment guide ⭐
├── DEPLOYMENT_QUICK_REFERENCE.md       # Quick deployment commands
├── DEPLOYMENT_TROUBLESHOOTING.md       # Deployment issue solutions
├── SUPABASE_WORKFLOW.md                # Complete Supabase workflow
├── SUPABASE_QUICK_REFERENCE.md         # Quick commands and patterns
├── SUPABASE_SUMMARY.md                 # Best practices overview
├── ENVIRONMENT_MANAGEMENT.md           # Environment management guide
├── ENVIRONMENT_QUICK_START.md          # Quick environment setup
├── ENVIRONMENT_SUMMARY.md              # Environment reference
└── database-migration/                 # Database migration tools
    ├── README.md                       # Migration documentation
    ├── DATA_SYNC_GUIDE.md              # Data syncing guide
    ├── FIXED_IMPORT_GUIDE.md           # Import instructions
    ├── MIGRATION_GUIDE.md              # Migration best practices
    ├── CLEANUP_SUMMARY.md              # Project organization
    ├── exports/                        # Exported data files
    │   └── production_import.sql       # Main import file
    └── scripts/                        # Utility scripts
        ├── export-local-data.js        # Export data
        └── verify-production-data.sh   # Verify data
```

## 🔑 Key Concepts

### The Golden Rules

1. **Local → Test → Migrate → Production**
   - Always develop locally first
   - Test thoroughly before deploying
   - Use migrations for all schema changes

2. **Never Commit Secrets**
   - `.env.local` is gitignored
   - Use `.env.example` as template
   - Different keys for each environment

3. **Type Safety First**
   - Generate types after schema changes
   - Use centralized `env` object
   - Validate environment variables

### Development Flow

```
1. Make changes locally
2. Create migration file
3. Apply migration locally
4. Test application
5. Generate TypeScript types
6. Commit to git
7. Deploy to production
```

## 🛠️ Essential Commands

### Supabase

```bash
supabase start                    # Start local instance
supabase migration new name       # Create migration
supabase db reset                 # Apply all migrations
supabase gen types typescript --local > src/lib/supabase/database.types.ts
supabase db push                  # Deploy to production
```

### Environment

```bash
cp .env.example .env.local        # Setup environment
# Edit .env.local with your values
pnpm dev                          # Start dev server
```

### Data Sync

```bash
node docs/database-migration/scripts/export-local-data.js
# Then import production_import.sql in Supabase Dashboard
```

## 📞 Need Help?

### Common Issues

- **Deployment fails** → [Deployment Troubleshooting](./DEPLOYMENT_TROUBLESHOOTING.md)
- **Environment variable not found** → [Environment Quick Start](./ENVIRONMENT_QUICK_START.md#common-issues)
- **Migration fails** → [Supabase Workflow - Troubleshooting](./SUPABASE_WORKFLOW.md#troubleshooting)
- **Types out of sync** → [Supabase Workflow - Types Out of Sync](./SUPABASE_WORKFLOW.md#types-out-of-sync)
- **Wrong database** → [Environment Quick Start - Common Issues](./ENVIRONMENT_QUICK_START.md#still-using-wrong-database)
- **Stripe issues** → [Deployment Troubleshooting - Stripe](./DEPLOYMENT_TROUBLESHOOTING.md#stripe-payment-issues)
- **Images not loading** → [Deployment Troubleshooting - Images](./DEPLOYMENT_TROUBLESHOOTING.md#image-loading-issues)

### External Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🎓 Learning Path

### For New Team Members

1. Start with [Environment Quick Start](./ENVIRONMENT_QUICK_START.md)
2. Read [Supabase Quick Reference](./SUPABASE_QUICK_REFERENCE.md)
3. Review [Supabase Summary](./SUPABASE_SUMMARY.md)
4. Bookmark [Supabase Workflow](./SUPABASE_WORKFLOW.md) for reference
5. When ready to deploy, see [Deployment Guide](./DEPLOYMENT_GUIDE.md)

### For Experienced Developers

1. Skim [Supabase Quick Reference](./SUPABASE_QUICK_REFERENCE.md)
2. Review [Environment Summary](./ENVIRONMENT_SUMMARY.md)
3. Check [Database Migration README](./database-migration/README.md)
4. For deployment, use [Deployment Quick Reference](./DEPLOYMENT_QUICK_REFERENCE.md)

### For DevOps/Deployment

1. Read [Deployment Guide](./DEPLOYMENT_GUIDE.md) thoroughly
2. Keep [Deployment Quick Reference](./DEPLOYMENT_QUICK_REFERENCE.md) handy
3. Review [Supabase Workflow - Production](./SUPABASE_WORKFLOW.md#step-7-deploy-to-production)

## 📝 Contributing

When adding new documentation:

1. Follow existing structure and format
2. Include practical examples
3. Add to this index
4. Update relevant cross-references
5. Keep it concise and actionable

---

**Happy coding!** 🚀
