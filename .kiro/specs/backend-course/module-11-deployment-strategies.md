# Module 11: Deployment Strategies (Going to Production)

## Learning Objectives
- Understand deployment environments
- Deploy Next.js to Vercel
- Configure production databases
- Set up CI/CD pipelines
- Implement zero-downtime deployments

## 11.1 Deployment Environments

### Development → Staging → Production

```
Development (Local)
    ↓
Staging (Test Production)
    ↓
Production (Live Users)
```

**Development**: Your local machine, frequent changes
**Staging**: Production-like environment for testing
**Production**: Live application serving real users

**Frontend analogy:**
```javascript
// Like having different build modes
if (process.env.NODE_ENV === 'development') {
  // Show debug info
} else if (process.env.NODE_ENV === 'staging') {
  // Test with production-like data
} else {
  // Production mode
}
```

## 11.2 Environment Configuration

### Environment Variables

```bash
# .env.local (Development)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-key
DATABASE_URL=postgresql://localhost:5432/dev

# .env.staging (Staging)
NEXT_PUBLIC_SUPABASE_URL=https://staging.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-key
DATABASE_URL=postgresql://staging-db:5432/staging

# .env.production (Production)
NEXT_PUBLIC_SUPABASE_URL=https://prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-key
DATABASE_URL=postgresql://prod-db:5432/production
```

### Vercel Environment Variables

```bash
# Install Vercel CLI
npm i -g vercel

# Set environment variables
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add DATABASE_URL production
```

## 11.3 Deploying to Vercel

### Initial Setup

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Deploy to production
vercel --prod
```

### vercel.json Configuration

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "build": {
    "env": {
      "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
    }
  }
}
```

### Automatic Deployments

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 11.4 Database Deployment

### Migration Strategy

```sql
-- migrations/001_initial_schema.sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- migrations/002_add_inventory.sql
ALTER TABLE products ADD COLUMN inventory INTEGER DEFAULT 0;

-- migrations/003_add_categories.sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

ALTER TABLE products ADD COLUMN category_id UUID REFERENCES categories(id);
```

### Running Migrations

```typescript
// scripts/migrate.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../migrations');
  const files = fs.readdirSync(migrationsDir).sort();
  
  for (const file of files) {
    console.log(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`Migration ${file} failed:`, error);
      process.exit(1);
    }
    
    console.log(`✓ ${file} completed`);
  }
  
  console.log('All migrations completed successfully');
}

runMigrations();
```

```bash
# Run migrations
npm run migrate
```

## 11.5 CI/CD Pipeline

### Complete GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run tests
        run: npm test
        env:
          TEST_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          TEST_SUPABASE_KEY: ${{ secrets.TEST_SUPABASE_KEY }}
      
      - name: Build
        run: npm run build
  
  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Staging
        run: vercel deploy --token=${{ secrets.VERCEL_TOKEN }}
  
  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Production
        run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Run Database Migrations
        run: npm run migrate
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## 11.6 Zero-Downtime Deployments

### Blue-Green Deployment

```
Blue (Current)  ──→  Users
                     ↓
Green (New)     ──→  Test
                     ↓
                  Switch
                     ↓
Blue (Old)      ←──  Rollback if needed
Green (Current) ──→  Users
```

**Vercel handles this automatically!**

### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    const { error: dbError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (dbError) throw new Error('Database unhealthy');
    
    // Check external services
    const stripeHealthy = await checkStripe();
    if (!stripeHealthy) throw new Error('Stripe unhealthy');
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'ok',
        stripe: 'ok'
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message
      },
      { status: 503 }
    );
  }
}
```

## 11.7 Monitoring and Logging

### Error Tracking (Sentry)

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

```typescript
// Usage in API routes
export async function POST(request: NextRequest) {
  try {
    // Your code
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Application Logs

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

// Usage
logger.info({ userId: '123' }, 'User logged in');
logger.error({ error }, 'Failed to process order');
```

## 11.8 Performance Monitoring

### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Custom Metrics

```typescript
// lib/metrics.ts
export async function trackMetric(name: string, value: number) {
  await fetch('https://analytics.example.com/metrics', {
    method: 'POST',
    body: JSON.stringify({
      name,
      value,
      timestamp: Date.now()
    })
  });
}

// Usage
await trackMetric('order.processing.time', duration);
await trackMetric('api.response.time', responseTime);
```

## 11.9 Rollback Strategy

### Git-Based Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Vercel automatically deploys the revert
```

### Vercel Dashboard Rollback

```
1. Go to Vercel Dashboard
2. Select your project
3. Go to Deployments
4. Find previous working deployment
5. Click "Promote to Production"
```

## 11.10 Production Checklist

### Before Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Error tracking set up (Sentry)
- [ ] Monitoring configured
- [ ] Security headers set
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Backup strategy in place
- [ ] Rollback plan documented

### After Deployment

- [ ] Health check endpoint responding
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify database connections
- [ ] Test critical user flows
- [ ] Monitor resource usage
- [ ] Check logs for errors

## 11.11 Deployment Best Practices

### 1. Deploy During Low Traffic

```bash
# Schedule deployments for off-peak hours
# e.g., 2 AM local time
```

### 2. Feature Flags

```typescript
// lib/features.ts
export const features = {
  newCheckout: process.env.FEATURE_NEW_CHECKOUT === 'true',
  aiRecommendations: process.env.FEATURE_AI === 'true'
};

// Usage
if (features.newCheckout) {
  return <NewCheckoutFlow />;
} else {
  return <OldCheckoutFlow />;
}
```

### 3. Gradual Rollouts

```typescript
// Roll out to percentage of users
const isInRollout = (userId: string, percentage: number) => {
  const hash = hashCode(userId);
  return (hash % 100) < percentage;
};

// 10% of users get new feature
if (isInRollout(user.id, 10)) {
  return <NewFeature />;
}
```

### 4. Database Backups

```bash
# Automated daily backups
# Supabase handles this automatically

# Manual backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20240101.sql
```

## 11.12 Key Takeaways

- **Multiple environments** (dev, staging, prod) prevent issues
- **CI/CD automates** testing and deployment
- **Zero-downtime** deployments keep app available
- **Health checks** ensure app is working
- **Monitoring** catches issues early
- **Rollback strategy** allows quick recovery
- **Feature flags** enable safe rollouts

## Next Module Preview

In Module 12, we'll learn about Monitoring and Debugging - how to find and fix issues in production!
