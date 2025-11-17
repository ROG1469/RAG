# AI Development Guide - Lehrer-Verwaltungstool

## 📘 Zweck dieses Dokuments

Dieser Guide hilft dir (AI) dabei, effizienter und konsistenter mit diesem Projekt zu arbeiten. Er enthält:
- Coding-Konventionen und Best Practices
- Häufige Probleme und deren Lösungen
- Architektur-Entscheidungen
- Workflow-Empfehlungen

## 🎯 Projekt-Kontext verstehen

### Bevor du Code schreibst, prüfe:
1. **Ist es für Lehrer oder Admin?**
   - Lehrer-Features → `/app/(lehrer-routes)/`
   - Admin-Features → `/app/admin/`

2. **Welche Datenbank-Tabelle ist betroffen?**
   - Siehe `AI_CONTEXT.md` für Tabellen-Übersicht
   - Prüfe bestehende Types in `lib/types/`

3. **Gibt es bereits ähnliche Funktionen?**
   - Suche in `/app/actions/` nach ähnlichen Server Actions
   - Prüfe `/lib/supabase/` für bestehende Queries

## 🏗️ Architektur-Prinzipien

### 1. Server Actions First
**Warum?** Sicherheit und Performance

```typescript
// ✅ RICHTIG: Server Action
// app/actions/teacher-actions.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'

export async function updateTeacherProfile(teacherId: string, data: any) {
  const supabase = await createServerClient()
  
  // Auth-Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Datenbank-Operation
  const { data: teacher, error } = await supabase
    .from('teachers')
    .update(data)
    .eq('id', teacherId)
    .single()
    
  if (error) throw error
  return teacher
}
```

```typescript
// ❌ FALSCH: Direkte Client-Calls in Components
// components/TeacherProfile.tsx
const supabase = createBrowserClient()
const { data } = await supabase.from('teachers').update(...)
```

### 2. Type-Safety überall
**Warum?** Frühe Fehler-Erkennung und bessere DX

```typescript
// ✅ RICHTIG: Definiere Types
interface AbsenceFormData {
  type: 'vacation' | 'sick' | 'training' | 'other'
  start_date: string
  end_date: string
  reason?: string
  affected_classes?: string[]
}

export async function createAbsence(data: AbsenceFormData) {
  // TypeScript prüft automatisch
}
```

```typescript
// ❌ FALSCH: any Types
export async function createAbsence(data: any) {
  // Keine Type-Sicherheit!
}
```

### 3. Modulare Struktur
**Warum?** Wartbarkeit und Testbarkeit

```typescript
// ✅ RICHTIG: Modulare Organisation
// lib/supabase/absences/queries.ts
export async function getAbsenceById(id: string) { ... }
export async function getAbsencesByTeacher(teacherId: string) { ... }

// lib/supabase/absences/mutations.ts
export async function createAbsence(data: AbsenceData) { ... }
export async function updateAbsence(id: string, data: Partial<AbsenceData>) { ... }

// lib/supabase/absences/admin.ts
export async function approveAbsence(id: string, adminId: string) { ... }
```

## 💻 Coding-Konventionen

### Datei-Naming
```
✅ kebab-case für Dateien:
   absence-management.tsx
   teacher-profile-actions.ts
   vacation-gantt.tsx

✅ PascalCase für Components:
   AbsenceCard.tsx
   TeacherTable.tsx
   VacationRequestModal.tsx
```

### Import-Organisation
**Automatisch durch ESLint**, aber hier die Reihenfolge:

```typescript
// 1. External libraries
import { useState } from 'react'
import { Calendar } from 'lucide-react'

// 2. Internal absolute imports
import { createServerClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

// 3. Relative imports
import { AbsenceCard } from './AbsenceCard'
import type { Absence } from '../types'
```

### Funktions-Namen
```typescript
// Server Actions: Verb + Noun
createAbsence()
updateTeacherProfile()
deleteVacationRequest()
getAbsencesByTeacher()

// Event Handlers: handle + Event
handleSubmit()
handleDelete()
handleApprove()

// Boolean Functions: is/has/can + Adjective
isAdmin()
hasActiveClasses()
canApproveAbsence()
```

