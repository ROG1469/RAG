# Urgent Fixes & Deployment Guide

## 🔧 Quick Fixes Completed

### 1. ✅ DOCX File Support
**File:** `supabase/functions/process-document/index-new.ts`
- Added `mammoth` import for DOCX parsing
- Added handling for `wordprocessingml` file types
- DOCX files will now be parsed correctly

### 2. ✅ Relevance NaN% Fix
**File:** `supabase/functions/query-rag/index.ts`
- Changed response field from `relevance` to `relevance_score`
- Changed `chunk_preview` to `chunk_content`
- Now matches ChatInterface expectations perfectly

## 📋 Deployment Steps

### Step 1: Deploy Updated Edge Functions

#### A. Update process-document (DOCX support)
1. Go to https://supabase.com/dashboard/project/jpyacjqxlppfawvobfds/functions
2. Find **process-document** function
3. Replace with code from `supabase/functions/process-document/index-new.ts`
4. Deploy

#### B. Update query-rag (Relevance fix)
1. Same dashboard
2. Find **query-rag** function  
3. Replace with code from `supabase/functions/query-rag/index.ts`
4. Deploy

### Step 2: Run Database Migration

1. Go to https://supabase.com/dashboard/project/jpyacjqxlppfawvobfds/editor
2. Open SQL Editor
3. Copy entire content from `supabase/migrations/20241117000003_add_roles_and_permissions.sql`
4. Run the migration
5. Verify tables updated:
   ```sql
   -- Check users table has role column
   SELECT column_name, data_type FROM information_schema.columns 
   WHERE table_name = 'users' AND column_name = 'role';
   
   -- Check documents has permission columns
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'documents' AND column_name LIKE 'accessible%';
   
   -- Check customer_queries table exists
   SELECT * FROM customer_queries LIMIT 1;
   ```

## 🧪 Testing

### Test DOCX Upload:
1. Upload a `.docx` file
2. Should process without "Unsupported file type" error
3. Document status should change to "Ready"

### Test Relevance Display:
1. Ask a question
2. Check sources section
3. Should show "Relevance: 85.3%" (not "Relevance: NaN%")

### Test Database Migration:
1. Check Supabase Table Editor
2. `users` table should have `role` column (default: 'employee')
3. `documents` table should have 3 new boolean columns
4. `customer_queries` table should exist

## ⚠️ Important Notes

- **DOCX Support**: Edge Function now requires `mammoth@1.8.0` npm package (Deno will auto-install)
- **Database Changes**: Migration is backward compatible, existing data unchanged
- **RLS Policies**: Updated to support role-based access control
- **Default Role**: All existing users will have `role = 'employee'` by default

## 🚀 Next Features (In Progress)

Will implement after these fixes are deployed:
1. Click anywhere to upload
2. Multiple document upload
3. Chat history sidebar
4. Dark theme landing/signin pages
5. Password reset
6. Email verification
7. Role selection on signup
8. Document permission checkboxes
9. Public customer chat page

---

**Status:** Ready to deploy
**Estimated deployment time:** 5-10 minutes
