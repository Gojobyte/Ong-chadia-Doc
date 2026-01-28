# 18. Recommandations Techniques - Epics 8, 9, 10

**Date** : 2025-01-27
**Architecte** : Winston
**Statut** : Validé

---

## Executive Summary

### Recommandations Principales

| Catégorie | Choix Recommandé | Alternative |
|-----------|------------------|-------------|
| Éditeur Texte | **TipTap** | Quill 2.0 |
| Éditeur Tableur | **Handsontable** (non-commercial) ou **Luckysheet** (gratuit) | AG Grid Community |
| Collaboration | **Yjs + y-prosemirror** | Liveblocks (managed) |
| Mode Offline | **Workbox + Dexie.js (IndexedDB)** | idb + custom SW |
| Signature | **react-signature-canvas** | signature_pad direct |
| Génération PDF | **React-PDF** (client) + **Puppeteer** (serveur) | jsPDF + html2canvas |

### Estimation Effort

| Epic | Effort Estimé | Risque |
|------|---------------|--------|
| Epic 8 (Éditeur + Collab) | 15-20 jours | 🔴 Élevé |
| Epic 9 (Offline + Mobile) | 10-15 jours | 🔴 Élevé |
| Epic 10 (Reporting) | 8-12 jours | 🟡 Moyen |

---

## 1. Éditeur de Documents Texte (Epic 8.1)

### Recommandation : TipTap

**Raison** : TipTap offre le meilleur équilibre entre facilité d'utilisation, extensibilité et support de la collaboration.

| Critère | TipTap | Quill | Slate |
|---------|--------|-------|-------|
| Facilité | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Extensibilité | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Collaboration | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Documentation | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Maintenance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**Installation** :
```bash
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-collaboration
```

**Architecture** :
- Basé sur ProseMirror (battle-tested)
- Extensions modulaires
- Support natif Yjs pour collaboration

**Export .docx** : Utiliser `docx` library
```bash
pnpm add docx file-saver
```

