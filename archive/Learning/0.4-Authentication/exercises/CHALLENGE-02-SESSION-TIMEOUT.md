# Challenge 02: Session Timeout Implementation

## Overview

Automatic logout after inactivity is a critical security feature that protects user accounts when they step away from their device. This implementation provides:

- ⏱️ Configurable timeout duration
- ⚠️ Warning modal before logout
- 🔄 Activity tracking (mouse, keyboard, scroll)
- 🎯 Countdown timer
- 🚀 Easy to customize

## Architecture

### Components Created

1. **SessionTimeoutProvider** (`src/components/session-timeout-provider.tsx`)
   - Wraps the entire app
   - Shows warning modal
   - Manages countdown timer
   - Handles logout

2. **useSessionTimeout Hook** (`src/hooks/useSessionTimeout.ts`)
   - Tracks user activity
   - Manages timeout timers
   - Throttles activity events
   - Triggers callbacks

3. **Session Config** (`src/lib/auth/session-config.ts`)
   - Centralized configuration
   - Easy to adjust timeouts
   - Enable/disable feature

## How It Works

```
User Activity → Reset Timer → Continue Session
     ↓
No Activity (25 min) → Warning Modal → User Choice
     ↓                                      ↓
Continue Waiting (5 min)          Stay Logged In
     ↓                                      ↓
Auto Logout                        Reset Timer
```

### Activity Events Tracked

- Mouse movement
- Mouse clicks
- Keyboard input
- Scrolling
- Touch events

All events are throttled to once per second to avoid excessive timer resets.

## Configuration

### Adjust Timeout Duration

Edit `src/lib/auth/session-config.ts`:

```typescript
export const SESSION_CONFIG = {
  TIMEOUT_MINUTES: 30,    // Total session timeout
  WARNING_MINUTES: 5,     // Warning before timeout
  ENABLED: true,          // Enable/disable feature
} as const;
```

### Recommended Settings

**High Security Apps** (Banking, Healthcare):
```typescript
TIMEOUT_MINUTES: 15
WARNING_MINUTES: 3
```

**Standard Apps** (E-commerce, SaaS):
```typescript
TIMEOUT_MINUTES: 30
WARNING_MINUTES: 5
```

**Low Security Apps** (Blogs, Forums):
```typescript
TIMEOUT_MINUTES: 60
WARNING_MINUTES: 10
```

## Testing

### Quick Test Setup

For faster testing, temporarily adjust the config:

```typescript
export const SESSION_CONFIG = {
  TIMEOUT_MINUTES: 2,     // 2 minutes total
  WARNING_MINUTES: 1,     // 1 minute warning
  ENABLED: true,
};
```

### Test Scenarios

1. **Normal Activity**
   - Navigate the app normally
   - Timer should reset with each interaction
   - No warning should appear

