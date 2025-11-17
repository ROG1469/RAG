# Quick Start Instructions

## ⚡ Quick Setup (5 minutes)

### Step 1: Run Database Migration

1. Go to your Supabase project: https://jpyacjqxlppfawvobfds.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `supabase/migrations/20241117000001_initial_schema.sql`
5. Click "Run" or press Ctrl+Enter

### Step 2: Start Development Server

**Windows PowerShell:**
```powershell
.\start-dev.ps1
```

**Or manually:**
```powershell
$env:NEXT_PUBLIC_SUPABASE_URL='https://jpyacjqxlppfawvobfds.supabase.co'
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpweWFjanF4bHBwZmF3dm9iZmRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjYxNTMsImV4cCI6MjA3ODQ0MjE1M30.slWlGi4fGC8MAzwTBViKMBTeus1nGjBhPONGLWyAEBM'
npm run dev
```

> **Note:** Next.js 16 with Turbopack may have issues loading `.env.local`. The `start-dev.ps1` script ensures environment variables are loaded correctly.

### Step 3: Sign Up

1. Open http://localhost:3000
2. Click "Get Started"
3. Create your account

### Step 4: Make Yourself Admin

1. Go back to Supabase SQL Editor
2. Run this query (replace with your email):

```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Step 5: Upload & Query

1. Go to Dashboard
2. Upload a PDF, DOCX, XLSX, or TXT file
3. Wait for processing to complete
4. Ask questions about your document!

---

## 🎉 You're Ready!

Your RAG system is now set up and running. You can:

✅ Upload documents (PDF, DOCX, XLSX, TXT)  
✅ Ask questions using AI  
✅ View sources and citations  
✅ Access admin panel (if admin)  

See `SETUP_GUIDE.md` for detailed documentation.