### Komponenten-Struktur
```typescript
// ✅ RICHTIG: Konsistente Struktur
export default function TeacherProfile() {
  // 1. Hooks
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  // 2. Derived State
  const isComplete = profile?.completeness === 100
  
  // 3. Event Handlers
  const handleSubmit = async (e: FormEvent) => {
    // ...
  }
  
  // 4. Effects
  useEffect(() => {
    // ...
  }, [])
  
  // 5. Early Returns
  if (loading) return <Spinner />
  if (!profile) return <NotFound />
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

## 🗄️ Datenbank-Best-Practices

### ⚠️ WICHTIG: Neue Tabellen erstellen

**Bei JEDER neuen Tabelle MUSS dies gemacht werden:**

```sql
-- 1. Tabelle erstellen
CREATE TABLE IF NOT EXISTS public.neue_tabelle (
  id SERIAL PRIMARY KEY,
  -- ... weitere Spalten
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. RLS aktivieren
ALTER TABLE public.neue_tabelle ENABLE ROW LEVEL SECURITY;

-- 3. Policy für Service-Role (WICHTIG für Datenbank-Analyse!)
CREATE POLICY service_role_access ON public.neue_tabelle
  FOR SELECT
  TO service_role
  USING (true);

-- 4. Weitere Policies für normale User
CREATE POLICY user_select ON public.neue_tabelle
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

**Warum?** 
- `service_role_access` Policy ermöglicht `npm run db:analyze`
- Ohne diese Policy kann das Analyse-Tool die Tabelle nicht sehen
- Siehe `docs/SUPABASE_SETUP.sql` für vollständiges Setup

### Query-Optimierung
```typescript
// ✅ RICHTIG: Selective Columns
const { data } = await supabase
  .from('teachers')
  .select('id, name, email')  // Nur benötigte Felder
  .eq('id', teacherId)
  .single()

// ❌ FALSCH: Select *
const { data } = await supabase
  .from('teachers')
  .select('*')  // Alle Felder, auch ungenutzte
  .eq('id', teacherId)
  .single()
```

### Joins richtig nutzen
```typescript
// ✅ RICHTIG: Effiziente Joins
const { data } = await supabase
  .from('absences')
  .select(`
    id,
    type,
    start_date,
    end_date,
    teacher:teachers (
      id,
      name,
      email
    )
  `)
  .eq('status', 'pending')
```

### RLS beachten
```typescript
// ⚠️ WICHTIG: RLS Policies beachten
// Service-Role-Key umgeht RLS → nur serverseitig!
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Nur in Server Actions!
)

// Normaler Client respektiert RLS
const supabase = createBrowserClient()  // RLS wird angewendet
```

## 🔍 Debugging-Strategien

### 1. Server Actions Debuggen
```typescript
export async function createAbsence(data: AbsenceFormData) {
  'use server'
  
  console.log('🚀 Creating absence with data:', data)
  
  try {
    const supabase = await createServerClient()
    const { data: absence, error } = await supabase
      .from('absences')
      .insert(data)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }
    
    console.log('✅ Absence created:', absence)
    return absence
  } catch (err) {
    console.error('💥 Unexpected error:', err)
    throw err
  }
}
```

### 2. Client-Side State Debuggen
```typescript
// React DevTools nutzen!
const [absences, setAbsences] = useState<Absence[]>([])

useEffect(() => {
  console.log('📊 Absences updated:', absences)
}, [absences])
```

### 3. Supabase Queries Testen
```typescript
// Test-Query in Supabase Studio SQL Editor:
SELECT 
  a.*,
  t.name as teacher_name
FROM absences a
JOIN teachers t ON t.id = a.teacher_id
WHERE a.status = 'pending'
ORDER BY a.start_date DESC;
```

## ⚠️ Häufige Fehler vermeiden

### 1. Auth-Status nicht geprüft
```typescript
// ❌ FALSCH
export async function deleteTeacher(id: string) {
  const supabase = await createServerClient()
  return await supabase.from('teachers').delete().eq('id', id)
}

// ✅ RICHTIG
export async function deleteTeacher(id: string) {
  const supabase = await createServerClient()
  
  // Auth-Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Admin-Check (falls nötig)
  const { data: teacher } = await supabase
    .from('teachers')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()
    
  if (!teacher?.is_admin) throw new Error('Forbidden')
  
  return await supabase.from('teachers').delete().eq('id', id)
}
```

### 2. Falsche Error-Behandlung
```typescript
// ❌ FALSCH: Error schlucken
try {
  await createAbsence(data)
} catch (error) {
  console.log(error)  // Error wird verschwiegen!
}

// ✅ RICHTIG: Error behandeln
try {
  await createAbsence(data)
  toast.success('Abwesenheit erstellt')
  router.push('/dashboard')
} catch (error) {
  console.error('Failed to create absence:', error)
  toast.error('Fehler beim Erstellen der Abwesenheit')
  // User bekommt Feedback!
}
```

### 3. Unendliche Re-Renders
```typescript
// ❌ FALSCH: Dependency fehlt
useEffect(() => {
  fetchAbsences()  // fetchAbsences ändert sich bei jedem Render!
}, [])

// ✅ RICHTIG: useCallback verwenden
const fetchAbsences = useCallback(async () => {
  // ...
}, [/* dependencies */])

useEffect(() => {
  fetchAbsences()
}, [fetchAbsences])
```

### 4. Date-Handling
```typescript
// ❌ FALSCH: Direkte String-Verarbeitung
const date = '2024-01-15'
const formatted = date.split('-').reverse().join('.')  // Fehleranfällig!

// ✅ RICHTIG: Date-Objekte nutzen
const date = new Date('2024-01-15')
const formatted = date.toLocaleDateString('de-DE')  // 15.01.2024
```

## 🔄 Feature-Development-Workflow

### 1. Requirement verstehen
- Was soll das Feature tun?
- Für wen ist es? (Admin/Lehrer)
- Welche Daten werden benötigt?

### 2. Datenbank prüfen
- Gibt es die benötigten Tabellen?
- Sind Indizes vorhanden?
- RLS Policies korrekt?

### 3. Types definieren
```typescript
// lib/types/vacation.ts
export interface VacationRequest {
  id: string
  teacher_id: string
  start_date: string
  end_date: string
  status: 'pending' | 'approved' | 'rejected'
  internal_notes?: string
  created_at: string
}
```

### 4. Server Actions erstellen
```typescript
// app/actions/vacation-actions.ts
'use server'

export async function createVacationRequest(data: VacationRequestInput) {
  // ...
}

export async function approveVacationRequest(id: string) {
  // ...
}
```

### 5. UI-Komponenten bauen
```typescript
// components/VacationRequestForm.tsx
'use client'

export function VacationRequestForm() {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await createVacationRequest(formData)
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

### 6. Page erstellen
```typescript
// app/vacation/page.tsx
import { VacationRequestForm } from '@/components/VacationRequestForm'

export default function VacationPage() {
  return (
    <div>
      <h1>Urlaubsantrag stellen</h1>
      <VacationRequestForm />
    </div>
  )
}
```

### 7. Testen
- Manuelles Testing in Browser
- Edge Cases prüfen
- Error-Handling testen

## 📊 Performance-Tipps

### 1. Server Components bevorzugen
```typescript
// ✅ RICHTIG: Server Component (default)
export default async function DashboardPage() {
  const absences = await getAbsences()  // Direct DB call
  return <AbsenceList absences={absences} />
}

// Nur Client Component wenn nötig:
'use client'  // Für Interaktivität (onClick, useState, etc.)
```

### 2. Lazy Loading für große Listen
```typescript
// Pagination statt alle Daten laden
const { data, count } = await supabase
  .from('absences')
  .select('*', { count: 'exact' })
  .range(0, 49)  // Erste 50 Items
```

### 3. Optimistic Updates
```typescript
// UI sofort updaten, dann DB
const optimisticAbsence = { ...newAbsence, id: 'temp' }
setAbsences([...absences, optimisticAbsence])

try {
  const created = await createAbsence(newAbsence)
  setAbsences(prev => prev.map(a => 
    a.id === 'temp' ? created : a
  ))
} catch (error) {
  setAbsences(prev => prev.filter(a => a.id !== 'temp'))
  toast.error('Fehler beim Erstellen')
}
```

## 🧪 Testing-Ansätze

### Manuelle Tests
1. **Happy Path**: Normaler Workflow funktioniert
2. **Error Cases**: Was passiert bei Fehlern?
3. **Edge Cases**: Leere Listen, lange Texte, etc.
4. **Permissions**: Lehrer vs Admin Zugriff

### Test-Daten erstellen
```typescript
// Nutze Admin-UI oder SQL:
INSERT INTO teachers (name, email, user_id) VALUES
  ('Test Lehrer', 'test@example.com', (SELECT id FROM auth.users WHERE email = 'test@example.com'));
```

## 📚 Wichtige Ressourcen

### Interne Docs
- `AI_CONTEXT.md` - Projekt-Übersicht
- `docs/ABSENCE_SYSTEM_FINAL_DOCS.md` - Abwesenheits-System
- `docs/AUTH_SETUP_GUIDE.md` - Auth-Konfiguration
- `docs/RLS_POLICIES.md` - Security

### External Docs
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🎓 Learning from Past Mistakes

### Migration: vacation_requests Tabelle
**Problem**: Neue Tabelle für Urlaube parallel zu absences
**Lösung**: Beide Systeme unterstützen, später konsolidieren
**Learnings**: 
- Nicht zu früh refactoren
- Migrations step-by-step
- Backwards compatibility wichtig

### RLS Policies: Admin-Zugriff
**Problem**: Admin konnte keine anderen Lehrer sehen
**Lösung**: Separate Policies für Admin-Rolle
**Learnings**:
- RLS Policies genau testen
- Service-Role-Key für Admin-Ops nutzen
- Policy-Hierarchie beachten

### Client vs Server Components
**Problem**: "useRouter" in Server Component
**Lösung**: 'use client' Directive hinzufügen
**Learnings**:
- Genau verstehen wann Client Component nötig
- Hooks = Client Component
- Interaktivität = Client Component

## 💡 Pro-Tipps für AI

### 1. Context bewahren
- Lies immer `AI_CONTEXT.md` zuerst
- Prüfe bestehende ähnliche Features
- Verstehe die Architektur vor Code-Änderungen

### 2. Frage nach wenn unklar
- Besser nachfragen als falsche Assumptions
- User kennt Business-Logik besser
- Edge Cases erfragen

### 3. Schritt-für-Schritt
- Nicht alles auf einmal ändern
- Erst ein Feature, dann nächstes
- User kann testen zwischen Änderungen

### 4. Erkläre deine Entscheidungen
- Warum diese Lösung?
- Welche Alternativen gibt es?
- Was sind die Trade-offs?

### 5. Code-Qualität
- ESLint/Prettier laufen lassen
- Types immer definieren
- Kommentare für komplexe Logik

## 🚀 Zusammenfassung

**Die wichtigsten Regeln:**

1. ✅ Server Actions für DB-Operationen
2. ✅ Types für alles definieren
3. ✅ Auth-Checks in Server Actions
4. ✅ Modulare Struktur beibehalten
5. ✅ Error-Handling nicht vergessen
6. ✅ Performance im Blick (Server Components)
7. ✅ RLS Policies respektieren
8. ✅ Code-Qualität (lint + format)

**Bei Unsicherheit:**
- Prüfe `AI_CONTEXT.md`
- Schaue bestehenden Code an
- Frage den User

Happy Coding! 🎉