2. **Inactivity Warning**
   - Stop all activity (don't move mouse)
   - Wait for warning period
   - Warning modal should appear with countdown

3. **Stay Logged In**
   - Click "Stay Logged In" button
   - Timer should reset
   - Modal should close

4. **Auto Logout**
   - Let countdown reach zero
   - Should redirect to login page
   - Should show "Session expired" message

5. **Manual Logout**
   - Click "Log Out Now" in warning modal
   - Should immediately log out
   - Should redirect to login

### Demo Page

Visit `/dashboard/session-demo` to see:
- Activity counter
- Last activity timestamp
- Testing instructions
- Manual logout button

## Implementation Details

### Provider Integration

The provider is added to the root layout:

```typescript
// src/app/layout.tsx
import SessionTimeoutProvider from "@/components/session-timeout-provider";
import { SESSION_CONFIG } from "@/lib/auth/session-config";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionTimeoutProvider
          timeoutMinutes={SESSION_CONFIG.TIMEOUT_MINUTES}
          warningMinutes={SESSION_CONFIG.WARNING_MINUTES}
        >
          {children}
        </SessionTimeoutProvider>
      </body>
    </html>
  );
}
```

### Activity Tracking

The hook tracks multiple event types:

```typescript
const events = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
];
```

Events are throttled to prevent excessive timer resets:

```typescript
let throttleTimeout: NodeJS.Timeout;
const handleActivity = () => {
  if (!throttleTimeout) {
    throttleTimeout = setTimeout(() => {
      resetTimer();
      throttleTimeout = undefined as any;
    }, 1000); // Once per second
  }
};
```

### Timer Management

Two timers are used:

1. **Warning Timer**: Triggers warning modal
2. **Timeout Timer**: Triggers automatic logout

```typescript
// Warning timer (25 minutes with default config)
const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;
warningRef.current = setTimeout(() => {
  onWarning?.();
}, warningMs);

// Timeout timer (30 minutes with default config)
const timeoutMs = timeoutMinutes * 60 * 1000;
timeoutRef.current = setTimeout(() => {
  logout();
}, timeoutMs);
```

## Customization

### Custom Warning Modal

Replace the modal in `session-timeout-provider.tsx`:

```typescript
{showWarning && (
  <YourCustomWarningModal
    countdown={countdown}
    onStayLoggedIn={handleStayLoggedIn}
    onLogout={handleLogout}
  />
)}
```

### Custom Activity Events

Add more events to track:

```typescript
const events = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
  'focus',        // Add focus tracking
  'blur',         // Add blur tracking
  'visibilitychange', // Add tab visibility
];
```

### Per-Route Timeout

Create route-specific providers:

```typescript
// app/admin/layout.tsx
<SessionTimeoutProvider timeoutMinutes={15} warningMinutes={3}>
  {children}
</SessionTimeoutProvider>

// app/dashboard/layout.tsx
<SessionTimeoutProvider timeoutMinutes={30} warningMinutes={5}>
  {children}
</SessionTimeoutProvider>
```

## Advanced Features

### Remember Me Option

Add a "Remember Me" checkbox that extends the session:

```typescript
const [rememberMe, setRememberMe] = useState(false);

<SessionTimeoutProvider
  timeoutMinutes={rememberMe ? 1440 : 30} // 24 hours vs 30 min
  warningMinutes={rememberMe ? 60 : 5}
>
  {children}
</SessionTimeoutProvider>
```

### Session Extension API

Track session extensions in the database:

```typescript
const handleStayLoggedIn = async () => {
  setShowWarning(false);
  resetTimer();
  
  // Log session extension
  await supabase.from('session_extensions').insert({
    user_id: user.id,
    extended_at: new Date().toISOString(),
  });
};
```

### Analytics

Track timeout events:

```typescript
const logout = useCallback(async () => {
  // Log timeout event
  await fetch('/api/analytics/session-timeout', {
    method: 'POST',
    body: JSON.stringify({
      user_id: user.id,
      timeout_at: new Date().toISOString(),
    }),
  });
  
  await supabase.auth.signOut();
  router.push('/login?message=Session expired');
}, [supabase, router, user]);
```

## Security Considerations

### Why Session Timeout Matters

1. **Unattended Devices**: Protects accounts on shared computers
2. **Public Spaces**: Prevents unauthorized access in cafes, libraries
3. **Compliance**: Required by many security standards (PCI-DSS, HIPAA)
4. **Token Expiry**: Aligns with JWT token expiration

### Best Practices

1. **Match Token Expiry**: Ensure timeout matches Supabase token expiry
2. **Warn Users**: Always show warning before logout
3. **Save Work**: Consider auto-saving before timeout
4. **Clear Sensitive Data**: Clear any cached sensitive information
5. **Audit Logs**: Track timeout events for security monitoring

### Supabase Token Configuration

Supabase tokens expire after 1 hour by default. Adjust in Supabase Dashboard:

```
Authentication → Settings → JWT Expiry
```

Ensure your session timeout is less than JWT expiry.

## Troubleshooting

### Warning Not Appearing

1. Check if user is authenticated
2. Verify SESSION_CONFIG.ENABLED is true
3. Check browser console for errors
4. Ensure provider is wrapping authenticated routes

### Timer Not Resetting

1. Check if events are being tracked (add console.log)
2. Verify throttle timeout is working
3. Check if event listeners are attached
4. Test with different activity types

### Logout Not Working

1. Check Supabase client configuration
2. Verify auth.signOut() is being called
3. Check network tab for API calls
4. Ensure router.push() is redirecting

### Modal Styling Issues

1. Check z-index (should be 50+)
2. Verify Tailwind classes are compiled
3. Test on different screen sizes
4. Check for conflicting CSS

## Performance

### Optimization Tips

1. **Throttle Events**: Already implemented (1 second)
2. **Debounce Timer Resets**: Avoid excessive setTimeout calls
3. **Cleanup Listeners**: Always remove event listeners
4. **Lazy Load Modal**: Only render when needed

### Memory Management

The implementation properly cleans up:

```typescript
return () => {
  events.forEach((event) => {
    window.removeEventListener(event, handleActivity);
  });
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
  if (warningRef.current) clearTimeout(warningRef.current);
};
```

## Next Steps

### Additional Challenges

1. **Multi-Tab Sync**: Sync timeout across browser tabs
2. **Server-Side Validation**: Validate session on server
3. **Graceful Degradation**: Handle offline scenarios
4. **Custom Notifications**: Use toast notifications instead of modal
5. **Session History**: Track all session extensions

### Related Exercises

- Exercise 03: Social Login (OAuth)
- Exercise 04: Two-Factor Authentication
- Exercise 05: Role-Based Access Control

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [OWASP Session Management](https://owasp.org/www-community/controls/Session_Management_Cheat_Sheet)

## Summary

You've successfully implemented:

✅ Automatic session timeout after inactivity
✅ Warning modal with countdown timer
✅ Activity tracking across multiple event types
✅ Configurable timeout durations
✅ Demo page for testing
✅ Comprehensive documentation

This feature significantly improves the security of your application by ensuring unattended sessions are automatically terminated.
