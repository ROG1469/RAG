# 📌 YOUR 401 ERROR - QUICK FIX

## What Happened:
- You tried to upload a PDF
- Got error: `POST | 401 | https://jpyacjqxlppfawvobfds.supabase.co/functions/v1/process-document`
- **401 = Unauthorized** = Edge Function doesn't exist or isn't deployed

## The Fix (3 minutes):

### 1️⃣ Open Supabase Dashboard
https://supabase.com/dashboard/project/jpyacjqxlppfawvobfds/functions

### 2️⃣ Copy Code
Open this file in your editor and copy ALL the code:
```
c:\coding\rag3\EDGE_FUNCTION_COPY_PASTE.ts
```

### 3️⃣ Deploy to Supabase
In the Functions page:
- Click "Create a new function"
- Name it: `process-document`
- Paste the code you copied
- Click "Deploy"

### 4️⃣ Add Secret
Click on the function → Settings/Secrets section:
- Name: `GEMINI_API_KEY`
- Value: `AIzaSyCtNSzozk_CeirRkS_7HdAvcbtgEeS3DGQ`
- Click "Save"

### 5️⃣ Test!
- Refresh your RAG3 app (F5)
- Upload a PDF
- Watch status: "Processing..." → "Ready" ✅

---

## If Still 401:

Check Edge Function Logs in Supabase:
- Click `process-document` function
- Scroll to "Logs" section
- Try uploading - watch for errors
- Screenshot the errors and we'll fix them

---

## Files That Will Help:

- **FIX_401_DEPLOY_NOW.md** - Detailed step-by-step
- **TROUBLESHOOT_401.md** - Debugging guide
- **EDGE_FUNCTION_COPY_PASTE.ts** - Code to paste (has better logging)

---

That's it! The Edge Function isn't deployed yet. Deploy it and it will work! 🚀
