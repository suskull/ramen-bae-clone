# Quick Start: Session Timeout

## What Was Implemented

Automatic logout after 30 minutes of inactivity with a 5-minute warning.

## Files Created

1. `src/components/session-timeout-provider.tsx` - Main provider component
2. `src/hooks/useSessionTimeout.ts` - Activity tracking hook
3. `src/lib/auth/session-config.ts` - Configuration file
4. `src/app/dashboard/session-demo/page.tsx` - Demo page
5. `src/app/dashboard/session-demo/session-demo-client.tsx` - Demo client component

## Files Modified

- `src/app/layout.tsx` - Added SessionTimeoutProvider wrapper

## How to Test

### Quick Test (2 minutes)

1. **Adjust timeout for faster testing:**
   ```typescript
   // src/lib/auth/session-config.ts
   export const SESSION_CONFIG = {
     TIMEOUT_MINUTES: 2,  // Change from 30 to 2
     WARNING_MINUTES: 1,  // Change from 5 to 1
     ENABLED: true,
   };
   ```

2. **Start the dev server:**
   ```bash
   npm run dev
   ```

3. **Log in to your app**

4. **Visit the demo page:**
   ```
   http://localhost:3000/dashboard/session-demo
   ```

5. **Stop all activity:**
   - Don't move your mouse
   - Don't press any keys
   - Don't scroll

6. **Wait 1 minute** - Warning modal appears

7. **Wait another minute** - Auto logout

### Production Test (30 minutes)

1. **Restore production settings:**
   ```typescript
   // src/lib/auth/session-config.ts
   export const SESSION_CONFIG = {
     TIMEOUT_MINUTES: 30,
     WARNING_MINUTES: 5,
     ENABLED: true,
   };
   ```

2. **Test the full flow** (requires 30 minutes of waiting)

## Configuration Options

### Timeout Duration

```typescript
// src/lib/auth/session-config.ts
TIMEOUT_MINUTES: 30  // Total session timeout
WARNING_MINUTES: 5   // Warning before timeout
```

### Disable Feature

```typescript
ENABLED: false  // Turns off session timeout
```

### Per-Route Timeout

Wrap specific routes with custom timeouts:

```typescript
// app/admin/layout.tsx
<SessionTimeoutProvider timeoutMinutes={15} warningMinutes={3}>
  {children}
</SessionTimeoutProvider>
```

## What Happens

1. **User is active** → Timer resets continuously
2. **User goes idle for 25 min** → Warning modal appears
3. **User clicks "Stay Logged In"** → Timer resets, modal closes
4. **User ignores warning for 5 min** → Auto logout, redirect to login
5. **User clicks "Log Out Now"** → Immediate logout

## Activity Tracking

These actions reset the timer:
- Mouse movement
- Mouse clicks
- Keyboard input
- Scrolling
- Touch events

## Troubleshooting

### Warning not showing?
- Check if you're logged in
- Verify `ENABLED: true` in config
- Check browser console for errors

### Timer not resetting?
- Try different activity types (mouse, keyboard)
- Check if events are throttled (1 second delay)

### Logout not working?
- Check Supabase configuration
- Verify `.env.local` has correct keys
- Check network tab for auth errors

## Security Notes

- Default 30-minute timeout is industry standard
- Adjust based on your security requirements
- Banking apps: 15 minutes
- Standard apps: 30 minutes
- Low security: 60+ minutes

## Next Steps

1. Test with the quick 2-minute timeout
2. Adjust to your preferred duration
3. Test in production
4. Monitor user feedback
5. Consider adding analytics

## Documentation

Full documentation: `Learning/0.4-Authentication/exercises/CHALLENGE-02-SESSION-TIMEOUT.md`

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review the full documentation
3. Check browser console for errors
4. Verify Supabase configuration
