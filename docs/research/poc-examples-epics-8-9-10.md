# POC Examples - Epics 8, 9, 10

**Date** : 2025-01-27
**Architecte** : Winston

Ces exemples de code permettent de valider rapidement les choix techniques avant implémentation complète.

---

## POC 1 : TipTap Éditeur de Base

### Installation
```bash
cd apps/web
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
```

### Code
```tsx
// apps/web/src/components/editor/TipTapEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface TipTapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
}

export function TipTapEditor({ content = '', onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Commencez à écrire...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded-lg">
      {/* Toolbar */}
      <div className="flex gap-1 p-2 border-b bg-muted/50">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-primary text-white' : 'hover:bg-muted'}`}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-primary text-white' : 'hover:bg-muted'}`}
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-primary text-white' : 'hover:bg-muted'}`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-primary text-white' : 'hover:bg-muted'}`}
        >
          • List
        </button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose max-w-none p-4 min-h-[300px] focus:outline-none"
      />
    </div>
  );
}
```

### Test
```tsx
// Usage dans une page
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { useState } from 'react';

export function DocumentEditPage() {
  const [content, setContent] = useState('<p>Hello World</p>');

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Éditeur de Document</h1>
      <TipTapEditor content={content} onChange={setContent} />
      <pre className="mt-4 p-2 bg-muted text-xs">{content}</pre>
    </div>
  );
}
```

---

## POC 2 : Export DOCX

### Installation
```bash
pnpm add docx file-saver
pnpm add -D @types/file-saver
```

### Code
```tsx
// apps/web/src/lib/export-docx.ts
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

interface ExportOptions {
  title: string;
  content: string; // HTML content
}

export async function exportToDocx({ title, content }: ExportOptions) {
  // Parse HTML to extract text (simplified)
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');

  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
    })
  );

  // Content paragraphs
  doc.body.querySelectorAll('p, h1, h2, h3, li').forEach((el) => {
    const text = el.textContent || '';
    const tagName = el.tagName.toLowerCase();

    if (tagName === 'h1') {
      children.push(new Paragraph({ text, heading: HeadingLevel.HEADING_1 }));
    } else if (tagName === 'h2') {
      children.push(new Paragraph({ text, heading: HeadingLevel.HEADING_2 }));
    } else if (tagName === 'li') {
      children.push(new Paragraph({ text, bullet: { level: 0 } }));
    } else {
      children.push(new Paragraph({ children: [new TextRun(text)] }));
    }
  });

  const document = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(document);
  saveAs(blob, `${title}.docx`);
}
```

### Usage
```tsx
<button onClick={() => exportToDocx({ title: 'Mon Rapport', content })}>
  Exporter en Word
</button>
```

---

## POC 3 : Signature Électronique

### Installation
```bash
pnpm add react-signature-canvas
```

### Code
```tsx
// apps/web/src/components/signature/SignaturePad.tsx
import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
}

export function SignaturePad({ onSave }: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    sigRef.current?.clear();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <p className="text-sm text-muted-foreground mb-2">
        Signez dans la zone ci-dessous
      </p>

      <div className="border rounded bg-white">
        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          canvasProps={{
            width: 500,
            height: 200,
            className: 'signature-canvas',
          }}
          onBegin={() => setIsEmpty(false)}
        />
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleClear}
          className="px-4 py-2 border rounded hover:bg-muted"
        >
          Effacer
        </button>
        <button
          onClick={handleSave}
          disabled={isEmpty}
          className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
        >
          Valider
        </button>
      </div>
    </div>
  );
}
```

---

## POC 4 : Mode Offline avec Dexie.js

### Installation
```bash
pnpm add dexie dexie-react-hooks
```

### Code
```tsx
// apps/web/src/lib/db.ts
import Dexie, { Table } from 'dexie';

interface OfflineDocument {
  id: string;
  projectId: string;
  title: string;
  content: string;
  updatedAt: Date;
  synced: boolean;
}

interface SyncQueue {
  id?: number;
  type: 'create' | 'update' | 'delete';
  entity: string;
  entityId: string;
  data: any;
  createdAt: Date;
}

class AppDatabase extends Dexie {
  documents!: Table<OfflineDocument>;
  syncQueue!: Table<SyncQueue>;

  constructor() {
    super('ong-platform-db');
    this.version(1).stores({
      documents: 'id, projectId, synced, updatedAt',
      syncQueue: '++id, type, entity, entityId, createdAt',
    });
  }
}

export const db = new AppDatabase();

// Hook pour documents offline
export function useOfflineDocuments(projectId: string) {
  return useLiveQuery(
    () => db.documents.where('projectId').equals(projectId).toArray(),
    [projectId]
  );
}

// Sauvegarder offline
export async function saveDocumentOffline(doc: OfflineDocument) {
  await db.documents.put({ ...doc, synced: false });
  await db.syncQueue.add({
    type: doc.id ? 'update' : 'create',
    entity: 'document',
    entityId: doc.id,
    data: doc,
    createdAt: new Date(),
  });
}

// Synchroniser quand online
export async function syncPendingChanges() {
  const pending = await db.syncQueue.toArray();

  for (const item of pending) {
    try {
      // Appel API pour sync
      await fetch(`/api/${item.entity}s`, {
        method: item.type === 'create' ? 'POST' : 'PATCH',
        body: JSON.stringify(item.data),
      });

      // Marquer comme synced
      await db.documents.update(item.entityId, { synced: true });
      await db.syncQueue.delete(item.id!);
    } catch (error) {
      console.error('Sync failed:', error);
      // Retry later
    }
  }
}

// Détecter connexion
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncPendingChanges);
}
```

