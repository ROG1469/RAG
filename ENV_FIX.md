# Environment Variables Fix for Next.js 16 + Turbopack

## Issue
Next.js 16 with Turbopack has issues loading `.env.local` files in some configurations.

## Solution Options

### Option 1: Use next.config.ts (Recommended for Production)
Already configured in `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  serverExternalPackages: ['pdf-parse'],
};
```

### Option 2: Set Environment Variables in PowerShell (Development)
Before running `npm run dev`, set the environment variables:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL=
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY='your-anon-key'
$env:SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'
$env:GEMINI_API_KEY='your-gemini-key'
npm run dev
```

### Option 3: Create a Start Script
Create `start-dev.ps1`:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL='https://jpyacjqxlppfawvobfds.supabase.co'
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpweWFjanF4bHBwZmF3dm9iZmRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NjYxNTMsImV4cCI6MjA3ODQ0MjE1M30.slWlGi4fGC8MAzwTBViKMBTeus1nGjBhPONGLWyAEBM'
$env:SUPABASE_SERVICE_ROLE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpweWFjanF4bHBwZmF3dm9iZmRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NjE1MywiZXhwIjoyMDc4NDQyMTUzfQ.ztmhNOPKKF7chBpYDNEMFKgQjpnCh5KLVgC5KPZYqEA'
$env:GEMINI_API_KEY='AIzaSyADgj69nrmSsC4Ze191f-tJ2pAMBtNxt14'

npm run dev
```

Then run: `.\start-dev.ps1`

## Status
✅ Server is now running successfully on http://localhost:3000  
✅ Environment variables are loaded  
✅ Authentication pages are working  

## Next Steps
1. Run the database migration (see QUICK_START.md)
2. Sign up for an account
3. Make yourself admin
4. Start uploading documents!
