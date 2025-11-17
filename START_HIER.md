# 🚀 START HERE - Project Template Setup Guide

**Welcome!** This guide will walk you through:

1. ✅ Initial Setup (one-time only)

2. ✅ Creating a New Project (for each new project)

⏱️ **Estimated Time:**
- Initial Setup: 5 minutes
- New Project: 15 minutes

---

# 📦 PART 1: Initial Setup (ONLY ONCE!)

## Step 1: Move the Template Folder

### 🖱️ In Windows Explorer:

1. **Open:** `C:\coden\lehrer-tool\__project-template\`
2. **Copy** the ENTIRE `__project-template` folder
3. **Navigate to:** `C:\coden\`
4. **Create** a new folder: `__project-templates`
5. **Open** `C:\coden\__project-templates\`

6. **Add** and **rename** to: `nextjs-ai-starter`

### ✅ Result:

```
C:\coden\
├── __project-templates\ ← NEW!

│ └── nextjs-ai-starter\
│ ├── START_HERE.md ← This file
│ ├── AI_CONTEXT.md.template
│ └── ... (all files)
└── lehrer-tool\ ← Your current project
```

### 🗑️ Optional: Clean up

```
Delete: C:\coden\lehrer-tool\__project-template\
(You no longer need it in the lehrer-tool project)

```

---

## ✅ Template is ready!

**You can now create new projects with it at any time! 🎉**

---

---

# 🆕 PART 2: Create a New Project

**Follow these steps if you want to start a NEW project.**

---

## Phase 1: Create a Project (5 min)

### Step 1: Open Terminal

```
1. Press the Windows key
2. Type "cmd" or "PowerShell"
3. Press Enter

```

### Step 2: Create a Next.js Project

**📋 Copy & run:**
```bash
cd C:\coden
npx create-next-app@latest my-project-name
```

**❓ When asked, choose:**
```
✅ Would you like to use TypeScript? → Yes
✅ Would you like to use ESLint? → Yes
✅ Would you like to use Tailwind CSS? → Yes
✅ Would you like to use `src/` directory? → No
✅ Would you like to use App Router? → Yes
✅ Would you like to customize the default import alias? → No
```

**⏱️ Wait until installation is complete (~2 min)**

### Step 3: Switch to Project

**📋 Copy & run:**

```bash
cd my-project-name
```

---

## Phase 2: Copy Template (2 min)

### Step 4: Copy Template Files

**📋 Copy & run:**

```bash
xcopy C:\coden\__project-templates\nextjs-ai-starter\* . /E /H /Y
```

**✅ You see:** `XX file(s) copied`

---

## Phase 3: Customize Template (10 min)

### Step 5: Rename .template files

**📋 Copy & execute (all 3 commands):**
```bash
ren AI_CONTEXT.md.template AI_CONTEXT.md
ren .cursorrules.template .cursorrules
cd .github && ren copilot-instructions.md.template copilot-instructions.md && cd ..

```

### Step 6: Open VS Code

**📋 Copy & execute:**

```bash
code .

```

**VS Code will open with your new project! 🎉**

---

### Step 7: Adjusting Files (IMPORTANT!)

**In VS Code:**

#### 📝 File 1: AI_CONTEXT.md

**Open:** `AI_CONTEXT.md`

**Find & Replace (Ctrl+H):**

```
Search: [PROJECT NAME]
Replace: Your project name

Search: [project-directory-name]
Replace: my-project-name

Search: [Short description of the project purpose]
Replace: What does your project do? E.g., "Task Manager for Teams"

Search: [Who uses the system?]
Replace: E.g., "Internal employees" or "End customers"

```

**💡 Tip:** Go through the entire file and replace all `[...]` placeholders!


---

#### 📝 File 2: .github/copilot-instructions.md

**Open:** `.github/copilot-instructions.md`

**Find & Replace (Ctrl+H):**

```
Search: [PROJECT NAME]
Replace: Your project name

Search: [CLIENT/COMPANY]
Replace: For whom? E.g., "My Company GmbH"

Search: [Next.js 14, React, TypeScript, etc.]
Replace: Your actual stack

```

**💡 Tip:** Also adjust the project description & features!


---

#### 📝 File 3: .cursorrules

**Open:** `.cursorrules`

**Find & Replace (Ctrl+H):**

```
Search: [PROJECT NAME]
Replace: Your Project Name

Search: [CLIENT/COMPANY]
Replace: For whom?


**Open:** Search: [Next.js 14 / React / TypeScript / etc.]
Replace: Your Stack

