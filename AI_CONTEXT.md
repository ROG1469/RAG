# AI Context - rag3

## 🎯 Projekt-Identifikation
- **Projektname**: rag3
- **Verzeichnis**: `c:\coding\rag3`
- **Zweck**: RAG (Retrieval-Augmented Generation) system for document Q&A using AI
- **Zielgruppe**: Business owners, customers, and internal employees (admins, end users)

## 🔑 Authentifizierung
- **System**: Supabase Auth
- **User-Typ**: User, Admin
- **Session-Management**: Supabase Sessions with SSR support
- **Relevante Tabellen**: 
  - `users` - User profiles with role-based access (user/admin)
  - `documents` - Uploaded documents with processing status
  - `chunks` - Text chunks extracted from documents
  - `embeddings` - Vector embeddings for semantic search
  - `chat_history` - Query and answer history

## 📁 Projekt-Struktur
- `/app` - Next.js App Directory
  - `/auth/signin` - Sign in page
  - `/auth/signup` - Sign up page
  - `/dashboard` - Main user dashboard with document upload and chat
  - `/admin` - Admin panel for system management
  - `/actions` - Server actions for auth, documents, RAG queries, admin
- `/components` - React Komponenten
  - `FileUpload.tsx` - Drag & drop file upload component
  - `DocumentList.tsx` - Document management list
  - `ChatInterface.tsx` - RAG query interface
- `/lib` - Utilities & Services
  - `/supabase` - Supabase client setup (server & client)
  - `/gemini` - Google Gemini AI integration
  - `/parsers` - Document parsers (PDF, DOCX, XLSX, TXT)
  - `/types` - TypeScript type definitions
- `/supabase/migrations` - Database migrations

## 📝 Datenbank
- **System**: Supabase PostgreSQL with pgvector extension
- **Wichtige Tabellen**:
  - `users` - User profiles extending auth.users with roles
  - `documents` - Document metadata and processing status
  - `chunks` - Text chunks from documents for RAG
  - `embeddings` - 768-dimensional vectors from Gemini
  - `chat_history` - User queries and AI responses with sources

## 🔧 Technologie-Stack
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TypeScript, Tailwind CSS 4, Lucide Icons
- **Auth**: Supabase Auth with SSR
- **Database**: Supabase PostgreSQL with pgvector
- **AI**: Google Gemini (embedding-001 for embeddings, gemini-1.5-flash for chat)
- **Storage**: Supabase Storage for documents
- **File Parsing**: pdf-parse, mammoth (DOCX), xlsx

## 📊 Hauptfeatures
- **Document Upload**: Support for PDF, DOCX, XLSX, TXT up to 10MB
- **Smart Processing**: Automatic text extraction, chunking, and embedding generation
- **RAG Queries**: Semantic search with Gemini embeddings and AI-powered answers
- **Multi-User**: Secure authentication with user-specific document isolation
- **Admin Panel**: System-wide statistics and user/document management
- **Real-time Processing**: Background document processing with status tracking

## 🔐 Sicherheit & Berechtigungen
- **RLS Policies**: Row Level Security enabled on all tables
- **User Isolation**: Users can only access their own documents
- **Admin Access**: Admins can view all users and documents
- **Storage Security**: Bucket policies enforce user-specific access
- **Service Role**: Used only for background processing tasks

## 🌍 Deployment
- **Environment**: Next.js with Supabase backend
- **Database**: Supabase (hosted PostgreSQL)
- **Required ENV Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `GEMINI_API_KEY`

---

*Last updated: November 17, 2025*
*Template Version: 1.0*
