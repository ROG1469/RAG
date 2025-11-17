# 📦 Template-Ordner Inhalt

## ✅ Was ist drin?

### 📄 Dokumentation
- ✅ `README_TEMPLATE.md` - Anleitung zur Template-Nutzung
- ✅ `INHALT.md` - Diese Datei (Übersicht)
- ✅ `PROJECT_SETUP.md` - Schritt-für-Schritt Setup-Checkliste
- ✅ `AI_DEVELOPMENT_GUIDE.md` - Best Practices (generisch, 1:1 kopierbar)

### 🤖 AI-Konfiguration (Templates - müssen angepasst werden)
- ✅ `AI_CONTEXT.md.template` → umbenennen zu `AI_CONTEXT.md`
- ✅ `.github/copilot-instructions.md.template` → umbenennen zu `copilot-instructions.md`
- ✅ `.cursorrules.template` → umbenennen zu `.cursorrules`

### ⚙️ Code Quality (1:1 kopierbar)
- ✅ `.editorconfig` - Editor-übergreifende Einstellungen
- ✅ `.eslintrc.json` - ESLint Konfiguration
- ✅ `.prettierrc.json` - Prettier Konfiguration
- ✅ `cspell.json` - Deutsches Wörterbuch

### 💻 VSCode (1:1 kopierbar)
- ✅ `.vscode/settings.json` - VSCode Einstellungen
- ✅ `.vscode/extensions.json` - Empfohlene Extensions

### 🗄️ Scripts (optional, falls Supabase)
- ✅ `scripts/analyze-database.ts` - Datenbank-Analyse Tool

---

## 🚀 Schnellstart für neues Projekt

### Schritt 1: Projekt erstellen
```bash
npx create-next-app@latest mein-projekt
cd mein-projekt
```

### Schritt 2: Template kopieren
```bash
# Kopiere gesamten __project-template Ordner in dein neues Projekt
# ODER kopiere einzelne Dateien manuell
```

### Schritt 3: .template Dateien umbenennen
```bash
# Diese 3 Dateien MÜSSEN umbenannt werden:
AI_CONTEXT.md.template → AI_CONTEXT.md
.github/copilot-instructions.md.template → copilot-instructions.md  
.cursorrules.template → .cursorrules
```

### Schritt 4: Anpassen
Öffne und passe an:
- ✏️ `AI_CONTEXT.md` - Trage Projektname, Stack, Routen ein
- ✏️ `copilot-instructions.md` - Trage Projektname, Features ein
- ✏️ `.cursorrules` - Trage Projektname, Quick Reference ein

### Schritt 5: Dependencies & Setup
```bash
npm install
npx husky-init && npm install
npm run dev
```

### Schritt 6: VSCode neu laden & testen!
```
Strg+Shift+P → "Developer: Reload Window"
```

---

## 📊 Datei-Kategorien

| Kategorie | Dateien | Aktion |
|-----------|---------|---------|
| **Dokumentation** | README, PROJECT_SETUP, AI_DEVELOPMENT_GUIDE | 📋 Kopieren |
| **AI Templates** | AI_CONTEXT, copilot-instructions, cursorrules | ✏️ Umbenennen & Anpassen |
| **Code Quality** | .editorconfig, eslint, prettier, cspell | 📋 Kopieren |
| **VSCode** | settings.json, extensions.json | 📋 Kopieren |
| **Scripts** | analyze-database.ts | 📋 Kopieren (optional) |

---

## 💾 Template aktualisieren

Wenn du Verbesserungen machst:
1. Ändere Datei in deinem aktuellen Projekt
2. Kopiere zurück zum Template-Ordner
3. Nächstes Projekt profitiert davon!

---

## 📁 Empfohlene Ordner-Struktur

```
C:\coden\
├── __project-templates\           ← Verschiebe hierher!
│   └── nextjs-ai-starter\
│       ├── README_TEMPLATE.md
│       ├── INHALT.md
│       ├── AI_CONTEXT.md.template
│       └── ... (alle Template-Dateien)
│
├── mein-projekt-1\                ← Neue Projekte
├── mein-projekt-2\
└── lehrer-tool\                   ← Aktuelles Projekt
```

---

## ✨ Was du jetzt hast

### Für schnelles Projekt-Setup:
- ✅ Alle AI-Konfigurationen fertig
- ✅ Code Quality Tools vorkonfiguriert  
- ✅ VSCode optimal eingerichtet
- ✅ Dokumentation vorhanden
- ✅ Best Practices definiert

### Zeit-Ersparnis pro Projekt:
- ⏱️ Setup: Von 2-3 Stunden auf 15-20 Minuten
- 🤖 AI arbeitet sofort mit vollem Kontext
- 📝 Keine Dokumentation vergessen
- ✅ Konsistente Code-Qualität

---

## 🎯 Nächste Schritte

1. **Jetzt:** Verschiebe `__project-template` nach `C:\coden\__project-templates\nextjs-ai-starter\`
2. **Entferne:** Lösche `__project-template` aus dem aktuellen Projekt (lehrer-tool)
3. **Bei neuem Projekt:** Kopiere Template → Passe an → Los geht's!

---

**Template Version:** 1.0  
**Erstellt:** Oktober 2025  
**Für:** Next.js 14+ Projekte mit AI-Optimierung
