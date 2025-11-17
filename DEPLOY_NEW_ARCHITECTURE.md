# 🚀 Deploy New Architecture - 3 Edge Functions

## Overview

Your RAG system now has **proper separation of concerns** with 3 Edge Functions:

1. **process-document** → Parse PDF + Create chunks
2. **generate-embeddings** → Generate vector embeddings  
3. **query-rag** → Handle questions + Generate answers

---

## 📋 Deployment Steps

### Step 1: Deploy `process-document`

1. Go to: https://supabase.com/dashboard/project/jpyacjqxlppfawvobfds/functions
2. Click "Create a new function"
3. Name: `process-document` (replace existing if asked)
4. Copy ALL code from: `supabase/functions/process-document/index-new.ts`
5. Paste into editor
6. Click **Deploy**

**No secrets needed** (uses auto-provided SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)

---

### Step 2: Deploy `generate-embeddings`

1. Click "Create a new function"
2. Name: `generate-embeddings`
3. Copy ALL code from: `supabase/functions/generate-embeddings/index.ts`
4. Paste into editor
5. Click **Deploy**
6. Go to **Settings** tab
7. Add secret:
   - Key: `GEMINI_API_KEY`
   - Value: `AIzaSyCtNSzozk_CeirRkS_7HdAvcbtgEeS3DGQ`
8. Click **Save**

---

### Step 3: Deploy `query-rag`

1. Click "Create a new function"
2. Name: `query-rag`
3. Copy ALL code from: `supabase/functions/query-rag/index.ts`
4. Paste into editor
5. Click **Deploy**
6. Go to **Settings** tab
7. Add secret:
   - Key: `GEMINI_API_KEY`
   - Value: `AIzaSyCtNSzozk_CeirRkS_7HdAvcbtgEeS3DGQ`
8. Click **Save**

---

## ✅ Verify Deployment

After deployment, you should see 3 functions:

- `process-document` ✅
- `generate-embeddings` ✅
- `query-rag` ✅

---

## 🔄 What Changed

### Old (Broken) Architecture:
```
Upload → process-document (parse + chunk + embed + store) ❌
Query → Server Action with Gemini client ❌
```

**Problems:**
- One function doing too much
- Gemini client failing in Next.js environment
- No separation of concerns

### New (Correct) Architecture:
```
Upload Flow:
  1. process-document (parse + chunk)
  2. generate-embeddings (embed chunks)
  3. Update status to 'completed'

Query Flow:
  1. query-rag (embed question + search + answer)
  2. Return answer with sources
```

**Benefits:**
✅ Each function has ONE responsibility
✅ Gemini API isolated in Edge Functions (works properly)
✅ Better error handling per step
✅ Easier to debug and test

---

## 📝 Next: Update Server Actions

After deploying the Edge Functions, we need to update:

1. `app/actions/documents.ts` → Call both `process-document` AND `generate-embeddings`
2. `app/actions/rag.ts` → Call `query-rag` Edge Function instead of local Gemini

I'll do this after you confirm the Edge Functions are deployed.

---

## 🆘 Troubleshooting

### Function shows "Not Found" (404)
- Make sure you clicked **Deploy** button
- Wait 10-30 seconds for deployment to propagate

### Function shows error in logs
- Check the **Logs** tab for each function
- Look for emoji indicators: ✅ (success) or ❌ (error)

### Secrets not working
- Make sure `GEMINI_API_KEY` is added in **Settings** tab
- Click **Save** after adding
- Redeploy the function after adding secrets

---

## 💡 Why This Architecture is Better

**Analogy:** Think of a restaurant kitchen

**Old way:** One chef doing everything
- Take order
- Cook food
- Serve  
- Wash dishes
❌ Too much for one person, bound to fail

**New way:** Specialized stations
- Order taker → gets PDF
- Chef 1 → processes PDF into chunks
- Chef 2 → adds embeddings to chunks  
- Chef 3 → answers questions
✅ Each person has clear role, works better

That's exactly what we did with your Edge Functions!

---

**Ready?** Deploy the 3 functions, then let me know so I can update the server actions to call them.
