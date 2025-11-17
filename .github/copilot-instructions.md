# GitHub Copilot Project Instructions

## 📋 Project Overview

**Project:** [rag3]  
**For:** [small business owners and startups to implement RAG systems efficiently for three users : business owners, customers, and internal employees (admins, end users, etc.)]  
**Stack:** [Next.js 14, React, TypeScript, etc.]

## 🎯 Essential Reading

Before generating any code, familiarize yourself with:

1. **`/AI_CONTEXT.md`** - Complete project context & structure
2. **`/AI_DEVELOPMENT_GUIDE.md`** - Coding standards & best practices  
3. **`/docs/DATABASE_ANALYSIS.md`** - Database schema (if applicable)

## 🏗️ Core Architecture Principles

### 1. Server Actions First
- **Always** use Server Actions for database operations
- **Never** use direct database client calls in components
- Location: `/app/actions/*.ts`

```typescript
// ✅ CORRECT
'use server'
export async function getData() {
  const db = await createDatabaseClient()
  return await db.from('table').select('*')
}

// ❌ WRONG
const db = createBrowserClient()
const { data } = await db.from('table').select('*')
```

### 2. Type Safety Everywhere
- Define interfaces for all data structures
- Use TypeScript strict mode
- Location: `/lib/types/*.ts`

### 3. Authentication
- System: [DEIN AUTH SYSTEM - z.B. Supabase Auth, NextAuth]
- Always check auth status in Server Actions
- Tables: [AUTH RELEVANTE TABELLEN]

## 📁 Project Structure

```
/app
  /[route1]         - [Beschreibung]
  /[route2]         - [Beschreibung]
  /[route3]         - [Beschreibung]
  
/components         - React components
  /ui              - Reusable UI components
  
/lib
  /[service]       - [Beschreibung]
  /types           - TypeScript type definitions
  
/docs              - Documentation
/scripts           - Utility scripts
```

## 💻 Coding Conventions

### File Naming
- **Components:** PascalCase → `UserProfile.tsx`
- **Pages:** kebab-case → `user-profile/page.tsx`
- **Actions:** kebab-case → `user-actions.ts`
- **Types:** kebab-case → `user-types.ts`

### Function Naming
- **Server Actions:** verb + noun → `createUser()`, `updateProfile()`
- **Event Handlers:** handle + event → `handleSubmit()`, `handleClick()`
- **Boolean Functions:** is/has/can → `isAdmin()`, `hasPermission()`

### Import Organization (enforced by ESLint)
```typescript
// 1. External libraries
import { useState } from 'react'
import { Calendar } from 'lucide-react'

// 2. Internal absolute imports
import { createClient } from '@/lib/database'
import { Button } from '@/components/ui/button'

// 3. Relative imports
import { UserCard } from './UserCard'
import type { User } from '../types'
```

## 🗄️ Database Best Practices

### Tables
[LISTE DEINE WICHTIGSTEN TABELLEN]
- Key tables: `[table1]`, `[table2]`, `[table3]`
- See `docs/DATABASE_ANALYSIS.md` for details

### Queries
```typescript
// ✅ CORRECT: Select specific columns
const { data } = await db
  .from('users')
  .select('id, name, email')
  .eq('id', userId)
  .single()

// ❌ WRONG: Select all
const { data } = await db
  .from('users')
  .select('*')
```

## 🎨 UI Components

- **Base:** Tailwind CSS [+ WEITERE UI LIBS]
- **Icons:** [Z.B. Lucide React, Heroicons]
- **Responsive:** All components must be responsive
- **Server Components:** Prefer Server Components, use Client only when needed

## 🔍 Common Patterns

### Auth Check in Server Actions
```typescript
'use server'
export async function protectedAction() {
  const auth = await getAuth()
  const user = await auth.getUser()
  
  if (!user) throw new Error('Unauthorized')
  
  // Continue with action...
}
```

### Error Handling
```typescript
try {
  await performAction()
  toast.success('Success!')
  router.push('/dashboard')
} catch (error) {
  console.error('Action failed:', error)
  toast.error('Error occurred')
}
```

## ⚠️ Common Mistakes to Avoid

1. **Auth not checked** → Always verify user in Server Actions
2. **Client-side DB queries** → Use Server Actions instead
3. **Missing error handling** → Always try-catch with user feedback
4. **Missing types** → Define interfaces for all data

## 🚀 Deployment

- **Environment:** [Z.B. Docker, Vercel, etc.]
- **Database:** [Z.B. Supabase at xxx, PostgreSQL, etc.]
- **Commands:**
  - `npm run dev` - Development server
  - `npm run build` - Production build
  - `npm run lint` - Lint check
  - `npm run format` - Format code

## 📚 Additional Resources

- **Project docs:** `/docs` folder
- **Setup guide:** `/PROJECT_SETUP.md`

## 💡 Remember

- This is a [KURZE PROJEKT-BESCHREIBUNG]
- Users are [WER NUTZT ES]
- Prioritize [WICHTIGSTE ASPEKTE - z.B. security, performance, UX]
- Follow the established patterns and conventions
- When in doubt, check `AI_DEVELOPMENT_GUIDE.md`

---

*Last updated: [DATUM]*
