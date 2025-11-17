# Gemini API Model Names (v1beta)

## ✅ Correct Model Names for Edge Functions

### Embedding Models
- ✅ **`models/text-embedding-004`** - Latest embedding model (768 dimensions)
- ❌ `text-embedding-004` - Missing `models/` prefix
- ❌ `embedding-001` - Old model name

### Text Generation Models
- ✅ **`models/gemini-1.5-flash-latest`** - Fast, cost-effective
- ✅ **`models/gemini-1.5-pro-latest`** - Advanced reasoning
- ❌ `gemini-1.5-flash` - Missing `models/` prefix
- ❌ `gemini-pro` - Old model name

## 🔧 Updated Edge Functions

### generate-embeddings
```typescript
const model = genAI.getGenerativeModel({ 
  model: 'models/text-embedding-004' 
})
```

### query-rag
```typescript
// For embeddings
const embeddingModel = genAI.getGenerativeModel({ 
  model: 'models/text-embedding-004' 
})

// For answer generation
const answerModel = genAI.getGenerativeModel({ 
  model: 'models/gemini-1.5-flash-latest' 
})
```

## 📝 Important Notes

1. **Always include `models/` prefix** in Gemini API v1beta
2. **Both functions must use same embedding model** for consistency
3. **`text-embedding-004`** produces 768-dimensional vectors (matches database schema)
4. **Redeploy ALL Edge Functions** after changing model names

## 🚀 Deployment Checklist

- [ ] Update `generate-embeddings/index.ts` with `models/text-embedding-004`
- [ ] Update `query-rag/index.ts` with both models
- [ ] Deploy `generate-embeddings` to Supabase Dashboard
- [ ] Deploy `query-rag` to Supabase Dashboard
- [ ] Test document upload (should complete successfully)
- [ ] Test query (should generate answer)

## 🔗 API Documentation

https://ai.google.dev/gemini-api/docs/models/gemini
