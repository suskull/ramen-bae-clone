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

## Archive

Backend course learning materials have been moved to `archive-backend-course/` for reference.
