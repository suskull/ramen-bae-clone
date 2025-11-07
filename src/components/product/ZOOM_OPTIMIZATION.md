# Zoom Optimization Explanation

## Problem

The initial implementation was causing the image to re-fetch on every mouse move during zoom because:

1. `onMouseMove` handler was calling `setMousePosition()` on every mouse movement
2. `onMouseEnter`/`onMouseLeave` were calling `setIsZoomed()` 
3. These triggered React re-renders
4. The `Image` component received new props (style with updated transformOrigin)
5. React treated it as a new image and re-fetched it from the server

## Solution

We optimized the zoom functionality to avoid React re-renders entirely by eliminating ALL state updates:

### Key Changes

1. **CSS Variables Instead of State for Position**
   - Use CSS custom properties (`--zoom-x`, `--zoom-y`) for transform origin
   - Update these variables directly via DOM manipulation
   - No React state updates = no re-renders

2. **Pure CSS Hover for Zoom**
   - Use `group-hover:scale-150` instead of `isZoomed` state
   - CSS handles the zoom trigger automatically
   - No `onMouseEnter`/`onMouseLeave` state updates needed

3. **Direct DOM Manipulation**
   ```typescript
   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
     if (!imageWrapperRef.current) return
     
     // Calculate position
     const x = ((e.clientX - rect.left) / rect.width) * 100
     const y = ((e.clientY - rect.top) / rect.height) * 100
     
     // Update CSS variables directly (no React re-render)
     imageWrapperRef.current.style.setProperty('--zoom-x', `${x}%`)
     imageWrapperRef.current.style.setProperty('--zoom-y', `${y}%`)
   }
   ```

4. **Wrapper Div for Transform**
   - Wrap the `Image` component in a div
   - Apply transform to the wrapper, not the Image
   - Image component props remain stable

5. **Static Transform Origin with CSS Variables**
   ```tsx
   <div
     className="group-hover:scale-150"
     style={{
       transformOrigin: 'var(--zoom-x, 50%) var(--zoom-y, 50%)',
     }}
   >
     <Image ... />
   </div>
   ```

## Benefits

✅ **Zero re-renders** during mouse movement  
✅ **No image re-fetching** from server  
✅ **Smooth 60fps zoom** performance  
✅ **Reduced network traffic**  
✅ **Better user experience**  

## Performance Comparison

### Before (State-based)
- Mouse enter → `setIsZoomed(true)` → Re-render
- Mouse move → `setMousePosition()` → Re-render → Image re-fetch → Network request
- Mouse leave → `setIsZoomed(false)` → Re-render
- ~100+ re-renders per second during zoom
- Multiple HTTP requests per second

### After (Pure CSS + CSS Variables)
- Mouse enter → CSS `:hover` pseudo-class (no React)
- Mouse move → Update CSS variable → Browser repaint (no React)
- Mouse leave → CSS `:hover` ends (no React)
- **0 re-renders** during entire zoom interaction
- **0 HTTP requests** during zoom
- Only browser-level repaints (GPU accelerated)

## Technical Details

The browser's rendering engine handles CSS variable updates efficiently:
1. CSS variable change triggers a style recalculation
2. Transform is GPU-accelerated (composite layer)
3. No layout recalculation needed
4. No React reconciliation overhead
5. Image element remains stable in the DOM

This is a common pattern for high-performance interactions where you need smooth animations without React's overhead.
