# 📦 Next.js AI-Optimized Project Template

This template contains all the configurations for quickly setting up new Next.js projects with AI support and code quality tools.

## 📋 What's included?


# 📦 Next.js AI-Optimized Project Template ... ### AI Configuration
- ✅ GitHub Copilot Instructions
- ✅ Cursor AI Rules
- ✅ Cline/Windsurf Context
- ✅ Complete Project Documentation

### Code Quality
- ✅ ESLint & Prettier Configuration
- ✅ Editor Configuration (cross-editor)
- ✅ German Spell Checker
- ✅ Pre-commit Hooks (Husky)
- ✅ VS Code Settings & Extensions

### Developer Experience
- ✅ Database Analysis Script
- ✅ Setup Checklist
- ✅ Best Practices Guide

---

## 🚀 Quick Start

### Step 1: Create a new Next.js project
```bash
npx create-next-app@latest my-project
cd my-project
```

### Step 2: Copy template files
```bash
# Copy all files from this folder into your new project.

# IMPORTANT: Rename .template files!


```

### Step 3: Adjusting Files
**These files MUST be adjusted:**
- `AI_CONTEXT.md.template` → `AI_CONTEXT.md` (Project name, Stack)
- `.github/copilot-instructions.md.template` → `copilot-instructions.md` (Project name)
- `.cursorrules.template` → `.cursorrules` (Project name)

**Copy these files directly (1:1):**
- `AI_DEVELOPMENT_GUIDE.md`
- `.vscode/settings.json`
- `.vscode/extensions.json`
- `.eslintrc.json`
- `.prettierrc.json`

- `.editorconfig`
- `cspell.json`

### Step 4: Completing Setup

```bash
# Install Dependencies

npm Install

# Set up Husky
`npx husky-init && npm install`

# Test the Development Server
`npm run dev`

```

### Step 5: Reload VS Code & get started! 🎉

---

## 📁 File Overview

| File | Type | Customize? | Purpose |

|-------|-----|-----------|-------|

`AI_CONTEXT.md.template` | Template | ✏️ YES | Project context for AI |

`AI_DEVELOPMENT_GUIDE.md` | Copy | ❌ NO | Best Practices (generic) |

`PROJECT_SETUP.md` | Copy | ❌ NO | Setup checklist |

``PROJECT_SETUP.md` | Copy | ❌ NO | Setup checklist |

````` `.github/copilot-instructions.md.template` | Template | ✏️ YES | GitHub Copilot Config |

`.cursorrules.template` | Template | ✏️ YES | Cursor AI Config |

`.editorconfig` | Copy | ❌ NO | Editor Settings |

`.vscode/settings.json` | Copy | ❌ NO | VS Code Config |

`.vscode/extensions.json` | Copy | ❌ NO | Recommended Extensions |

`.eslintrc.json` | Copy | ❌ NO | ESLint Config |

`.prettierrc.json` | Copy | ❌ NO | Prettier Config |

`cspell.json` | Copy | ❌ NO | German Dictionary |

````````````````````````````````````````````````````````````````)```)`)`)`)`)`)`)`)`)`)`)`)`)`) `scripts/analyze-database.ts` | Copy | ⚠️ Optional | Database Analysis (if Supabase) |

---

## 🎯 What do I need to adjust?


``` ### AI_CONTEXT.md.template

**Replace:**
```markdown
**Project:** [PROJECTNAME]
**For:** [CUSTOMER NAME / COMPANY]
**Stack:** [TECHNOLOGIES]
```

**With your values:**
```markdown
**Project:** Task Manager
**For:** My Company GmbH
**Stack:** Next.js 14, Prisma, PostgreSQL
```

### copilot-instructions.md.template

**Replace:**
```markdown
**Project:** [PROJECTNAME]
**For:** [CUSTOMER]
```

**Adjust:**

- Project description
- Main features
- Important tables (if DB)

### .cursorrules.template

**Replace:**
```markdown
This is the **[PROJECT NAME]** for [CUSTOMER].

```

**Adjust Quick Reference:**

- Stack
- Database Tables
- Project Structure

---

## 💡 Tips & Tricks

### Update Template
```bash
# When you make improvements, update the template:

1. Change the file in the current project
2. Copy it back to the template
3. The next project will have the improvement!

```

### For Teams
```bash
# Template in Git Repository:

1. Create repo: "company-nextjs-template"
2. Push template files
3. The team can clone and use it

```

### Automation
```bash
# Create a PowerShell script:

.\create-project.ps1 -ProjectName "my-project"
# → Copies and replaces automatically!

```

---

## 🔄 Template Version

**Version:** 1.0
**Last Update:** October 2025
**Compatible with:** Next.js 14+, VS Code, GitHub Copilot, Cursor, Cline

---

## 📚 Further Documentation

- `PROJECT_SETUP.md` - Complete Setup Checklist

- `AI_DEVELOPMENT_GUIDE.md` - Coding Best Practices

- GitHub: [Project Name] - Project-Specific Documentation

---

## 🆘 Problems?

### Copilot Not Reading Context?

```bash

1. Reload VS Code (Ctrl+Shift+P → Reload Window)

2. Check if .github/copilot-instructions.md exists

3. Test with: "Where do I create a component?"

``

### Pre-commit hook not working?

```bash
`npx husky install`
`npx husky add .husky/pre-commit "npm run lint-staged"`
`chmod +x .husky/pre-commit` # Mac/Linux only

```

### Spell checker showing German words as errors?

```bash

# Check if cspell.json exists

# VS Code extension "Code Spell Checker" installed?

```

---

**Good luck with your new project! 🚀**