# Supabase Architecture

Understanding how Supabase works under the hood.

## What is Supabase?

**Supabase** = Open-source Firebase alternative built on PostgreSQL

**Frontend Analogy**: Like having a complete backend framework (Express + Auth + Storage + Real-time) in one package.

## Core Components

### 1. PostgreSQL Database

**What**: Industry-standard relational database  
**Why**: Powerful, reliable, feature-rich  
**Frontend Analogy**: Like Redux but persistent and shared across users

```typescript
// Direct database access from frontend (secured by RLS)
const { data } = await supabase.from('products').select('*');
```

### 2. Authentication (GoTrue)

**What**: Complete auth system  
**Why**: Handles users, sessions, OAuth  
**Frontend Analogy**: Like Auth0 but integrated

```typescript
const { data } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

### 3. Storage

**What**: S3-compatible file storage  
**Why**: Store images, videos, documents  
**Frontend Analogy**: Like Cloudinary but integrated

```typescript
const { data } = await supabase.storage
  .from('images')
  .upload('path/file.jpg', file);
```

### 4. Real-time (Realtime)

**What**: WebSocket-based subscriptions  
**Why**: Live updates without polling  
**Frontend Analogy**: Like Socket.io but automatic

```typescript
supabase
  .channel('changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
  .subscribe();
```

### 5. Edge Functions (Deno)

**What**: Serverless functions  
**Why**: Custom backend logic  
**Frontend Analogy**: Like API routes but serverless

```typescript
const { data } = await supabase.functions.invoke('my-function', {
  body: { key: 'value' },
});
```

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│           Your Application              │
│  (Next.js, React, Vue, Mobile, etc.)   │
└──────────────┬──────────────────────────┘
               │
               │ Supabase Client Library
               │
┌──────────────┴──────────────────────────┐
│         Supabase Platform               │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐            │
│  │   Auth   │  │ Storage  │            │
│  │ (GoTrue) │  │  (S3)    │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │      PostgreSQL Database         │  │
│  │  - Tables                        │  │
│  │  - RLS Policies                  │  │
│  │  - Functions                     │  │
│  │  - Triggers                      │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │Real-time │  │  Edge    │            │
│  │(WebSocket│  │Functions │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

## How It Works

### Traditional Backend

```
Frontend → API Server → Database
         → Auth Server
         → File Server
         → WebSocket Server
```

### Supabase

```
Frontend → Supabase → PostgreSQL (with RLS)
                   → Auth (built-in)
                   → Storage (built-in)
                   → Real-time (built-in)
```

## Row Level Security (RLS)

**The Magic**: Database enforces permissions

```sql
-- Policy: Users can only see their own orders
CREATE POLICY "own_orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);
```

**Frontend Analogy**: Like having if statements in your database that can't be bypassed.

## Key Advantages

1. **Direct Database Access**: No API layer needed
2. **Type Safety**: Auto-generated types
3. **Real-time Built-in**: No extra setup
4. **Scalable**: PostgreSQL scales well
5. **Open Source**: Not locked in
6. **Self-Hostable**: Can run your own

## Key Takeaways

- Supabase = Complete backend platform
- Built on PostgreSQL (proven technology)
- RLS provides database-level security
- Real-time is automatic
- Everything is integrated
- Open source and self-hostable
