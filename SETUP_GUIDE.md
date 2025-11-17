# RAG System Setup Guide

## 🚀 Quick Start

This is a complete RAG (Retrieval-Augmented Generation) system built with Next.js, Supabase, and Google Gemini AI.

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account ([supabase.com](https://supabase.com))
- Google Gemini API key ([ai.google.dev](https://ai.google.dev))

## 🔧 Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new project in Supabase
2. Go to Project Settings > API
3. Copy your project URL and anon key
4. Update `.env.local` with your credentials

### 3. Run Database Migrations

1. Open Supabase SQL Editor
2. Run the migration file: `supabase/migrations/20241117000001_initial_schema.sql`
3. This will create all necessary tables, RLS policies, and storage buckets

### 4. Enable pgvector Extension

In Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 5. Configure Google Gemini

1. Get your API key from [Google AI Studio](https://ai.google.dev)
2. Add to `.env.local`:
```
GEMINI_API_KEY=your_api_key_here
```

### 6. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 👤 Create Your First Admin User

1. Sign up at `/auth/signup`
2. After signup, go to Supabase SQL Editor
3. Run this query to make yourself an admin:

```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## 📁 Supported File Types

- **PDF** (.pdf) - Up to 10MB
- **Word Documents** (.docx) - Up to 10MB
- **Excel Spreadsheets** (.xlsx, .xls) - Up to 10MB
- **Text Files** (.txt) - Up to 10MB

## 🎯 Features

### For Users
- Upload documents (PDF, DOCX, XLSX, TXT)
- Documents are automatically processed and indexed
- Ask questions about your documents using natural language
- Get AI-powered answers with source citations
- View chat history

### For Admins
- View all users and their roles
- Monitor all uploaded documents
- System statistics dashboard
- Track total queries and document processing

## 🏗️ Architecture

### Document Processing Flow

1. **Upload**: User uploads file via drag-and-drop interface
2. **Storage**: File stored in Supabase Storage
3. **Parsing**: Text extracted using appropriate parser (PDF, DOCX, XLSX, TXT)
4. **Chunking**: Text split into ~1000 character chunks with overlap
5. **Embedding**: Each chunk converted to 768-dim vector using Gemini
6. **Storage**: Chunks and embeddings stored in PostgreSQL with pgvector

### RAG Query Flow

1. **Question**: User asks a question
2. **Embedding**: Question converted to vector using Gemini
3. **Search**: Cosine similarity search finds top 5 relevant chunks
4. **Context**: Relevant chunks assembled as context
5. **Generation**: Gemini generates answer based on context
6. **Response**: Answer returned with source citations

## 🔐 Security

- **Row Level Security (RLS)**: Enabled on all tables
- **User Isolation**: Users can only access their own documents
- **Admin Access**: Admins have read access to all data
- **Storage Policies**: Files isolated by user ID in folder structure
- **Service Role**: Used only for background processing, never exposed to client

## 📊 Database Schema

### Main Tables

- **users**: User profiles with roles (user/admin)
- **documents**: Document metadata and processing status
- **chunks**: Text chunks extracted from documents
- **embeddings**: Vector embeddings (768 dimensions)
- **chat_history**: Query/answer history with sources

## 🛠️ Development

### File Structure

```
/app
  /actions           # Server actions
  /auth             # Authentication pages
  /dashboard        # User dashboard
  /admin            # Admin panel
/components         # React components
/lib
  /gemini          # AI integration
  /parsers         # Document parsers
  /supabase        # Database client
  /types           # TypeScript types
/supabase
  /migrations      # SQL migrations
```

### Key Technologies

- **Next.js 16**: App Router with Server Components
- **Supabase**: PostgreSQL database + Storage + Auth
- **Google Gemini**: embeddings (embedding-001) + chat (gemini-1.5-flash)
- **pgvector**: Vector similarity search
- **Tailwind CSS 4**: Styling
- **TypeScript**: Type safety

## 🐛 Troubleshooting

### Documents stuck in "processing"

1. Check Supabase logs for errors
2. Verify GEMINI_API_KEY is valid
3. Check file size is under 10MB
4. Ensure pgvector extension is installed

### Authentication issues

1. Verify Supabase URL and keys in `.env.local`
2. Check if migrations ran successfully
3. Ensure user exists in `public.users` table

### Embedding search not working

1. Verify pgvector extension is installed
2. Check embeddings table has data
3. Run query manually in SQL editor to test

## 📝 Environment Variables

Required in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini
GEMINI_API_KEY=your-gemini-api-key
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Works on any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- Digital Ocean App Platform

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [pgvector GitHub](https://github.com/pgvector/pgvector)

## 🤝 Support

For issues or questions:
1. Check this guide
2. Review error logs in Supabase
3. Check browser console for client errors

---

**Built with ❤️ using Next.js, Supabase, and Google Gemini**
