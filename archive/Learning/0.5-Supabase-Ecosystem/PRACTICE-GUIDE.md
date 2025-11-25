# Practice Guide: Module 0.5 in Your Main Project

How to practice Supabase concepts in your Ramen Bae project while learning.

## 🎯 Learning Strategy

### The Best Approach: **Learn → Apply → Build**

1. **Learn** - Read the exercise in `Learning/0.5-Supabase-Ecosystem/exercises/`
2. **Apply** - Implement the feature in your main `src/` project
3. **Build** - Extend it with your own ideas

This way, you're building your actual app while learning!

---

## 📁 Project Structure

```
your-project/
├── Learning/                          ← Reference & exercises
│   └── 0.5-Supabase-Ecosystem/
│       ├── SUPABASE-SETUP.md         ← Follow this first
│       ├── exercises/                 ← Read these as guides
│       └── examples/                  ← Reference implementations
│
├── src/                               ← Your main project (implement here!)
│   ├── app/
│   │   ├── products/                  ← Exercise 01: Query builder
│   │   ├── cart/                      ← Exercise 02: RLS
│   │   ├── profile/                   ← Exercise 04: File storage
│   │   └── admin/                     ← Exercise 05: Functions
│   │
│   └── lib/
│       └── supabase/
│           ├── client.ts              ← Set up from SUPABASE-SETUP.md
│           └── server.ts              ← Set up from SUPABASE-SETUP.md
│
└── .env.local                         ← Your Supabase credentials
```

---

## 🗺️ Exercise Mapping to Main Project

### Exercise 01: Query Builder Mastery
**Learn**: `Learning/0.5-Supabase-Ecosystem/exercises/01-query-builder-mastery.md`  
**Implement in**: `src/app/products/page.tsx`

```typescript
// src/app/products/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function ProductsPage() {
  const supabase = createClient();
  
  // Practice: Get products with categories (from Exercise 01)
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return (
    <div>
      {/* Your product listing UI */}
    </div>
  );
}
```

### Exercise 02: Row Level Security
**Learn**: `Learning/0.5-Supabase-Ecosystem/exercises/02-row-level-security.md`  
**Implement in**: `src/app/cart/page.tsx`

```typescript
// src/app/cart/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function CartPage() {
  const supabase = createClient();
  
  // Practice: RLS automatically filters to current user's cart
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*)
    `);

  return (
    <div>
      {/* Your cart UI */}
    </div>
  );
}
```

### Exercise 03: Real-time Subscriptions
**Learn**: `Learning/0.5-Supabase-Ecosystem/exercises/03-realtime-subscriptions.md`  
**Implement in**: `src/app/products/[id]/page.tsx`

```typescript
// src/app/products/[id]/LiveInventory.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function LiveInventory({ productId }: { productId: string }) {
  const [inventory, setInventory] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    // Practice: Real-time inventory updates
    const channel = supabase
      .channel('inventory')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,
        },
        (payload) => setInventory(payload.new.inventory)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, supabase]);

  return <span>In Stock: {inventory}</span>;
}
```

### Exercise 04: File Storage
**Learn**: `Learning/0.5-Supabase-Ecosystem/exercises/04-file-storage.md`  
**Implement in**: `src/app/profile/edit/page.tsx`

```typescript
// src/app/profile/edit/AvatarUpload.tsx
'use client';

import { createClient } from '@/lib/supabase/client';

