# Ramen Bae E-commerce Clone

A modern e-commerce platform specializing in dried ramen toppings, built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🛍️ Product catalog with categories and filtering
- 🛒 Shopping cart with progress tracking for free shipping
- ⭐ Customer reviews and ratings
- 📱 Fully responsive mobile design
- 🎨 Playful animations and modern UI
- 🔐 User authentication and account management
- 💳 Secure checkout process

## Tech Stack

**Frontend:**
- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Query (TanStack Query)
- Zustand

**Backend:**
- Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- Docker for local development

**Infrastructure:**
- Vercel (Frontend hosting)
- Supabase Cloud (Backend services)

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)
- Docker Desktop (for local Supabase)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ramen-bae-clone
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
# See docs/ENVIRONMENT_QUICK_START.md for details
```

4. Start local Supabase
```bash
supabase start
```

5. Run the development server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

Clean, organized structure with clear separation of concerns. See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed documentation.

```
├── src/                    # Application source code
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utilities and configurations
├── docs/                   # All project documentation
│   ├── guides/            # Setup and usage guides
│   ├── optimization/      # Performance optimization docs
│   └── database-migration/ # Database sync and migration
├── scripts/               # Utility scripts
├── supabase/              # Supabase configuration
│   ├── functions/         # Edge Functions
│   └── migrations/        # Database migrations
├── archive/               # Archived learning materials
└── public/                # Static assets
```

## Development

### Spec-Driven Development

This project follows a spec-driven development approach. See the `.kiro/specs/ramen-bae-clone/` directory for:
- `requirements.md` - Feature requirements and acceptance criteria
- `design.md` - Technical architecture and design decisions
- `tasks.md` - Implementation task list

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

## Deployment

Ready to deploy to production? See our comprehensive deployment guides:

- **[Complete Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Full production deployment walkthrough
- **[Quick Reference](./docs/DEPLOYMENT_QUICK_REFERENCE.md)** - Common commands and checklists
- **[Troubleshooting](./docs/DEPLOYMENT_TROUBLESHOOTING.md)** - Solutions to common issues

### Quick Deploy

```bash
# 1. Link Supabase project
supabase link --project-ref your-project-ref

# 2. Push database schema
supabase db push

# 3. Deploy Edge Functions
supabase functions deploy

# 4. Deploy to Vercel
vercel --prod
```

See the [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

## Contributing

1. Check the `tasks.md` file for available tasks
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Supabase Development

### Workflow
When making schema changes, always follow: **Local → Test → Migrate → Production**

Quick guides:
- **Quick Reference:** [docs/SUPABASE_QUICK_REFERENCE.md](./docs/SUPABASE_QUICK_REFERENCE.md)
- **Complete Workflow:** [docs/SUPABASE_WORKFLOW.md](./docs/SUPABASE_WORKFLOW.md)
- **Database Migration:** [docs/database-migration/README.md](./docs/database-migration/README.md)

### Common Commands
```bash
# Create migration
supabase migration new add_something

# Apply locally
supabase db reset

# Generate types
supabase gen types typescript --local > src/lib/supabase/database.types.ts

# Deploy to production
supabase db push
```

## Database Migration & Sync

All database migration, sync, and seeding documentation is in `docs/database-migration/`.

Quick commands:
```bash
# Export data from local
node docs/database-migration/scripts/export-local-data.js

# Verify production data
./docs/database-migration/scripts/verify-production-data.sh
```

See [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) for details.

## Documentation

All documentation is organized in the `docs/` directory:

- **[docs/guides/](./docs/guides/)** - Setup guides, API testing, cart strategies
- **[docs/optimization/](./docs/optimization/)** - Bundle analysis, image optimization, mobile performance
- **[docs/database-migration/](./docs/database-migration/)** - Database sync, migration, and seeding workflows

## Archive

Learning materials and backend course exercises are in `archive/` for reference.
