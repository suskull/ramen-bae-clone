# Exercise 05: Scheduled Tasks (Cron Jobs)

Learn to create scheduled Edge Functions that run automatically at specified intervals.

## Learning Objectives

- Set up cron jobs with Edge Functions
- Schedule periodic tasks
- Implement cleanup operations
- Monitor scheduled executions
- Handle long-running operations
- Test cron functions locally

## Prerequisites

- Completed Exercise 04
- Understanding of cron syntax
- Basic knowledge of background jobs

## Estimated Time

25 minutes

## Part 1: Understanding Cron Syntax (3 minutes)

### Cron Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, 0 and 7 are Sunday)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

### Common Examples

| Schedule | Cron Expression | Description |
|----------|----------------|-------------|
| Every minute | `* * * * *` | Testing only |
| Every hour | `0 * * * *` | Top of every hour |
| Daily at midnight | `0 0 * * *` | Once per day |
| Every Monday at 9am | `0 9 * * 1` | Weekly |
| First of month | `0 0 1 * *` | Monthly |

## Part 2: Create Cleanup Function (10 minutes)

### Task 2.1: Create Function

```bash
supabase functions new cleanup-old-data
```

### Task 2.2: Write Cleanup Logic

**File**: `supabase/functions/cleanup-old-data/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    console.log('Starting cleanup job...');

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete old logs
    const { data: deletedLogs, error: logsError } = await supabase
      .from('email_logs')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (logsError) {
      console.error('Error deleting logs:', logsError);
    } else {
      console.log(`Deleted ${deletedLogs?.length || 0} old email logs`);
    }

    // Delete expired cache
    const { data: deletedCache, error: cacheError } = await supabase
      .from('api_cache')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (cacheError) {
      console.error('Error deleting cache:', cacheError);
    } else {
      console.log(`Deleted ${deletedCache?.length || 0} expired cache entries`);
    }

    // Delete abandoned carts
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: deletedCarts, error: cartsError } = await supabase
      .from('carts')
      .delete()
      .eq('status', 'abandoned')
      .lt('updated_at', sevenDaysAgo.toISOString());

    if (cartsError) {
      console.error('Error deleting carts:', cartsError);
    } else {
      console.log(`Deleted ${deletedCarts?.length || 0} abandoned carts`);
    }

    const summary = {
      success: true,
      deletedLogs: deletedLogs?.length || 0,
      deletedCache: deletedCache?.length || 0,
      deletedCarts: deletedCarts?.length || 0,
      timestamp: new Date().toISOString(),
    };

    console.log('Cleanup completed:', summary);

    return new Response(
      JSON.stringify(summary),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cleanup job failed:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
```

### Task 2.3: Deploy Function

```bash
supabase functions deploy cleanup-old-data
```

## Part 3: Configure Cron Schedule (5 minutes)

### Task 3.1: Set Up Cron Job

Supabase uses `pg_cron` extension. Run this SQL:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup to run daily at 2 AM
SELECT cron.schedule(
  'cleanup-old-data',
  '0 2 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-old-data',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) as request_id;
  $$
);

-- View scheduled jobs
SELECT * FROM cron.job;
```

**Important**: Replace `YOUR_PROJECT_REF` and `YOUR_SERVICE_ROLE_KEY` with your actual values.

### Task 3.2: Alternative - Use External Cron Service

For more flexibility, use services like:
- **Cron-job.org** (free)
- **EasyCron** (free tier)
- **GitHub Actions** (free for public repos)

Example GitHub Action:

**File**: `.github/workflows/cleanup.yml`

```yaml
name: Daily Cleanup

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call cleanup function
        run: |
          curl -X POST \
            https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-old-data \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json"
```

## Part 4: Monitoring and Logging (4 minutes)

### Task 4.1: Create Job Logs Table

```sql
CREATE TABLE cron_job_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cron_logs_job ON cron_job_logs(job_name, created_at DESC);
```

### Task 4.2: Add Logging to Function

```typescript
serve(async (req) => {
  const startTime = Date.now();
  const jobName = 'cleanup-old-data';

  try {
    // ... cleanup logic ...

    const duration = Date.now() - startTime;

    // Log success
    await supabase
      .from('cron_job_logs')
      .insert({
        job_name: jobName,
        status: 'success',
        details: summary,
        duration_ms: duration,
      });

    return new Response(JSON.stringify(summary));

  } catch (error) {
    const duration = Date.now() - startTime;

    // Log failure
    await supabase
      .from('cron_job_logs')
      .insert({
        job_name: jobName,
        status: 'failed',
        details: { error: error.message },
        duration_ms: duration,
      });

    throw error;
  }
});
```

## Part 5: Testing Cron Functions (3 minutes)

### Task 5.1: Test Locally

```bash
# Serve function
supabase functions serve cleanup-old-data

# Trigger manually (use service role key for admin operations)
curl -i --location --request POST 'http://localhost:54321/functions/v1/cleanup-old-data' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU' \
  --header 'Content-Type: application/json'
```

### Task 5.2: View Logs

```bash
# View function logs
supabase functions logs cleanup-old-data --follow

# View cron job logs in database
SELECT * FROM cron_job_logs ORDER BY created_at DESC LIMIT 10;
```

## Challenges

### Challenge 1: Email Digest
Create a cron job that sends daily email digests to users.

### Challenge 2: Data Backup
Implement a scheduled backup of critical data.

### Challenge 3: Report Generation
Generate and email weekly analytics reports.

### Challenge 4: Subscription Renewal
Check and process subscription renewals daily.

### Challenge 5: Inventory Alerts
Monitor inventory levels and send alerts when low.

## Key Takeaways

- Use cron syntax to schedule tasks
- Always use service role key for cron jobs
- Log all cron executions for monitoring
- Handle errors gracefully
- Test locally before deploying
- Use external services for complex scheduling
- Monitor execution time and performance
- Implement idempotency for safety

## Next Exercise

Continue to Exercise 06 to build a complete checkout flow!
