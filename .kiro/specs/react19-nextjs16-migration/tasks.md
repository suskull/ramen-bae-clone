# Implementation Plan

- [ ] 1. Enable View Transitions in Next.js configuration
  - Update `next.config.ts` to enable experimental `viewTransition` flag
  - Add `data-scroll-behavior="smooth"` to root layout HTML element
  - Create CSS rules for view transitions in `globals.css`
  - Add view transition names for product images and titles
  - Test View Transitions in supported browsers with fallback for unsupported browsers
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Create useViewTransition hook
  - Implement `useViewTransition` hook in `src/hooks/useViewTransition.ts`
  - Add browser support detection for View Transitions API
  - Integrate with Next.js router for navigation
  - Add TypeScript types for view transition states
  - Test hook with product navigation flows
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3. Migrate cart to use useOptimistic for add/update/remove operations
  - Update `useCartStore` to support optimistic state flags
  - Refactor `AddToCartButton` component to use `useOptimistic` hook
  - Implement optimistic quantity updates in cart items
  - Add optimistic remove with fade-out animation
  - Implement error handling to revert optimistic updates on failure
  - Add visual indicators for pending optimistic operations
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4. Create Server Action for cart operations
  - Implement `addToCart` Server Action in `src/lib/actions/cart.ts`
  - Create `updateCartQuantity` Server Action
  - Implement `removeFromCart` Server Action
  - Add Zod validation schemas for cart operations
  - Implement error handling and revalidation
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5. Implement modal interception for product quick view
  - Create parallel route structure: `@modal` slot in products directory
  - Implement `default.tsx` for modal slot returning null
  - Create intercepting route `(.)slug]` for modal view
  - Build `ProductQuickView` component for modal content
  - Update products layout to accept modal slot
  - Test modal opening from product grid and closing with back button
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6. Create reusable Modal component with router integration
  - Build `Modal` component in `src/components/ui/modal.tsx`
  - Implement `router.back()` for modal closing
  - Add Escape key handler for closing modal
  - Add click-outside handler for closing modal
  - Integrate with Radix UI Dialog for accessibility
  - Add smooth open/close animations
  - _Requirements: 3.1, 3.2, 3.5_

- [ ] 7. Migrate contact form to use Server Actions
  - Create `submitContactForm` Server Action in `src/lib/actions/contact.ts`
  - Update contact page to use `useActionState` hook
  - Add Zod validation schema for contact form
  - Implement inline error display for validation failures
  - Add success message display after submission
  - _Requirements: 4.1, 4.3, 4.4_

- [ ] 8. Create SubmitButton component with useFormStatus
  - Build `SubmitButton` component in `src/components/forms/SubmitButton.tsx`
  - Use `useFormStatus` hook to access pending state
  - Disable button during form submission
  - Show loading text/spinner during submission
  - Make component reusable across all forms
  - _Requirements: 4.2_

- [ ] 9. Migrate review form to use Server Actions
  - Create `submitReview` Server Action in `src/lib/actions/reviews.ts`
  - Update `ReviewForm` component to use `useActionState`
  - Add Zod validation for review submissions
  - Implement optimistic review display using `useOptimistic`
  - Add error handling and success feedback
  - _Requirements: 4.5_

- [ ] 10. Refactor analytics tracking to use useEffectEvent
  - Create `useProductView` hook with `useEffectEvent` in `src/hooks/useProductView.ts`
  - Extract non-reactive tracking logic into effect event
  - Remove unnecessary dependencies from useEffect
  - Test that effect only runs when product ID changes
  - Verify user ID changes don't trigger re-tracking
  - _Requirements: 5.1_

- [ ] 11. Refactor scroll restoration to use useEffectEvent
  - Create `useScrollRestoration` hook with `useEffectEvent` in `src/hooks/useScrollRestoration.ts`
  - Implement scroll position saving on navigation
  - Extract restoration logic into effect event
  - Test smooth scroll restoration on back navigation
  - Verify scroll positions are maintained per route
  - _Requirements: 5.2, 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 12. Refactor cart sync to use useEffectEvent
  - Update `AuthCartSync` component to use `useEffectEvent`
  - Extract cart sync logic into effect event
  - Remove cart items from useEffect dependencies
  - Test that sync only happens on auth state changes
  - Verify cart updates don't trigger unnecessary syncs
  - _Requirements: 5.3_

- [ ] 13. Refactor product view tracking to use useEffectEvent
  - Update product detail page to use `useEffectEvent` for view tracking
  - Extract tracking callback into effect event
  - Remove non-reactive values from dependencies
  - Test tracking fires correctly on product changes
  - Verify other state changes don't trigger tracking
  - _Requirements: 5.4_

- [ ] 14. Audit and refactor 5+ existing useEffect hooks
  - Identify useEffect hooks with unnecessary dependencies
  - Refactor each to use `useEffectEvent` where appropriate
  - Document which effects were refactored and why
  - Test each refactored effect for correct behavior
  - Verify performance improvements from reduced re-renders
  - _Requirements: 5.5_

- [ ] 15. Implement parallel routes for profile dashboard
  - Create parallel route structure: `@sidebar` and `@content` slots
  - Implement profile layout accepting parallel slots
  - Create sidebar navigation with independent routing
  - Build default.tsx files for each parallel slot
  - Implement profile overview, orders, and settings views
  - Test independent navigation in each slot
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 16. Add Suspense boundaries to product pages
  - Wrap ProductHeader with Suspense and skeleton
  - Wrap ProductDetails with Suspense and skeleton
  - Wrap ProductReviews with Suspense and loading state
  - Wrap RelatedProducts with Suspense and loading state
  - Test progressive rendering of each section
  - _Requirements: 7.1, 7.5_

