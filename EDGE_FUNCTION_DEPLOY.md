# Edge Function Deployment Guide

## Why Edge Functions?

Edge Functions solve the PDF parsing problem because:
- ✅ Deno runtime has native support for npm packages
- ✅ Isolated environment prevents Next.js bundling issues
- ✅ Auto-scales independently from your Next.js app
- ✅ Can handle heavy processing without blocking your server

## Prerequisites

1. **Supabase CLI** - Install if you haven't:
```powershell
npm install -g supabase
```

2. **Link to your Supabase project**:
```powershell
supabase login
supabase link --project-ref jpyacjqxlppfawvobfds
```

## Deploy the Edge Function

1. **Set secrets** (environment variables for the function):
```powershell
supabase secrets set GEMINI_API_KEY=AIzaSyADgj69nrmSsC4Ze191f-tJ2pAMBtNxt14
```

2. **Deploy the function**:
```powershell
supabase functions deploy process-document
```

3. **Verify deployment**:
```powershell
supabase functions list
```

## How It Works

### Upload Flow:
```
User uploads PDF
    ↓
Server Action (uploadDocument)
    ↓
File saved to Supabase Storage
    ↓
Document record created (status: processing)
    ↓
Edge Function called with file buffer
    ↓
Edge Function processes:
    - Parse PDF → Extract text
    - Chunk text → Split into pieces
    - Gemini API → Generate embeddings
    - Database → Store chunks + embeddings
    - Update → status: completed
    ↓
User sees "Ready" badge
```

### Why This Architecture?

**Before (Current - Broken):**
- Next.js Server Action tries to use `pdf-parse`
- Turbopack bundler can't handle CommonJS module
- `require()` doesn't work in Server Actions
- **Result:** "pdfParse is not a function" ❌

**After (Edge Functions - Working):**
- Server Action uploads file + calls Edge Function
- Edge Function runs in Deno (different runtime)
- Deno natively supports npm packages via `npm:` imports
- PDF parsing works perfectly
- **Result:** Documents process successfully ✅

## Test After Deployment

1. Refresh your dashboard
2. Upload a PDF
3. Watch the console logs
4. Check Supabase Edge Function logs:
```powershell
supabase functions logs process-document
```

## Troubleshooting

### If upload fails:
1. Check Edge Function logs: `supabase functions logs process-document`
2. Verify secrets are set: `supabase secrets list`
3. Check Gemini API key is valid
4. Ensure Supabase project is linked

### Common Issues:
- **"Missing GEMINI_API_KEY"** → Run `supabase secrets set GEMINI_API_KEY=your-key`
- **"Function not found"** → Deploy with `supabase functions deploy process-document`
- **"Timeout"** → Large PDFs may take time, check logs

## Alternative: Local Development

For local testing without deploying:
```powershell
supabase functions serve process-document --env-file .env.local
```

Then your app will call `http://localhost:54321/functions/v1/process-document`

## Environment Variables Needed

The Edge Function needs these in Supabase (automatically available):
- `SUPABASE_URL` - Auto-provided by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-provided by Supabase
- `GEMINI_API_KEY` - Set with `supabase secrets set`
