# 🚀 Edge Function Deployment Instructions

Since Supabase CLI interactive login doesn't work in the terminal, follow these steps:

## Option 1: Deploy via Supabase Dashboard (EASIEST)

1. **Go to your Supabase Dashboard**
   - Open: https://supabase.com/dashboard/project/jpyacjqxlppfawvobfds

2. **Navigate to Edge Functions**
   - Click on "Edge Functions" in the left sidebar

3. **Create New Function**
   - Click "New Function" button
   - Function name: `process-document`
   - Click "Create Function"

4. **Copy the Edge Function Code**
   - Open: `c:\coding\rag3\supabase\functions\process-document\index.ts`
   - Copy ALL the code from that file

5. **Paste into Supabase Dashboard**
   - Paste the code into the editor
   - Click "Deploy Function"

6. **Set Environment Variable**
   - In the Edge Functions page, click on `process-document`
   - Go to "Settings" tab
   - Add secret:
     - Name: `GEMINI_API_KEY`
     - Value: `AIzaSyCtNSzozk_CeirRkS_7HdAvcbtgEeS3DGQ`
   - Click "Save"

7. **Test It!**
   - Refresh your RAG3 dashboard
   - Upload a PDF
   - Watch the status badge change from "Processing..." to "Ready"

---

## Option 2: Deploy via CLI (Advanced)

If you want to use the CLI:

### Step 1: Get Access Token
```powershell
# Open browser and login to Supabase
# Go to: https://supabase.com/dashboard/account/tokens
# Generate a new access token
# Copy the token
```

### Step 2: Set Access Token
```powershell
$env:SUPABASE_ACCESS_TOKEN='your-access-token-here'
```

### Step 3: Link Project
```powershell
npx supabase link --project-ref jpyacjqxlppfawvobfds
```

### Step 4: Set Secret
```powershell
npx supabase secrets set GEMINI_API_KEY=AIzaSyCtNSzozk_CeirRkS_7HdAvcbtgEeS3DGQ
```

### Step 5: Deploy
```powershell
npx supabase functions deploy process-document
```

---

## What the Edge Function Does

When you upload a PDF:

```
1. PDF uploaded → Saved to Supabase Storage
2. Server Action calls Edge Function
3. Edge Function:
   ├─ Parses PDF → Extracts text
   ├─ Chunks text → Splits into pieces
   ├─ Calls Gemini API → Generates embeddings
   └─ Stores in database → chunks + embeddings
4. Document status updated to "completed"
5. You see "Ready" badge ✅
```

---

## Verify Deployment

After deploying, check the Edge Function logs:

**Via Dashboard:**
- Go to Edge Functions → process-document → Logs

**Via CLI:**
```powershell
npx supabase functions logs process-document
```

---

## Troubleshooting

### "Edge Function not found"
- Make sure you deployed it via Dashboard or CLI
- Check the function name is exactly `process-document`

### "Missing GEMINI_API_KEY"
- Set the secret in Dashboard → Edge Functions → process-document → Settings
- Or via CLI: `npx supabase secrets set GEMINI_API_KEY=your-key`

### Upload stays "Processing..."
- Check Edge Function logs for errors
- Verify Gemini API key is valid
- Check Supabase database for error_message in documents table

---

## Important Notes

- ✅ **SUPABASE_URL** - Automatically available in Edge Functions
- ✅ **SUPABASE_SERVICE_ROLE_KEY** - Automatically available in Edge Functions  
- ⚠️ **GEMINI_API_KEY** - YOU must set this as a secret

---

## After Deployment

1. Restart your Next.js dev server (if running)
2. Refresh your dashboard
3. Upload a PDF
4. Watch the magic happen! ✨

The document will go from "Processing..." → "Ready" in 10-30 seconds depending on PDF size.