```

---

## Phase 4: Complete Setup (3 min)

### Step 8: Install Dependencies

**Back in the terminal (in VS Code: Ctrl+Ö or Terminal → New Terminal):**

**📋 Copy & run:**
```bash
npm install
```

**⏱️ Wait until installation is complete (~1 min)**

---

### Step 9: Set up Git Hooks

**📋 Copy & run:**
```bash
npx husky-init && npm install
```

**Then:**
```bash
npx husky add .husky/pre-commit "npm run lint-staged"
```

---

### Step 10: Reload VS Code

**In VS Code:**

```
Ctrl+Shift+P → "Developer: Reload Window"

```

**Why?** So that extensions and configs are loaded!

---

### Step 11: Test the Development Server

**📋 Copy & run:**

```bash
`npm run dev`

**✅ Open browser:** http://localhost:3000

**Does it work?** 🎉 **Perfect!**

**Stop server:** `Ctrl+C` in the terminal

---

## ✅ DONE! Checklist

Check off what you have done:

### Initial setup (one-time)

- [ ] Move template folder to `C:\coden\__project-templates\nextjs-ai-starter\`
Top

- [ ] Deleted old `__project-template` from lehrer-tool (optional)

### New Project
- [ ] Created Next.js project (`npx create-next-app`)

- [ ] Copied template (`xcopy`)

- [ ] Renamed .template files (`ren`)
- [ ] Adjusted AI_CONTEXT.md
- [ ] Adjusted copilot-instructions.md
- [ ] Adjusted .cursorrules
- [ ] Installed dependencies (`npm install`)

- [ ] Configured Husky (`npx husky-init`)

- [ ] Reloaded VS Code

- [ ] Tested the Dev Server (`npm run dev`)

---

## 🎯 Next Steps

### 1. Create a Git repository
```bash
`git init`
`git add .`

```bash`
`git add .`
` ... `git commit -m "Initial commit with AI-optimized template"`

### 2. Test GitHub Copilot

###
1. Open Copilot Chat (Ctrl+Shift+I)

2. Question: "Where do I create a new component?"

3. Should know your project structure!

###

### 3. Develop your first feature

###
- AI now knows your project

- Code quality is automatically checked

- Pre-commit hooks run automatically

###

---

## 🆘 Problems? Troubleshooting

### ❌ "xcopy is not a known command"
**Solution:** You are not in cmd/PowerShell. Reopen cmd.exe.


### ❌ "Template files not found"
**Solution:** Check the path: `C:\coden\__project-templates\nextjs-ai-starter\`
```bash
dir C:\coden\__project-templates\nextjs-ai-starter\
```

### ❌ "npm not found"
**Solution:** Install Node.js: https://nodejs.org/

### ❌ "Copilot not reading context"
**Solution 1:** Reload VS Code (Ctrl+Shift+P → Reload Window)
**Solution 2:** Check if `.github/copilot-instructions.md` exists
**Solution 3:** Wait 1-2 minutes, sometimes it takes a while

### ❌ "Pre-commit hook not working"
**Solution:**
```bash
npx husky install
npx husky add .husky/pre-commit "npm run lint-staged"

```

### ❌ "ESLint commit error"

**Solution:** Fix the error first:

```bash
`npm run lint`
`npm run format`

```

---

## 📚 Further documentation

In the template folder you will find:

- 📄 `README_TEMPLATE.md` - Detailed instructions

- 📄 `INHALT.md` - What's in the template?

- 📄 `PROJECT_SETUP.md` - Detailed Checklist

- 📄 `AI_DEVELOPMENT_GUIDE.md` - Best Practices

---

## 💡 Quick Commands (Copy-Paste)

### Complete Flow in One:

```bash
# 1. Create Project

cd C:\coden && npx create-next-app@latest my-project && cd my-project

# 2. Copy & Rename Template

xcopy C:\coden\__project-templates\nextjs-ai-starter\* . /E /H /Y && ren AI_CONTEXT.md.template AI_CONTEXT.md && ren .cursorrules.template .cursorrules && cd .github && ren copilot-instructions.md.template copilot-instructions.md && cd ..

# 3. Open VS Code

code .

# 4. Then, in the VS Code terminal:

npm install && npx husky-init && npm install && npm run dev

```

**Then:** Manually adjust the files (AI_CONTEXT.md, copilot-instructions.md, .cursorrules)

---

## 🎊 Good luck with your project!

**Time Savings:** From 3-4 hours to 15 minutes setup! ⚡

**You now have:**

- ✅ AI-optimized project
- ✅ Code quality tools
- ✅ Complete documentation
- ✅ Best practices pre-configured

---

**Template Version:** 1.0
**Created:** October 2025
**Support:** See other .md files in the template folder