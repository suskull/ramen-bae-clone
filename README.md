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

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── layout/      # Header, Footer, Navigation
│   ├── product/     # Product-related components
│   ├── cart/        # Shopping cart components
│   ├── reviews/     # Review components
│   └── ui/          # Reusable UI components
├── hooks/           # Custom React hooks
└── lib/             # Utility functions and configurations
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

## Archive

Backend course learning materials have been moved to `archive-backend-course/` for reference.
