# Design Consistency Checklist

## Quick Reference Guide for Maintaining Design Standards

### Color Palette

#### Primary Colors
```css
--color-primary: #fe90b8        /* Main brand pink */
--color-primary-light: #F999BF  /* Light pink for gradients */
--color-primary-dark: #ff3977   /* Dark pink for hover states */
--color-accent: #96da2f         /* Accent green */
```

#### Usage Guidelines
- ✅ **DO:** Use `bg-primary`, `text-primary`, `border-primary` classes
- ❌ **DON'T:** Use hardcoded hex values like `bg-[#fe90b8]`
- ✅ **DO:** Use CSS variables for custom styles: `style={{ color: 'var(--color-primary)' }}`

### Typography

#### Font Family
- **Primary:** Poppins (all weights: 300, 400, 500, 600, 700)
- **Applied via:** `--font-poppins` CSS variable

#### Font Sizes (Responsive)
```
Headings:
- H1: text-4xl sm:text-5xl lg:text-6xl xl:text-7xl
- H2: text-3xl sm:text-4xl lg:text-5xl
- H3: text-xl sm:text-2xl

Body:
- Base: text-base (16px)
- Small: text-sm (14px)
- Large: text-lg sm:text-xl
```

#### Font Weights
```
- Headings: font-bold
- Subheadings: font-semibold
- Body: font-normal (default)
- Labels: font-semibold
- Links: font-medium
- Buttons: font-semibold
```

### Spacing

#### Section Padding
```
Vertical: py-16 sm:py-20 lg:py-24
Horizontal: px-4 sm:px-6 lg:px-8
```

#### Component Spacing
```
Cards: p-4 sm:p-6 lg:p-8
Buttons: px-4 py-2 (default), px-8 py-6 (large)
Grid Gaps: gap-4 sm:gap-6 lg:gap-8
Text Stacks: space-y-4 sm:space-y-6
```

#### Touch Targets
- **Minimum:** 44px x 44px (mobile-friendly)
- **Buttons:** min-h-[44px]
- **Icon Buttons:** min-h-[44px] min-w-[44px]

### Animations & Transitions

#### Timing
```
Duration: 200-300ms (standard)
Easing: ease-out (most interactions)
Hover Scale: scale(1.05) or scale(1.02)
```

#### Framer Motion Patterns
```typescript
// Fade in
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3, ease: "easeOut" }}

// Hover scale
whileHover={{ scale: 1.05 }}
transition={{ type: "spring", stiffness: 300, damping: 20 }}
```

### Gradients

#### Background Gradients
```
Hero: bg-linear-to-br from-white via-pink-50/30 to-pink-100/50
Cards: bg-linear-to-br from-pink-50 to-pink-100/50
Sections: bg-linear-to-br from-primary/10 to-accent/10
Progress: bg-linear-to-r from-primary to-primary-light
```

### Shadows

#### Elevation Hierarchy
```
Cards: shadow-sm hover:shadow-md
Modals: shadow-lg
Overlays: shadow-xl
Buttons: shadow hover:shadow-lg
```

### Border Radius

#### Standard Sizes
```
Small: rounded-md (0.375rem)
Default: rounded-lg (0.5rem)
Large: rounded-xl (0.75rem)
Extra Large: rounded-2xl (1rem)
Pills: rounded-full
```

### Component Patterns

#### Buttons
```typescript
// Primary CTA
<Button variant="primary" size="lg" className="rounded-full">
  Shop Now
</Button>

// Secondary
<Button variant="outline" size="default">
  Learn More
</Button>
```

#### Cards
```typescript
<div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
  {/* Content */}
</div>
```

#### Links
```typescript
<Link 
  href="/path"
  className="text-primary hover:text-primary/80 transition-colors duration-200"
>
  Link Text
</Link>
```

### Responsive Breakpoints

```
Mobile: < 640px (sm)
Tablet: 640px - 1024px (md, lg)
Desktop: > 1024px (xl, 2xl)
```

#### Mobile-First Approach
```typescript
// Start with mobile, add larger breakpoints
className="text-base sm:text-lg lg:text-xl"
className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
```

### Accessibility

#### Focus States
```
focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
```

#### Color Contrast
- Text on white: Minimum WCAG AA (4.5:1)
- Primary buttons: White text on primary background
- Links: Distinguishable from body text

#### Touch Targets
- Minimum 44px x 44px
- Add `touch-manipulation` class for better mobile UX

### Common Mistakes to Avoid

❌ **DON'T:**
- Use hardcoded hex colors
- Mix font families
- Use inconsistent spacing values
- Forget responsive breakpoints
- Skip hover/focus states
- Use arbitrary values without reason

✅ **DO:**
- Use CSS variables and Tailwind classes
- Maintain font hierarchy
- Follow spacing system
- Test on mobile devices
- Add proper transitions
- Use semantic HTML

### Quick Verification Commands

```bash
# Check for hardcoded colors
grep -r "bg-\[#\|text-\[#\|border-\[#" src/

# Check for font consistency
grep -r "font-family" src/

# Check for spacing consistency
grep -r "p-\[.*\]|m-\[.*\]" src/
```

### Design Review Checklist

Before committing changes, verify:

- [ ] Colors use CSS variables or Tailwind classes
- [ ] Typography follows hierarchy
- [ ] Spacing is consistent with system
- [ ] Animations have proper timing
- [ ] Components are responsive
- [ ] Touch targets are adequate (44px min)
- [ ] Focus states are visible
- [ ] Hover effects are smooth
- [ ] Brand identity is maintained
- [ ] No console errors or warnings

---

**Last Updated:** November 15, 2025  
**Maintained by:** Development Team
