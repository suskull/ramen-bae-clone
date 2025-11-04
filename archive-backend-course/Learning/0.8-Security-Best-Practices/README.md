# Module 8: Security Best Practices

Learn to build secure applications and protect against common vulnerabilities.

## What You'll Learn

- Common security vulnerabilities
- SQL injection prevention
- XSS (Cross-Site Scripting) protection
- CSRF protection
- Input validation and sanitization
- API security
- Rate limiting
- Secure data handling

## Why Security Matters

One security breach can:
- Expose user data
- Damage reputation
- Result in legal issues
- Cost money and time
- Lose customer trust

## Quick Start

1. Understand OWASP Top 10
2. Test your app for vulnerabilities
3. Implement security measures
4. Regular security audits

## Structure

- `exercises/` - Hands-on security testing
- `theory/` - Vulnerability explanations
- `examples/` - Secure code patterns
- `QUICK-START.md` - Security checklist
- `security-reference.md` - Best practices

## Prerequisites

- Completed Module 6 (Edge Functions)
- Understanding of web security basics
- Knowledge of common attack vectors
- Testing mindset

## Learning Path

1. **Exercise 01**: SQL injection testing and prevention
2. **Exercise 02**: XSS protection
3. **Exercise 03**: Input validation
4. **Exercise 04**: API security
5. **Exercise 05**: Rate limiting
6. **Exercise 06**: Security audit

## Key Vulnerabilities

### SQL Injection
```typescript
// ❌ VULNERABLE
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ SAFE (Supabase handles this)
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', email);
```

### XSS
```typescript
// ❌ VULNERABLE
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SAFE
<div>{userInput}</div>
```

### Input Validation
```typescript
// ✅ Always validate
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(120)
});
```

## Security Checklist

- [ ] Input validation on all user data
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] HTTPS only
- [ ] Secure headers
- [ ] Environment variables for secrets
- [ ] Regular security audits
- [ ] Error handling (don't expose internals)

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Academy](https://portswigger.net/web-security)
- [Supabase Security](https://supabase.com/docs/guides/platform/going-into-prod#security)

Let's build secure applications! 🔒
