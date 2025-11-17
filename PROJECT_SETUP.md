# Project Setup Checklist

This checklist guides you through setting up a new project with all AI optimizations and quality tools.

## ⏱️ Estimated time: 15-20 minutes

---

## Phase 1: Create Project (5 min)

### Step 1: Initialize Next.js Project
```bash
npx create-next-app@latest my-project-name
# Choose options:
# ✅ TypeScript
# ✅ ESLint
# ✅ Tailwind CSS
# ✅ App Router
# ✅ src/ directory? - No (unless you want to)
```

### Step 2: Change to Project Directory
```bash
cd my-project-name
```

### Step 3: Initialize Git Repository
```bash
git init
git add .

`git commit -m "Initial Next.js setup"`

```

---

## Phase 2: AI Configuration (10 min)

### Step 4: Copy Template Files

**Copy from your template folder:**
```
From: C:\coden\__project-templates\nextjs-ai-starter\

Copy:
├── AI_CONTEXT.md.template → AI_CONTEXT.md
├── AI_DEVELOPMENT_GUIDE.md (copy directly)
├── .github/
│ └── copilot-instructions.md.template → copilot-instructions.md
├── .cursorrules.template → .cursorrules
├── .editorconfig (copy directly)
├── .vscode/
│ ├── settings.json (copy directly)
│ └── extensions.json (copy directly)
├── cspell.json (copy directly)
└── scripts/
└── analyze-database.ts (if database)
```

### Step 5: Customize Project-Specific Files

**AI_CONTEXT.md:**
```markdown
- [ ] Change Project Name
- [ ] Customize Project Description
- [ ] Customize Stack/Technologies
- [ ] List Database Tables (if any)
```

**copilot-instructions.md:**
```markdown
- [ ] Change Project Name
- [ ] Stack Description Adjust
- [ ] List main features
```

**.cursorrules:**
```markdown
- [ ] Change project name
- [ ] Adjust Quick Reference
```

### Step 6: Check Dependencies
```bash
# Check if these are in package.json:

npm install -D eslint prettier husky lint-staged
```

---

## Phase 3: Code Quality Tools (5 min)

### Step 7: Set up Husky
```bash
# Install & initialize Husky

npx husky-init && npm install

# Create pre-commit hook

npx husky add .husky/pre-commit "npm run lint-staged"
```

### Step 8: Add Scripts to package.json
```json
{

"scripts": {

"lint": "next lint",

"format": "prettier --write .",

"format:check": "prettier --check .",

"quality": "npm run format && npm run lint"

},

"lint-staged": {

"*.{js,jsx,ts,tsx}": [

"eslint --fix",

"prettier --write"

],

"*.{json,md}": [

"prettier --write"

]

}
}
```

### Step 9: Environment Variables
```bash
# Create .env.local
- [ ] Copy .env.example to .env.local
- [ ] Enter your credentials
```

---

## Phase 4: Database Setup (if applicable)

### Step 10: Configure Supabase
```bash
- [ Create a Supabase project

- Database URL & Keys in .env.local

- Service Role Key (for server actions only!)

### Step 11: Set up database analysis

bash
# Script in package.json:

"db:analyze": "tsx scripts/analyze-database.ts"

# Run:

npm run db:analyze

---

## Phase 5: Validation & Testing (5 min)

### Step 12: Reload VS Code

Ctrl+Shift+P → "Developer: Reload Window"

### Step 13: Install extensions

VS Code will suggest recommended extensions → Install all

### Step 14: Start the development server

bash
npm run dev
# Open http://localhost:3000
```

### Step 15: Test AI Tools

**GitHub Copilot:**
```
- [ ] Open chat (Ctrl+Shift+I)
- [ ] Question: "Where do I create a new component?"

- [ ] Should know the project structure!

``

**Cline/Cursor:**

```
- [ ] New chat session
- [ ] Should automatically see AI_CONTEXT.md

```

### Step 16: Test Code Quality
```bash
# Formatting & Linting
npm run quality

# Test Pre-commit Hook
git add .

git commit -m "Test commit"

# Should automatically format & lint!

```

---

## Phase 6: Documentation (optional)

### Step 17: Adjust README.md
```markdown
- [ ] Project description
- [ ] List features
- [ ] Setup instructions
- [ ] Document the tech stack
```

### Step 18: Document initial features
```markdown
In AI_CONTEXT.md:

- [ ] Describe main features
- [ ] Document routes
- [ ] List important components
```

---

## ✅ Checklist complete!

#### You should now have:
- ✅ A working Next.js project
- ✅ AI-optimized configuration (Copilot, Cursor, Cline)
- ✅ Code quality tools (ESLint, Prettier, Husky)
- ✅ Complete documentation
- ✅ Ready for production development!

---

## 🚀 Next Steps

1. **Develop your first feature**

- AI will support you with full context

- Code quality is automatically checked

2. **Onboard your team**

- README.md shows setup steps

- AI_CONTEXT.md explains the project

3. **If you encounter problems**

- Check AI_DEVELOPMENT_GUIDE.md for best practices

- Ask AI tools with project context

---

## 📊 Quick Reference

| What | Where | When |

|-----|-----|------|

| **Project Info** | AI_CONTEXT.md | Always When AI doesn't understand |

**Best Practices** | AI_DEVELOPMENT_GUIDE.md | For code questions |

**Database Schema** | docs/DATABASE_ANALYSIS.md | For database changes |

**Setup Guide** | This document | For new projects |

--

*Template Version: 1.0 - October 2025*