**Sources** :
- [Liveblocks Blog - Which editor to choose in 2025](https://liveblocks.io/blog/which-rich-text-editor-framework-should-you-choose-in-2025)
- [Velt - Best JavaScript Rich Text Editors](https://velt.dev/blog/best-javascript-rich-text-editors-react)
- [npm-compare TipTap vs Quill vs Slate](https://npm-compare.com/@tiptap/core,quill,slate)

---

## 2. Éditeur de Tableurs (Epic 8.2)

### Recommandation : Luckysheet (gratuit) ou Handsontable (si budget)

**Pour projet ONG (budget limité)** : **Luckysheet**
- MIT License, gratuit
- Full Excel-like (formules, multi-sheets)
- Bonne base mais moins de support

**Si budget disponible** : **Handsontable**
- Plus mature et stable
- Meilleur support React
- $899/dev/an pour commercial

| Critère | Luckysheet | Handsontable | AG Grid |
|---------|------------|--------------|---------|
| Prix | Gratuit | $899/dev/an | Gratuit (Community) |
| Formules Excel | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Multi-sheets | ✅ | ✅ | ❌ |
| React Integration | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Performance | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Installation Luckysheet** :
```bash
pnpm add luckysheet
```

**Moteur de formules** : HyperFormula (utilisé par Handsontable)
```bash
pnpm add hyperformula
```

**Export Excel** : SheetJS
```bash
pnpm add xlsx
```

**Sources** :
- [npm trends comparison](https://npmtrends.com/ag-grid-vs-handsontable-vs-jsgrid-vs-luckysheet-vs-x-data-spreadsheet)
- [Univer Blog - Best Spreadsheet Components 2025](https://blog.univer.ai/posts/10-best-spreadsheet-components-for-developers-in-2025/)
- [The Frontend Company - Handsontable Alternatives](https://www.thefrontendcompany.com/posts/handsontable-alternatives)

---

## 3. Collaboration Temps Réel (Epic 8.4)

### Recommandation : Yjs + WebSocket

**Pourquoi Yjs** :
- CRDT (Conflict-free Replicated Data Type)
- Fonctionne offline-first
- Intégration native avec TipTap (y-prosemirror)
- Gratuit et open-source

**Architecture** :

```
┌─────────────┐     WebSocket      ┌─────────────┐
│   Client 1  │◄──────────────────►│   y-websocket│
│   (Yjs)     │                    │   Server     │
└─────────────┘                    └─────────────┘
       ▲                                  ▲
       │         Sync CRDT                │
       ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│   Client 2  │◄──────────────────►│  IndexedDB  │
│   (Yjs)     │                    │  (offline)  │
└─────────────┘                    └─────────────┘
```

**Installation** :
```bash
# Client
pnpm add yjs y-websocket y-prosemirror y-indexeddb

# Serveur
pnpm add y-websocket ws
```

**Alternative Managed** : Liveblocks
- Plus simple à intégrer
- Payant ($25/mois pour 100 MAU)
- Moins de contrôle

**Sources** :
- [Yjs Documentation](https://docs.yjs.dev/)
- [GitHub Yjs](https://github.com/yjs/yjs)
- [DEV.to - Building Collaborative App with Yjs](https://dev.to/route06/tutorial-building-a-collaborative-editing-app-with-yjs-valtio-and-react-1mcl)

---

## 4. Mode Offline + Synchronisation (Epic 9.1)

### Recommandation : Workbox + Dexie.js

**Stack Offline** :

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| Service Worker | **Workbox** | Cache assets, interception requêtes |
| Stockage données | **Dexie.js** (IndexedDB) | Données structurées |
| Cache API | Native | Ressources statiques |
| Sync | Custom + Yjs | Résolution conflits |

**Architecture** :

```
┌─────────────────────────────────────────────┐
│                  Application                 │
├─────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────────────┐ │
│  │ TanStack    │    │    Dexie.js         │ │
│  │ Query       │◄──►│    (IndexedDB)      │ │
│  └─────────────┘    └─────────────────────┘ │
├─────────────────────────────────────────────┤
│              Service Worker (Workbox)        │
│  ┌─────────────┐    ┌─────────────────────┐ │
│  │ Cache API   │    │ Background Sync     │ │
│  │ (assets)    │    │ Queue               │ │
│  └─────────────┘    └─────────────────────┘ │
├─────────────────────────────────────────────┤
│                   Network                    │
└─────────────────────────────────────────────┘
```

**Installation** :
```bash
pnpm add workbox-webpack-plugin dexie dexie-react-hooks
```

**Stratégie de sync** :
1. Modifications stockées localement (IndexedDB)
2. Queue de sync (Background Sync API)
3. Retry automatique au retour connexion
4. Résolution conflits : timestamp-based ou CRDT

**Sources** :
- [LogRocket - Offline-first Frontend Apps 2025](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/)
- [Web.dev - Offline Data](https://web.dev/learn/pwa/offline-data)
- [Talent500 - Developing PWA](https://talent500.com/blog/developing-a-pwa/)

---

## 5. Signature Électronique (Epic 9.3)

### Recommandation : react-signature-canvas

**Pourquoi** :
- Wrapper léger autour de signature_pad
- 100% test coverage
- TypeScript support
- Active maintenance

**Installation** :
```bash
pnpm add react-signature-canvas
pnpm add -D @types/signature_pad
```

**Intégration PDF** : pdf-lib
```bash
pnpm add pdf-lib
```

**Sources** :
- [react-signature-canvas npm](https://www.npmjs.com/package/react-signature-canvas)
- [GitHub react-signature-canvas](https://github.com/agilgur5/react-signature-canvas)

---

## 6. Génération de Rapports PDF (Epic 10.3)

### Recommandation : Approche Hybride

| Contexte | Solution | Raison |
|----------|----------|--------|
| Client-side simple | **jsPDF** | Léger, rapide |
| Client-side React | **@react-pdf/renderer** | Composants React natifs |
| Server-side complexe | **Puppeteer** | Rendu fidèle HTML→PDF |
| Templating | **Carbone** | Templates Word/Excel→PDF |

**Architecture recommandée** :

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│  ┌─────────────────────────────────────────┐│
│  │  Export simple      │  Export complexe  ││
│  │  (jsPDF client)     │  → API call       ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│                  Backend API                 │
│  ┌─────────────────────────────────────────┐│
│  │  POST /api/reports/generate             ││
│  │  → Queue job (BullMQ)                   ││
│  │  → Puppeteer render                     ││
│  │  → Upload to Storage                    ││
│  │  → Return URL                           ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

**Installation** :
```bash
# Client
pnpm add jspdf @react-pdf/renderer

# Server
pnpm add puppeteer bullmq
```

**Sources** :
- [DEV.to - PDF Libraries Comparison](https://dev.to/handdot/generate-a-pdf-in-js-summary-and-comparison-of-libraries-3k0p)
- [Nutrient - JavaScript PDF Libraries 2025](https://www.nutrient.io/blog/javascript-pdf-libraries/)
- [LogRocket - HTML to PDF Node.js](https://blog.logrocket.com/best-html-pdf-libraries-node-js/)

---

## 7. Dépendances Recommandées

### Package.json Additions (apps/web)

```json
{
  "dependencies": {
    "@tiptap/react": "^2.x",
    "@tiptap/starter-kit": "^2.x",
    "@tiptap/extension-collaboration": "^2.x",
    "yjs": "^13.x",
    "y-prosemirror": "^1.x",
    "y-indexeddb": "^9.x",
    "dexie": "^4.x",
    "dexie-react-hooks": "^1.x",
    "luckysheet": "^2.x",
    "xlsx": "^0.18.x",
    "react-signature-canvas": "^1.x",
    "jspdf": "^2.x",
    "@react-pdf/renderer": "^3.x",
    "docx": "^8.x",
    "file-saver": "^2.x"
  }
}
```

### Package.json Additions (apps/api)

```json
{
  "dependencies": {
    "y-websocket": "^1.x",
    "ws": "^8.x",
    "puppeteer": "^22.x",
    "bullmq": "^5.x",
    "pdf-lib": "^1.x"
  }
}
```

---

## 8. Risques et Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Complexité Yjs | Élevé | Commencer par TipTap seul, ajouter collab ensuite |
| Performance Luckysheet | Moyen | Limiter taille datasets, lazy loading |
| Offline sync conflicts | Élevé | Stratégie CRDT avec Yjs |
| Bundle size | Moyen | Code splitting, lazy loading composants |
| iOS Safari PWA limits | Moyen | Tester tôt, fallbacks pour limitations |

---

## 9. Ordre d'Implémentation Recommandé

```
Phase 1 (Semaine 1-2): Foundation
├── TipTap éditeur basique
├── Visualiseur documents (PDF, images)
└── Export .docx simple

Phase 2 (Semaine 3-4): Tableur
├── Luckysheet intégration
├── Formules de base
└── Import/Export Excel

Phase 3 (Semaine 5-6): Collaboration
├── Yjs setup + WebSocket server
├── TipTap collaboration
└── Curseurs et présence

Phase 4 (Semaine 7-8): Offline
├── Service Worker (Workbox)
├── IndexedDB (Dexie)
└── Sync queue

Phase 5 (Semaine 9-10): Mobile & Reporting
├── Signature électronique
├── Génération PDF
└── Portail bailleur
```

---

*Document généré par Winston (Architect) - 2025-01-27*
