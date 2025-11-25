# Cart Merge Strategy - Option 1 + Enhancement

## Overview

This implementation uses **Option 1 + Enhancement**: Clear guest cart after merge, with automatic logout handling. This is the simplest, most maintainable approach that prevents duplicate items.

## How It Works

### Guest User Flow
```
1. User browses as guest
2. Adds items to cart → Stored in localStorage only
3. No API calls made (fast & private)
4. Cart persists after browser close
```

### Login Flow
```
1. User logs in with guest cart items
2. AuthCartSync detects login
3. Calls mergeGuestCart(userId)
4. Backend merges guest + saved cart (quantities combine)
5. loadFromSupabase() replaces localStorage with merged DB data
6. Guest cart effectively cleared ✅
```

### Logout Flow
```
1. User logs out
2. AuthCartSync detects logout
3. Calls clearCartOnLogout()
4. localStorage cart cleared ✅
5. Fresh start for next session
```

### Re-login Flow
```
1. User logs in again (after logout)
2. localStorage is empty (cleared on logout)
3. loadFromSupabase() loads user's saved cart
4. No duplicates! ✅
```

## Prevents Duplicate Issue

### ❌ Without This Fix:
```
Guest cart: [Ramen A: 2]
Login → Merge → User cart: [Ramen A: 2]
Logout → localStorage still has [Ramen A: 2] ❌
Add more → Guest cart: [Ramen A: 2, Ramen B: 1]
Login → Merge → User cart: [Ramen A: 4, Ramen B: 1] 🔴 DUPLICATE!
```

### ✅ With This Fix:
```
Guest cart: [Ramen A: 2]
Login → Merge → User cart: [Ramen A: 2]
localStorage replaced with DB data ✅
Logout → localStorage cleared ✅
Add new → Guest cart: [Ramen B: 1]
Login → Merge → User cart: [Ramen A: 2, Ramen B: 1] ✅ No duplicates!
```

## Implementation Details

### 1. Cart Store (`src/stores/cart-store.ts`)

**Added `clearCartOnLogout()` method:**
```typescript
clearCartOnLogout: () => {
  // Clear cart on logout to prevent stale data
  set({
    items: [],
    cartId: null,
    subtotal: 0,
    itemCount: 0,
    gifts: GIFT_THRESHOLDS,
  });
}
```

**Updated `mergeGuestCart()`:**
- Simplified to single merge strategy (combine quantities)
- Removed complex strategy parameter
- `loadFromSupabase()` at the end clears guest cart automatically

### 2. AuthCartSync (`src/components/auth/AuthCartSync.tsx`)

**Tracks login/logout state:**
```typescript
const prevUserRef = useRef<typeof user>(undefined)

useEffect(() => {
  const prevUser = prevUserRef.current
  prevUserRef.current = user

  // User just logged in
  if (user && !prevUser) {
    mergeGuestCart(user.id)
  }
  
  // User just logged out
  if (!user && prevUser) {
    clearCartOnLogout()
  }
}, [user, loading])
```

### 3. useCart Hook (`src/hooks/useCart.ts`)

**Exposed `clearCartOnLogout`:**
```typescript
return {
  // ... other methods
  clearCartOnLogout,
}
```

## Benefits

### 1. **Prevents Duplicates**
- Guest cart cleared after merge
- Logout clears cart completely
- No stale data on re-login

### 2. **Simple & Maintainable**
- Single merge strategy (combine quantities)
- Clear separation of concerns
- Easy to understand and debug

### 3. **Fast for Guests**
- No API calls until login
- localStorage only
- Instant cart updates

### 4. **Secure**
- No tracking of guest users
- Data only stored after login
- Clean database (no orphaned carts)

### 5. **Standard E-commerce Behavior**
- Matches Amazon, Shopify, etc.
- Users expect fresh start after logout
- Predictable behavior

## Edge Cases Handled

### Case 1: Multiple Login/Logout Cycles
```
✅ Each logout clears cart
✅ Each login merges fresh guest cart
✅ No accumulation of old items
```

### Case 2: Same Product in Both Carts
```
Guest: [Ramen A: 2]
Saved: [Ramen A: 3]
Result: [Ramen A: 5] ✅ Quantities combined
```

### Case 3: Empty Guest Cart on Login
```
✅ Just loads saved cart
✅ No merge needed
✅ No errors
```

### Case 4: Empty Saved Cart on Login
```
✅ Guest cart becomes saved cart
✅ Works seamlessly
```

### Case 5: Browser Refresh While Logged In
```
✅ Cart persists (from DB)
✅ No re-merge
✅ State maintained
```

## Testing Scenarios

### Test 1: Basic Merge
1. Add items as guest
2. Login
3. Verify items in cart
4. Check DB has items

### Test 2: Duplicate Prevention
1. Add items as guest
2. Login (items merge)
3. Logout
4. Verify cart is empty
5. Add new items as guest
6. Login again
7. Verify no duplicates

### Test 3: Quantity Combination
1. Add Ramen A (qty: 2) as guest
2. Login to account with Ramen A (qty: 3)
3. Verify final quantity is 5

### Test 4: Logout Clears Cart
1. Login with items
2. Logout
3. Verify cart is empty
4. Verify localStorage is cleared

## Comparison with Option 4 (Modal)

| Feature | Option 1 + Enhancement | Option 4 (Modal) |
|---------|----------------------|------------------|
| Complexity | ⭐ Simple | ⭐⭐⭐ Complex |
| User Friction | ⭐⭐⭐ None | ⭐ Requires choice |
| Maintenance | ⭐⭐⭐ Easy | ⭐ More code |
| Duplicates | ✅ Prevented | ✅ Prevented |
| UX | ⭐⭐⭐ Seamless | ⭐⭐ Extra step |
| Code Lines | ~20 lines | ~200 lines |

## Files Modified

1. `src/stores/cart-store.ts` - Added `clearCartOnLogout()`
2. `src/components/auth/AuthCartSync.tsx` - Added logout detection
3. `src/hooks/useCart.ts` - Exposed `clearCartOnLogout()`

## Migration from Option 4

If you previously implemented Option 4 (modal), you can safely remove:
- `src/components/cart/CartMergeModal.tsx`
- `src/components/cart/CartMergeModal.md`
- `src/app/test-cart-merge/page.tsx`
- Modal-related code in `AuthCartSync.tsx`

## Conclusion

Option 1 + Enhancement provides the best balance of:
- **Simplicity** - Minimal code, easy to understand
- **Reliability** - Prevents duplicates automatically
- **Performance** - No extra API calls or UI
- **UX** - Seamless, no user intervention needed
- **Maintainability** - Easy to extend and debug

This is the recommended approach for most e-commerce applications.
