# Context7 MCP Usage Rule

## Always Use Context7 for Latest Documentation

When working on this project, **ALWAYS** use the Context7 MCP to fetch the latest library documentation and code examples instead of relying on potentially outdated knowledge.

## When to Use Context7

Use Context7 MCP in these scenarios:

1. **Before writing code** that uses external libraries (Supabase, Stripe, Resend, etc.)
2. **When updating existing code** to ensure you're using current best practices
3. **When debugging** to verify correct API usage
4. **When creating examples** or documentation to ensure accuracy
5. **When answering questions** about library features or syntax

## How to Use Context7

### Step 1: Resolve Library ID

```
Use: mcp_Context7_resolve_library_id
Parameter: libraryName (e.g., "supabase", "stripe", "next.js")
```

### Step 2: Fetch Documentation

```
Use: mcp_Context7_get_library_docs
Parameters:
  - context7CompatibleLibraryID (from step 1)
  - topic (optional, e.g., "edge functions", "authentication")
  - tokens (default: 5000, adjust based on need)
```

## Example Workflow

```typescript
// Before writing Supabase Edge Function code:
1. Resolve: mcp_Context7_resolve_library_id("supabase")
2. Get docs: mcp_Context7_get_library_docs("/supabase/supabase", "edge functions")
3. Review latest syntax and best practices
4. Write code using current patterns
```

## Libraries to Always Check

- **Supabase** (`/supabase/supabase`) - Database, Auth, Edge Functions, Storage
- **Supabase JS** (`/supabase/supabase-js`) - JavaScript client library
- **Next.js** (`/vercel/next.js`) - Framework features and patterns
- **Stripe** - Payment processing
- **Resend** - Email sending
- **React** - Component patterns
- **TypeScript** - Type definitions and patterns

## Benefits

1. **Always Current**: Get the latest API syntax and features
2. **Avoid Deprecations**: Don't use outdated patterns
3. **Best Practices**: Learn recommended approaches from official docs
4. **Code Examples**: Access real, tested code snippets
5. **Version Specific**: Can target specific library versions if needed

## Important Notes

- Context7 provides **official documentation** and **code snippets**
- Trust scores indicate documentation quality (prefer 7.5+)
- Code snippet counts show documentation coverage
- Always verify the library ID matches your needs
- Use specific topics to get focused, relevant documentation

## This Rule Applies To

- All code generation tasks
- Documentation creation
- Code reviews and updates
- Debugging and troubleshooting
- Learning module content creation
- Example implementations

**Remember**: When in doubt about library usage, check Context7 first!