- [ ] 17. Add Suspense boundaries to product grid
  - Create ProductCardSkeleton component
  - Wrap product grid with Suspense boundary
  - Implement skeleton grid matching actual layout
  - Test loading states during navigation
  - Verify smooth transition from skeleton to content
  - _Requirements: 7.2_

- [ ] 18. Add Suspense boundaries to reviews section
  - Create ReviewCardSkeleton component
  - Wrap review list with Suspense boundary
  - Implement skeleton matching review card layout
  - Test loading states when fetching reviews
  - Add pagination loading states
  - _Requirements: 7.3_

- [ ] 19. Add Suspense boundaries to profile sections
  - Create profile section skeleton components
  - Wrap each profile section with Suspense
  - Implement skeletons for orders, settings, and overview
  - Test loading states for each parallel route slot
  - Verify independent loading of each section
  - _Requirements: 7.4_

- [ ] 20. Implement View Transitions for cart sidebar
  - Add view transition names to cart sidebar elements
  - Implement slide-in animation using View Transitions
  - Add slide-out animation for closing
  - Implement highlight animation for new items
  - Add CSS fallback for browsers without View Transitions support
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 21. Add progressive enhancement to all forms
  - Ensure forms work without JavaScript (server-side validation)
  - Add HTML5 validation attributes to form fields
  - Implement client-side validation with instant feedback
  - Add blur event handlers for field validation
  - Test forms with JavaScript disabled
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 22. Implement activity indicators for background operations
  - Create ActivityIndicator component for cart sync
  - Add activity indicator to cart icon during sync
  - Implement loading indicator for background data refresh
  - Add progress indicators for image preloading
  - Create activity indicator for wishlist sync
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 23. Implement modal interception for authentication
  - Create parallel route structure for auth modal
  - Implement intercepting route for sign-in modal
  - Build sign-in modal component with router.back()
  - Add full sign-in page for direct navigation
  - Implement cart sync after successful modal sign-in
  - Test modal vs full page based on navigation context
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 24. Implement prefetching for product links
  - Add hover prefetching to ProductCard components
  - Implement prefetching for category links
  - Add prefetching for next page in product grid
  - Implement prefetching for related products
  - Configure appropriate cache durations for prefetched data
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 25. Implement error boundaries with recovery
  - Create error boundary components for different sections
  - Add "Try Again" buttons that reset error boundaries
  - Implement retry logic for network errors
  - Add error boundaries to parallel route slots
  - Test error handling and recovery flows
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 26. Optimize images with Next.js Image component
  - Update all product images to use Next.js Image component
  - Configure appropriate sizes for responsive images
  - Add lazy loading for below-the-fold images
  - Implement priority loading for featured images
  - Add blur placeholders for loading states
  - Configure WebP and AVIF formats with fallbacks
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 27. Test View Transitions across browsers
  - Test View Transitions in Chrome/Edge (supported)
  - Test fallback behavior in Firefox/Safari (unsupported)
  - Verify smooth animations for product navigation
  - Test View Transitions with slow network conditions
  - Document browser compatibility and fallback behavior
  - _Requirements: 1.4_

- [ ] 28. Test optimistic updates with network failures
  - Simulate network failures during cart operations
  - Verify optimistic updates revert on error
  - Test error messages display correctly
  - Verify cart state consistency after failures
  - Test retry mechanisms for failed operations
  - _Requirements: 2.3_

- [ ] 29. Test modal interception flows
  - Test modal opening from product grid
  - Test modal closing with back button
  - Test modal closing with Escape key
  - Test modal closing with click outside
  - Test direct navigation to product URL shows full page
  - Test URL sharing opens full page for recipients
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 30. Test form submissions with Server Actions
  - Test contact form submission with valid data
  - Test contact form with validation errors
  - Test review form submission with optimistic updates
  - Test form behavior without JavaScript
  - Test concurrent form submissions
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 31. Test parallel routes navigation
  - Test independent navigation in profile sidebar
  - Test content updates in parallel slots
  - Test URL state for parallel routes
  - Test refresh behavior with parallel routes
  - Test default fallbacks for parallel slots
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 32. Performance testing and optimization
  - Measure Core Web Vitals before and after migration
  - Test prefetching impact on navigation speed
  - Measure reduction in unnecessary re-renders from useEffectEvent
  - Test Suspense streaming performance
  - Optimize bundle size with code splitting
  - _Requirements: All_

- [ ] 33. Accessibility testing
  - Test keyboard navigation for all interactive elements
  - Test screen reader compatibility with modals
  - Verify focus management in modal interception
  - Test form accessibility with validation errors
  - Verify ARIA labels and semantic HTML
  - _Requirements: All_

- [ ] 34. Cross-browser compatibility testing
  - Test in Chrome, Firefox, Safari, and Edge
  - Verify View Transitions fallback in unsupported browsers
  - Test React 19 features across browsers
  - Verify progressive enhancement works everywhere
  - Document any browser-specific issues
  - _Requirements: All_

- [ ] 35. Mobile responsiveness testing
  - Test View Transitions on mobile devices
  - Test modal interception on touch devices
  - Verify optimistic updates on slow mobile networks
  - Test form submissions on mobile
  - Verify touch interactions for all components
  - _Requirements: All_

- [ ] 36. Documentation and migration guide
  - Document all new patterns and hooks used
  - Create migration guide for team members
  - Document browser compatibility and fallbacks
  - Add code examples for common patterns
  - Update project README with new features
  - _Requirements: All_