export function AvatarUpload({ userId }: { userId: string }) {
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Practice: Upload to Supabase Storage
    const filePath = `${userId}/avatar.jpg`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);
    }
  };

  return <input type="file" onChange={handleUpload} />;
}
```

### Exercise 05: Database Functions
**Learn**: `Learning/0.5-Supabase-Ecosystem/exercises/05-database-functions.md`  
**Implement in**: `src/app/admin/dashboard/page.tsx`

```typescript
// src/app/admin/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboard() {
  const supabase = createClient();
  
  // Practice: Use database functions
  const { data: productCount } = await supabase
    .rpc('get_product_count');

  const { data: searchResults } = await supabase
    .rpc('search_products', { search_term: 'ramen' });

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Total Products: {productCount}</p>
      {/* More admin features */}
    </div>
  );
}
```

### Exercise 06: Complete Integration
**Learn**: `Learning/0.5-Supabase-Ecosystem/exercises/06-complete-integration.md`  
**Implement in**: Your entire Ramen Bae app!

This is where you tie everything together into a cohesive application.

---

## 🔄 Workflow for Each Exercise

### Step 1: Read the Exercise
Open the exercise file in `Learning/0.5-Supabase-Ecosystem/exercises/`

### Step 2: Understand the Concept
Read the theory and examples provided

### Step 3: Implement in Main Project
Create the feature in your `src/` folder

### Step 4: Test It
Verify it works in your actual app

### Step 5: Extend It
Add your own improvements and features

---

## 🎯 Practical Features to Build

As you work through Module 0.5, build these real features:

### Week 1: Foundation
- [ ] Product listing with categories (Exercise 01)
- [ ] Product search and filtering (Exercise 01)
- [ ] Product detail pages (Exercise 01)

### Week 2: User Features
- [ ] Shopping cart with RLS (Exercise 02)
- [ ] Wishlist with RLS (Exercise 02)
- [ ] User profile management (Exercise 02)

### Week 3: Real-time & Storage
- [ ] Live inventory updates (Exercise 03)
- [ ] Real-time cart sync (Exercise 03)
- [ ] Avatar upload (Exercise 04)
- [ ] Product image upload (Exercise 04)

### Week 4: Advanced Features
- [ ] Product search function (Exercise 05)
- [ ] Order calculations (Exercise 05)
- [ ] Admin dashboard (Exercise 06)
- [ ] Complete checkout flow (Exercise 06)

---

## 💡 Tips for Success

### Do:
✅ Follow the setup guide first (`SUPABASE-SETUP.md`)  
✅ Read exercises as learning guides  
✅ Implement features in your main project  
✅ Test each feature thoroughly  
✅ Commit your work frequently  
✅ Refer back to examples when stuck  

### Don't:
❌ Create duplicate code in Learning folder  
❌ Skip the setup guide  
❌ Try to build everything at once  
❌ Copy-paste without understanding  
❌ Forget to test RLS policies  

---

## 🧪 Testing Your Implementation

### Test Checklist for Each Feature:

```typescript
// 1. Does it work?
// 2. Is it secure (RLS)?
// 3. Does it handle errors?
// 4. Is it performant?
// 5. Does it follow best practices?
```

### Example Test Flow:

```typescript
// Test in browser console
const supabase = createClient();

// Test query
const { data, error } = await supabase
  .from('products')
  .select('*');

console.log('Data:', data);
console.log('Error:', error);
```

---

## 📚 Reference While Building

Keep these open while coding:

1. **Setup Guide**: `SUPABASE-SETUP.md` - For configuration
2. **Quick Reference**: `supabase-reference.md` - For syntax
3. **Current Exercise**: `exercises/XX-xxx.md` - For concepts
4. **Examples**: `examples/` - For patterns

---

## 🎓 Learning Outcomes

By practicing in your main project, you'll:

✅ Build a real e-commerce backend  
✅ Understand Supabase in production context  
✅ Create a portfolio-ready project  
✅ Learn by solving real problems  
✅ Have working features, not just exercises  

---

## 🚀 Getting Started

1. **Complete Setup**: Follow `SUPABASE-SETUP.md`
2. **Start with Exercise 01**: Read it, then implement in `src/app/products/`
3. **Build incrementally**: One feature at a time
4. **Test thoroughly**: Make sure it works before moving on
5. **Iterate**: Improve and extend as you learn

---

## 🆘 When You Get Stuck

1. Check the exercise file for hints
2. Look at the example implementations
3. Review the setup guide
4. Check the troubleshooting section
5. Test with simpler queries first

---

**Ready to build?** Start with [SUPABASE-SETUP.md](./SUPABASE-SETUP.md), then dive into Exercise 01!

Your learning becomes your product. Let's build something awesome! 🚀
