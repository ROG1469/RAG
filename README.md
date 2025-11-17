# 🤖 RAG System MVP

A production-ready Retrieval-Augmented Generation (RAG) system built with Next.js, Supabase, and Google Gemini API.

## ✨ Features

- 📄 **Multi-format Support** - Upload PDF, Word, and Excel documents
- 🔍 **Smart Search** - Vector similarity search with pgvector
- 💬 **AI-Powered Q&A** - Ask questions, get contextual answers
- 👥 **Role-Based Access** - 3 user types with different permissions
- 🔒 **Secure** - Row-level security, encrypted passwords, JWT sessions
- ⚡ **Fast** - Serverless API routes, optimized vector search
- 🎨 **Modern UI** - Responsive design with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- Google Gemini API key (free tier works)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy and paste contents of `supabase/migrations/001_initial_schema.sql`
4. Run the migration

### 3. Configure Environment
```bash
# Copy template
cp .env.template .env.local

# Edit .env.local with your credentials:
# - Supabase URL and keys
# - Gemini API key (from ai.google.dev)
# - NextAuth secret (generate random string)
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get running in 5 minutes
- **[Setup README](SETUP_README.md)** - Detailed setup instructions
- **[Project Overview](PROJECT_OVERVIEW.md)** - Architecture & technical details
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Production deployment guide

## 🏗️ Tech Stack

- **Frontend:** Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes (serverless)
- **Database:** Supabase (PostgreSQL + pgvector)
- **Auth:** NextAuth.js
- **AI:** Google Gemini API
- **Storage:** Supabase Storage
- **File Parsing:** pdf-parse, mammoth, xlsx

## 👥 User Roles

### Business Owner
- ✅ Upload documents
- ✅ Set document visibility
- ✅ Access all documents
- ✅ Ask questions

### Internal Employee
- ✅ Upload documents
- ✅ Limited visibility control
- ✅ Access internal docs
- ✅ Ask questions

### Customer
- ❌ Cannot upload
- ✅ Access customer-facing docs only
- ✅ Ask questions

## 📊 How It Works

### Upload Flow
```
File Upload → Text Extraction → Chunking → Embedding Generation → Vector Storage
```

### Query Flow
```
Question → Embedding → Vector Search → Context Retrieval → AI Answer Generation
```

## 🔐 Security

- ✅ Row-Level Security (RLS) on all tables
- ✅ Bcrypt password hashing
- ✅ JWT session management
- ✅ Server-side authentication checks
- ✅ Role-based access control

## 📁 Project Structure

```
app/
├── api/              # API routes
│   ├── auth/        # Authentication
│   ├── upload/      # File processing
│   └── query/       # RAG queries
├── auth/            # Auth pages
├── dashboard/       # Main app
components/          # React components
lib/
├── gemini/         # Gemini integration
├── parsers/        # File text extraction
├── supabase/       # Database clients
└── types/          # TypeScript types
supabase/
└── migrations/     # Database schema
```

## 🧪 Testing

### Create Test Account
```
1. Go to http://localhost:3000
2. Click "Sign up"
3. Choose "Business Owner" role
4. Sign in
```

### Upload Document
```
1. Drag & drop PDF/Word/Excel
2. Select visibility (who can access)
3. Wait for processing
```

### Ask Questions
```
1. Type question in chat interface
2. Get AI-generated answer
3. View source documents
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for details.

## ⚙️ Configuration

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Auth
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

# AI
GEMINI_API_KEY=your_gemini_key
```

## 📈 Performance

- **Upload:** 5-40 seconds (depends on file size)
- **Query:** 3-6 seconds (vector search + AI generation)
- **Embeddings:** 768 dimensions (Gemini embedding-001)

## 🐛 Troubleshooting

### App Won&apos;t Start
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### No Search Results
- Upload documents first
- Check document visibility matches your role
- Verify embeddings were created in Supabase

### Upload Fails
- Check Supabase Storage bucket exists
- Verify Gemini API key is valid
- Check file is PDF/DOCX/XLSX

## 🛣️ Roadmap

Current MVP includes core functionality. Future enhancements:

- [ ] Advanced chunking strategies
- [ ] Metadata extraction
- [ ] Hybrid search (keyword + vector)
- [ ] Conversation history
- [ ] Streaming responses
- [ ] Analytics dashboard

## 📝 License

MIT

## 🤝 Contributing

This is an MVP project. Contributions welcome for:
- Bug fixes
- Documentation improvements
- Performance optimizations
- Additional file format support

## 📞 Support

- Check [SETUP_README.md](SETUP_README.md) for detailed setup
- Review [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for architecture
- See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for deployment

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Google Gemini](https://ai.google.dev/)
- [NextAuth.js](https://next-auth.js.org/)

---

**Ready to get started?** See [QUICK_START.md](QUICK_START.md)

**Need help?** Check [SETUP_README.md](SETUP_README.md)

**Going to production?** Use [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
