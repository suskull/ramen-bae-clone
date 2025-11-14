# Navigation Quick Test Guide

Quick checklist for manually testing all navigation in the Ramen Bae application.

## Desktop Navigation Test

### Header Navigation
- [ ] Click logo → Goes to homepage
- [ ] Click "Shop" → Goes to /products
- [ ] Click "About Us" → Goes to /about
- [ ] Click "FAQ" → Goes to /faq
- [ ] Click "Contact Us" → Goes to /contact
- [ ] Click Account icon (guest) → Opens sign-in modal
- [ ] Click Account icon (logged in) → Goes to /profile
- [ ] Click Cart icon → Opens cart sidebar

### Homepage
- [ ] Click "Shop Now" button → Goes to /products
- [ ] Scroll down → Header becomes sticky with background

### Products Page
- [ ] Click "All Products" → Shows all products
- [ ] Click "Mixes" → Filters to mixes
- [ ] Click "Single Toppings" → Filters to single toppings
- [ ] Click "Bundles" → Filters to bundles
- [ ] Click "Seasoning & Sauce" → Filters to seasoning
- [ ] Click "Merch" → Filters to merch
- [ ] Click any product card → Goes to product detail

### Product Detail Page
- [ ] Click "Add to Cart" → Opens cart sidebar
- [ ] Click related product → Goes to that product
- [ ] Click breadcrumb/back → Returns to products

### Footer Links
- [ ] Click "All Products" → Goes to /products
- [ ] Click "Mixes" → Goes to /products?category=mixes
- [ ] Click "About Us" → Goes to /about
- [ ] Click "FAQ" → Goes to /faq
- [ ] Click "Contact Us" → Goes to /contact
- [ ] Click "Shipping Info" → Goes to /shipping
- [ ] Click "Returns" → Goes to /returns
- [ ] Click "Privacy Policy" → Goes to /privacy
- [ ] Click "Terms of Service" → Goes to /terms
- [ ] Click "Cookie Policy" → Goes to /cookies

### Sign-In Modal
- [ ] Click "Create account" → Goes to /signup
- [ ] Click "Forgot password?" → Goes to /forgot-password

### About Page
- [ ] Click "Shop Our Products" → Goes to /products
- [ ] Click "Get in Touch" → Goes to /contact

---

## Mobile Navigation Test

### Mobile Menu
- [ ] Click hamburger menu → Opens mobile drawer
- [ ] Click "Shop" → Goes to /products and closes menu
- [ ] Click "About Us" → Goes to /about and closes menu
- [ ] Click "FAQ" → Goes to /faq and closes menu
- [ ] Click "Contact Us" → Goes to /contact and closes menu
- [ ] Click "Account" → Goes to /profile and closes menu
- [ ] Click X button → Closes menu
- [ ] Click overlay → Closes menu

### Mobile Cart
- [ ] Click cart icon → Opens full-screen cart
- [ ] Add item → Cart opens automatically
- [ ] Click X or overlay → Closes cart

### Touch Targets
- [ ] All buttons are at least 44px tall
- [ ] Links are easy to tap
- [ ] No accidental clicks

---

## Cart Functionality Test

### Adding Items
- [ ] Click "Add to Cart" on product detail → Item added
- [ ] Cart icon badge updates with count
- [ ] Cart sidebar opens automatically

### Cart Sidebar
- [ ] Items display correctly
- [ ] Quantity controls work (+/-)
- [ ] Remove button works
- [ ] Progress bar shows correctly
- [ ] Free shipping message appears at $40
- [ ] Free fish cakes message appears at $60
- [ ] Empty cart shows recommendations

---

## Authentication Flow Test

### Guest User
- [ ] Click Account → Sign-in modal opens
- [ ] Click "Create account" → Goes to /signup
- [ ] Click "Forgot password?" → Goes to /forgot-password

### Sign Up
- [ ] Fill form and submit → Creates account
- [ ] After signup → Redirects appropriately

### Sign In
- [ ] Enter credentials → Signs in
- [ ] After signin → Modal closes, page refreshes
- [ ] Cart merges correctly

### Logged In User
- [ ] Click Account → Goes to /profile
- [ ] Profile shows user info
- [ ] Click "Sign Out" → Signs out and redirects

---

## Error Handling Test

### Invalid Routes
- [ ] Visit /invalid-route → Shows 404 page

### Product Not Found
- [ ] Visit /products/invalid-slug → Shows error with back link
- [ ] Click "Back to Products" → Returns to /products

### Network Errors
- [ ] Disconnect internet → Shows error message
- [ ] Click "Try Again" → Retries request

---

## Performance Test

### Page Load
- [ ] Homepage loads quickly
- [ ] Products page loads quickly
- [ ] Product detail loads quickly
- [ ] Images load progressively

### Navigation Speed
- [ ] Route changes are instant
- [ ] No page flicker
- [ ] Smooth transitions

---

## Accessibility Test

### Keyboard Navigation
- [ ] Tab through all links
- [ ] Enter key activates links
- [ ] Focus visible on all elements
- [ ] Escape closes modals

### Screen Reader
- [ ] Links have descriptive text
- [ ] Images have alt text
- [ ] Buttons have aria-labels
- [ ] Modals announce correctly

---

## Browser Compatibility Test

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Quick Smoke Test (5 minutes)

Fastest way to verify everything works:

1. [ ] Homepage → Click "Shop Now"
2. [ ] Products → Click a product
3. [ ] Product Detail → Click "Add to Cart"
4. [ ] Cart opens → Verify item is there
5. [ ] Click logo → Back to homepage
6. [ ] Click "About Us" → Verify page loads
7. [ ] Click "Contact" → Verify page loads
8. [ ] Open mobile menu → Verify it works
9. [ ] Click footer link → Verify it works
10. [ ] Build succeeds: `pnpm run build`

If all 10 pass, navigation is working! ✅
