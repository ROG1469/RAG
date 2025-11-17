# 🚀 DEPLOY EDGE FUNCTION - COPY PASTE METHOD

## ⚠️ YOU GOT 401 ERROR

This means the Edge Function either:
1. Doesn't exist yet (not deployed)
2. Has an issue with the code

Let's fix it by redeploying with better code that logs everything.

---

## 📋 STEP-BY-STEP DEPLOYMENT

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/jpyacjqxlppfawvobfds/functions

### Step 2: Find `process-document` Function
- Look in the list of functions
- If you see it: **Delete it first** (click the function, then delete)
- Wait 5 seconds for it to be removed

### Step 3: Create New Function
- Click **"Create a new function"** button (top right)
- Function name: `process-document`
- Click **"Create Function"**

### Step 4: Copy the Code
This file has the code ready to copy:
```
c:\coding\rag3\EDGE_FUNCTION_COPY_PASTE.ts
```

Open that file in VS Code:
1. Select ALL (Ctrl+A)
2. Skip the first line (the comment about copy-paste)
3. Start from: `import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'`
4. Copy everything from there to the end
5. Copy (Ctrl+C)

### Step 5: Paste into Supabase Dashboard
In the Supabase editor (the code area):
1. Clear any existing code (Ctrl+A, Delete)
2. Paste your code (Ctrl+V)
3. Click **"Deploy"** button (should be at bottom or top right)

### Step 6: Wait for Deployment
Watch the screen - you should see:
- "Deploying..." message
- Then "✅ Deployment successful" or similar

### Step 7: Set the Secret
1. Still on the `process-document` function page
2. Look for **"Settings"**, **"Secrets"**, or **"Environment Variables"** section
3. Add a new secret/variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** `AIzaSyCtNSzozk_CeirRkS_7HdAvcbtgEeS3DGQ`
4. Click **"Add"** or **"Save"**

### Step 8: Test Upload
1. **Refresh your RAG3 app** (F5)
2. **Try uploading a PDF**
3. **Check the logs:**
   - In Supabase → Edge Functions → process-document → **Logs** tab
   - You should see emoji logs:
     - 📨 Incoming POST request
     - 📄 Document ID: xxx
     - 📋 File type: application/pdf
     - 📦 Received XXXX bytes
     - ✅ Supabase credentials found
     - 🔍 Step 1: Parsing document...
     - ✂️ Step 2: Chunking text...
     - 🤖 Step 3: Generating embeddings...
     - And more...

---

## ✅ SUCCESS SIGNS

After uploading a PDF, you should see:

**In your RAG3 app:**
- Document status changes from "Processing..." to "Ready"

**In Edge Function Logs:**
```
✅ Document XXX-XXX-XXX completed successfully!
```

**In Browser Console (F12):**
```
[UPLOAD] Calling Edge Function: https://jpyacjqxlppfawvobfds.supabase.co/functions/v1/process-document
[UPLOAD] Document ID: xxx
[UPLOAD] Edge Function response status: 200
[UPLOAD] ✅ Edge Function success: { success: true, documentId: 'xxx', chunksStored: N }
```

---

## ❌ TROUBLESHOOTING

### Still Getting 401?
1. **Refresh the page** - sometimes cache issues
2. **Check Edge Function Logs** - any error messages?
3. **Delete and redeploy** - sometimes functions get stuck
4. **Check GEMINI_API_KEY secret** - make sure it's set

### See "Missing GEMINI_API_KEY" Error?
- Go back to Step 7
- Make sure secret is added
- Redeploy the function (click "Deploy" again)

### See "No text extracted"?
- Your PDF might be scanned images (no text)
- Try a text-based PDF instead

### Logs Section Not Showing?
- Sometimes takes 30 seconds to appear
- Try uploading a document and wait
- Refresh the page

---

## WHAT TO PASTE

File to copy from: **c:\coding\rag3\EDGE_FUNCTION_COPY_PASTE.ts**

This file has better logging with emojis so you can see exactly what's happening!

---

## After Deployment Works:

Your upload flow will be:
1. Click upload → Select PDF
2. See "Processing..." badge with spinner
3. Wait 10-30 seconds (depends on PDF size)
4. Badge changes to "Ready" ✅
5. Now you can query the PDF in the chat! 🎉
