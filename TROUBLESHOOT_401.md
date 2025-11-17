# 🔧 401 Error - Troubleshooting Guide

## The Error You Got:
```
POST | 401 | https://jpyacjqxlppfawvobfds.supabase.co/functions/v1/process-document
```

**401 = Unauthorized** - The function endpoint is rejecting the request.

---

## Possible Causes & Solutions:

### 1. **Edge Function Not Deployed Yet** ✅ FIX THIS FIRST

The Edge Function code you copied might not be deployed to Supabase yet.

**Check if deployed:**
1. Go to: https://supabase.com/dashboard/project/jpyacjqxlppfawvobfds/functions
2. You should see `process-document` listed
3. If you DON'T see it, deploy now by following the dashboard instructions

### 2. **Check Edge Function Logs**

After deploying, every call logs to the function logs:

1. Go to Edge Functions page
2. Click on `process-document` function
3. Scroll to "Logs" section at the bottom
4. **Try uploading a PDF** - you'll see logs appear

What to look for:
- `[Edge] Request received for document:` → Function was called ✅
- `401 Unauthorized` → Auth issue
- `Missing GEMINI_API_KEY` → Secret not set
- `Processing document` → Working!

### 3. **Verify GEMINI_API_KEY Secret is Set**

1. Go to Edge Functions → `process-document`
2. Click "Settings" or find "Secrets" section
3. You should see `GEMINI_API_KEY` listed
4. If NOT there, add it:
   - Name: `GEMINI_API_KEY`
   - Value: `AIzaSyCtNSzozk_CeirRkS_7HdAvcbtgEeS3DGQ`

### 4. **Check Browser Console for Detailed Error**

When you upload a PDF:
1. Open browser console (F12)
2. Go to Console tab
3. Look for logs starting with `[UPLOAD]`
4. Look for the error message - it will now show more details

The logs now print:
- `[UPLOAD] Calling Edge Function: https://...`
- `[UPLOAD] Document ID: ...`
- `[UPLOAD] Edge Function response status: 401`
- Error details

---

## Quick Checklist:

- [ ] Edge Function `process-document` is deployed to Supabase
- [ ] `GEMINI_API_KEY` secret is set in Edge Function Settings
- [ ] Latest code is deployed (run `supabase functions deploy process-document`)
- [ ] Dev server restarted after code changes
- [ ] Tried uploading PDF and checked logs

---

## Still Getting 401?

If you're still getting 401 after checking everything above, try this:

### Option A: Check if Function Exists
```powershell
# Test if function endpoint is reachable
curl -X POST https://jpyacjqxlppfawvobfds.supabase.co/functions/v1/process-document `
  -H "Content-Type: application/json" `
  -H "X-Document-ID: test" `
  -d '{}'
```

### Option B: Check Supabase Status
- Visit: https://status.supabase.com
- Make sure all services are running

### Option C: Recreate the Function
Sometimes Supabase functions get stuck:
1. Go to Edge Functions dashboard
2. Click delete on `process-document`
3. Create new function named `process-document`
4. Paste the code again
5. Redeploy
6. Set secrets again

---

## Expected Flow After Fix:

```
1. You upload PDF
2. File saved to storage
3. [UPLOAD] Calling Edge Function...
4. [UPLOAD] Document ID: xxx
5. [UPLOAD] Edge Function response status: 200  ✅
6. Document status: "Processing..."
7. Wait 10-30 seconds
8. Document status: "Ready"  ✅
```

---

## Need Help?

After checking all above, share:
1. **Edge Function logs** (from dashboard)
2. **Browser console logs** when uploading (F12)
3. **Screenshot** of Edge Functions page showing if `process-document` exists
