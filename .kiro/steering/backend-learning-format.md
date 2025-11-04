---
inclusion: manual
---

# Backend Learning Module Format

When creating backend learning exercises, follow this standardized format based on the `Learning/` folder structure.

## Folder Structure

```
Learning/
└── [module-number]-[module-name]/
    ├── README.md                    # Module overview
    ├── setup-guide.md              # Environment setup
    ├── theory/                      # Conceptual guides
    │   ├── [topic]-fundamentals.md
    │   └── [topic]-guide.md
    ├── exercises/                   # Hands-on practice
    │   ├── 01-[topic].sql/.js/.ts
    │   ├── 02-[topic].sql/.js/.ts
    │   ├── 03-[topic].sql/.js/.ts
    │   └── 04-[topic].sql/.js/.ts
    ├── solutions/                   # Complete solutions
    │   └── [exercise]-solutions.md
    ├── schemas/                     # Database schemas (if applicable)
    │   └── [schema].sql
    └── examples/                    # Real-world examples
        └── [example].md
```

## README.md Format

Must include:
- **Status** and **Estimated Duration**
- **Learning Objectives** (Primary and Secondary goals)
- **What You'll Build** section
- **Folder Structure** overview
- **Learning Journey** with time estimates
- **Why This Matters** (connection to real projects)
- **Progress Tracking** checklist
- **Success Criteria**

Use emojis for visual appeal: 🎯 🏗️ 📁 🚀 💡 🔗 📊 🎓

## Exercise File Format

### Header
```
-- 🏋️ Exercise [Number]: [Title]
-- [Brief description]
-- Estimated time: [X] minutes
```

### Structure
1. **SETUP section** - Create tables and insert sample data
2. **PART sections** - Organized by topic (A, B, C, etc.)
3. **Individual exercises** - Numbered within parts
4. **Challenge section** - Advanced exercises at end
5. **Cleanup section** - Optional table drops
6. **Completion checklist** - Track progress

### Exercise Format
```
-- Exercise X.Y: [Title]
-- Goal: [What you'll learn]
-- TODO: [Clear instruction]

-- YOUR CODE HERE:


-- SOLUTION (commented out):
-- [Complete solution]
```

### Key Principles
- **Progressive difficulty** - Start simple, build complexity
- **Clear instructions** - Specific TODO comments
- **Hidden solutions** - Commented out to encourage practice
- **Real-world context** - Use practical examples
- **Frontend analogies** - Connect to familiar concepts
- **Completion tracking** - Checklist at end

## Theory File Format

### Structure
- Clear section headers with ##
- Code examples in both SQL and JavaScript/TypeScript
- **Frontend Analogy** sections to connect concepts
- **When to use** guidance
- **Best Practices** section
- **Common Mistakes** section (❌ Bad vs ✅ Good)
- **Next Steps** with links
- **Resources** section

### Writing Style
- Conversational and approachable
- Use analogies to frontend development
- Include visual examples
- Explain the "why" not just the "how"
- Keep paragraphs short and scannable

## Setup Guide Format

Must include:
- **Multiple setup options** (Docker, cloud, local, online)
- **Docker option** - Recommended for learning Docker in parallel
- **Step-by-step instructions** with commands
- **Access information** (URLs, credentials)
- **Testing section** - Verify setup works
- **Troubleshooting** - Common issues and fixes
- **Verification checklist**
- **Next steps** after setup

### Docker Integration
- Provide `docker-compose.yml` file
- Include Docker learning exercises
- Explain Docker concepts as you use them
- Show Docker commands alongside SQL/code
- Create init scripts for automated setup

## Naming Conventions

### Files
- Use kebab-case: `database-fundamentals.md`
- Number exercises: `01-basic-crud.sql`
- Descriptive names: `relationships-guide.md`

### Folders
- Use kebab-case: `0.2-Database-Basics`
- Include module number: `0.3-API-Development`
- Descriptive: `theory/`, `exercises/`, `solutions/`

### SQL
- Tables: plural, snake_case: `products`, `order_items`
- Columns: snake_case: `created_at`, `user_id`
- Foreign keys: `[table]_id`: `category_id`, `author_id`

## Content Guidelines

### Exercise Difficulty Progression
1. **Exercise 1**: Basic operations (CRUD, simple queries)
2. **Exercise 2**: Relationships (JOINs, foreign keys)
3. **Exercise 3**: Advanced patterns (CTEs, window functions)
4. **Exercise 4**: Real-world scenarios (practical applications)

### Time Estimates
- Exercise 1: 60 minutes
- Exercise 2: 90 minutes
- Exercise 3: 60 minutes
- Exercise 4: 90 minutes
- Total module: 2-3 days

### Sample Data
- Use realistic examples (e-commerce, blog, social media)
- Include enough data to make queries interesting
- Connect to user's actual project when possible
- Use relatable names and scenarios

## Quality Checklist

Before publishing a module:
- [ ] README has all required sections
- [ ] Setup guide tested and works
- [ ] All exercises have clear TODOs
- [ ] Solutions are commented out
- [ ] Theory files have frontend analogies
- [ ] Completion checklists included
- [ ] Time estimates provided
- [ ] Real-world examples included
- [ ] Consistent formatting throughout
- [ ] No typos or broken links

## Example Reference

See `Learning/0.2-Database-Basics/` for a complete example following this format.

## Future Modules

Apply this format to:
- 0.3-API-Development
- 0.4-Authentication
- 0.5-File-Storage
- 0.6-Real-Time-Features
- 0.7-Deployment
- And all subsequent backend modules

## Adaptation for Different Technologies

### For JavaScript/TypeScript exercises
- Use `.js` or `.ts` file extensions
- Include setup instructions for Node.js/Deno
- Provide package.json or import maps
- Include type definitions where applicable

### For API exercises
- Include HTTP client examples (fetch, axios)
- Show request/response examples
- Include Postman/Thunder Client collections
- Demonstrate error handling

### For Docker/DevOps exercises
- Include docker-compose.yml files
- Provide Dockerfile examples
- Show CLI commands with explanations
- Include troubleshooting for common issues
- Create init scripts for automated setup
- Explain Docker concepts (images, containers, volumes, networks)
- Provide Docker learning exercises alongside main content

---

**Remember**: The goal is to make learning practical, progressive, and connected to real-world development. Always relate new concepts to what the learner already knows (especially frontend development).