### Usage avec hook
```tsx
import { useLiveQuery } from 'dexie-react-hooks';

// Usage
import { useLiveQuery } from 'dexie-react-hooks';
import { db, saveDocumentOffline } from '@/lib/db';

function DocumentList({ projectId }: { projectId: string }) {
  const documents = useLiveQuery(
    () => db.documents.where('projectId').equals(projectId).toArray(),
    [projectId]
  );

  const isOnline = useOnlineStatus();

  return (
    <div>
      {!isOnline && (
        <div className="bg-yellow-100 p-2 rounded mb-4">
          Mode hors-ligne - Les modifications seront synchronisées
        </div>
      )}
      {documents?.map((doc) => (
        <div key={doc.id} className="flex items-center gap-2">
          <span>{doc.title}</span>
          {!doc.synced && <span className="text-xs text-yellow-600">●</span>}
        </div>
      ))}
    </div>
  );
}
```

---

## POC 5 : Service Worker avec Workbox (Vite)

### Installation
```bash
pnpm add -D vite-plugin-pwa workbox-window
```

### Configuration Vite
```ts
// apps/web/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.png'],
      manifest: {
        name: 'ONG Platform',
        short_name: 'ONG',
        description: 'Plateforme de gestion pour ONG',
        theme_color: '#3b82f6',
        icons: [
          { src: 'logo-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
});
```

---

## POC 6 : Yjs Collaboration (Basique)

### Installation
```bash
pnpm add yjs y-websocket @tiptap/extension-collaboration @tiptap/extension-collaboration-cursor
```

### Code Serveur WebSocket
```ts
// apps/api/src/modules/collaboration/ws-server.ts
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';

export function startCollaborationServer(port: number = 1234) {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws, req) => {
    setupWSConnection(ws, req);
  });

  console.log(`Yjs WebSocket server running on port ${port}`);
  return wss;
}
```

### Code Client TipTap + Yjs
```tsx
// apps/web/src/components/editor/CollaborativeEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useEffect, useMemo } from 'react';

interface CollaborativeEditorProps {
  documentId: string;
  userName: string;
  userColor: string;
}

export function CollaborativeEditor({
  documentId,
  userName,
  userColor
}: CollaborativeEditorProps) {
  // Create Yjs document
  const ydoc = useMemo(() => new Y.Doc(), []);

  // Connect to WebSocket provider
  const provider = useMemo(
    () => new WebsocketProvider('ws://localhost:1234', documentId, ydoc),
    [documentId, ydoc]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }), // Disable default history
      Collaboration.configure({ document: ydoc }),
      CollaborationCursor.configure({
        provider,
        user: { name: userName, color: userColor },
      }),
    ],
  });

  useEffect(() => {
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [provider, ydoc]);

  // Connected users
  const users = provider.awareness.getStates();

  return (
    <div>
      {/* Connected users indicator */}
      <div className="flex gap-1 mb-2">
        {Array.from(users.values()).map((state: any, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
            style={{ backgroundColor: state.user?.color }}
            title={state.user?.name}
          >
            {state.user?.name?.[0]}
          </div>
        ))}
      </div>

      <EditorContent editor={editor} className="border rounded p-4" />
    </div>
  );
}
```

---

## Validation Checklist

- [ ] POC 1 : TipTap s'intègre bien avec React/Tailwind
- [ ] POC 2 : Export .docx fonctionne correctement
- [ ] POC 3 : Signature tactile smooth sur mobile
- [ ] POC 4 : IndexedDB persiste les données offline
- [ ] POC 5 : PWA installable et fonctionne offline
- [ ] POC 6 : Collaboration temps réel sans conflits

---

*POC créés par Winston (Architect) - 2025-01-27*
