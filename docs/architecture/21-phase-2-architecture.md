# 21. Architecture Phase 2 - Epics 5, 6, 7

## Vue d'Ensemble

La Phase 2 introduit trois domaines fonctionnels majeurs qui étendent significativement les capacités de la plateforme :

| Epic | Domaine | Nouveaux Patterns |
|------|---------|-------------------|
| **5** | Veille Appels d'Offres | Job Queues, Scraping, Notifications |
| **6** | Templates & Propositions | Content Composition, Export PDF/Word |
| **7** | Gestion Budgétaire | Financial Calculations, Versioning, Reports |

## Nouvelles Dépendances Techniques

```json
{
  "apps/api": {
    "bullmq": "^5.x",
    "ioredis": "^5.x",
    "rss-parser": "^3.x",
    "cheerio": "^1.x",
    "puppeteer": "^22.x",
    "pdfkit": "^0.15.x",
    "docx": "^8.x",
    "exceljs": "^4.x",
    "nodemailer": "^6.x",
    "decimal.js": "^10.x",
    "node-cron": "^3.x"
  }
}
```

---

# EPIC 5: Veille Appels d'Offres

## 5.1 Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        OPPORTUNITY MONITORING                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Sources    │    │    Redis     │    │  PostgreSQL  │          │
│  │  RSS/API/Web │    │   (Queue)    │    │   (Store)    │          │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘          │
│         │                   │                    │                  │
│         ▼                   ▼                    ▼                  │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │                    Collector Workers                      │      │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐         │      │
│  │  │  RSS   │  │  API   │  │ Scraper│  │ Parser │         │      │
│  │  └────────┘  └────────┘  └────────┘  └────────┘         │      │
│  └──────────────────────────────────────────────────────────┘      │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │                    Normalizer Service                     │      │
│  │  • Deduplication  • Tagging  • Geocoding  • Enrichment   │      │
│  └──────────────────────────────────────────────────────────┘      │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │                   Notification Engine                     │      │
│  │     ┌──────────┐    ┌──────────┐    ┌──────────┐         │      │
│  │     │  In-App  │    │  Email   │    │  Digest  │         │      │
│  │     └──────────┘    └──────────┘    └──────────┘         │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 5.2 Database Schema - Opportunities

```prisma
// ===== EPIC 5: OPPORTUNITY MONITORING =====

enum MonitoringSourceType {
  RSS
  API
  SCRAPER
}

enum MonitoringFrequency {
  HOURLY
  DAILY
  WEEKLY
}

enum OpportunityStatus {
  NEW
  VIEWED
  INTERESTED
  APPLIED
  ARCHIVED
  EXPIRED
}

// Source de veille configurée
model MonitoringSource {
  id          String              @id @default(uuid())
  name        String              // "ReliefWeb Jobs", "DevEx", "AFD Appels"
  type        MonitoringSourceType
  url         String              // URL RSS, API endpoint, ou page web
  frequency   MonitoringFrequency @default(DAILY)
  isActive    Boolean             @default(true)

  // Configuration spécifique par type
  config      Json?               // { apiKey, selector, headers, etc. }

  // Statistiques
  lastRunAt   DateTime?
  lastError   String?
  totalFetched Int               @default(0)

  createdById String
  createdBy   User                @relation(fields: [createdById], references: [id])
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  opportunities Opportunity[]
  runLogs     SourceRunLog[]

  @@index([isActive, frequency])
  @@map("monitoring_sources")
}

// Log d'exécution des collectes
model SourceRunLog {
  id          String           @id @default(uuid())
  sourceId    String
  source      MonitoringSource @relation(fields: [sourceId], references: [id], onDelete: Cascade)
  startedAt   DateTime         @default(now())
  completedAt DateTime?
  status      String           // SUCCESS, FAILED, PARTIAL
  itemsFound  Int              @default(0)
  itemsNew    Int              @default(0)
  error       String?

  @@index([sourceId, startedAt])
  @@map("source_run_logs")
}

// Appel d'offre / Opportunité
model Opportunity {
  id              String            @id @default(uuid())
  sourceId        String
  source          MonitoringSource  @relation(fields: [sourceId], references: [id])
  externalId      String?           // ID dans la source originale

  // Données normalisées
  title           String
  description     String            @db.Text
  organization    String?           // Bailleur / Organisation émettrice
  deadline        DateTime?
  publicationDate DateTime?

  // Montants
  amountMin       Decimal?          @db.Decimal(15, 2)
  amountMax       Decimal?          @db.Decimal(15, 2)
  currency        String?           @default("EUR")

  // Catégorisation
  sectors         String[]          // ["Health", "Education", "WASH"]
  countries       String[]          // ["TD", "CM", "NE"]
  regions         String[]          // ["Central Africa", "Sahel"]

  // URLs et documents
  originalUrl     String
  documentUrls    String[]

  // Métadonnées extraites
  keywords        String[]
  eligibility     String?           @db.Text

  // Statut interne
  status          OpportunityStatus @default(NEW)
  viewCount       Int               @default(0)

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  // Relations
  notes           OpportunityNote[]
  alerts          AlertMatch[]
  evaluations     OpportunityEvaluation[]

  @@unique([sourceId, externalId])
  @@index([status, deadline])
  @@index([deadline])
  @@index([sectors])
  @@index([countries])
  @@map("opportunities")
}

// Notes internes sur une opportunité
model OpportunityNote {
  id            String      @id @default(uuid())
  opportunityId String
  opportunity   Opportunity @relation(fields: [opportunityId], references: [id], onDelete: Cascade)
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  content       String      @db.Text
  createdAt     DateTime    @default(now())

  @@index([opportunityId])
  @@map("opportunity_notes")
}

// Évaluation Go/No-Go
model OpportunityEvaluation {
  id            String      @id @default(uuid())
  opportunityId String
  opportunity   Opportunity @relation(fields: [opportunityId], references: [id], onDelete: Cascade)
  userId        String
  user          User        @relation(fields: [userId], references: [id])
  decision      String      // GO, NO_GO, MAYBE
  rating        Int?        // 1-5
  reasons       String[]
  comment       String?
  createdAt     DateTime    @default(now())

  @@unique([opportunityId, userId])
  @@map("opportunity_evaluations")
}

// Configuration d'alertes utilisateur
model AlertConfig {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  isActive    Boolean  @default(true)

  // Critères
  sectors     String[]
  countries   String[]
  keywords    String[]
  minAmount   Decimal? @db.Decimal(15, 2)
  maxAmount   Decimal? @db.Decimal(15, 2)
  donors      String[] // Organisations spécifiques

  // Notification
  frequency   String   // REALTIME, DAILY_DIGEST, WEEKLY_DIGEST
  channels    String[] // ["in_app", "email"]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  matches     AlertMatch[]

  @@index([userId, isActive])
  @@map("alert_configs")
}

// Matchs d'alertes
model AlertMatch {
  id            String      @id @default(uuid())
  alertId       String
  alert         AlertConfig @relation(fields: [alertId], references: [id], onDelete: Cascade)
  opportunityId String
  opportunity   Opportunity @relation(fields: [opportunityId], references: [id], onDelete: Cascade)
  notifiedAt    DateTime?
  viewedAt      DateTime?
  createdAt     DateTime    @default(now())

  @@unique([alertId, opportunityId])
  @@index([alertId, notifiedAt])
  @@map("alert_matches")
}
```

## 5.3 Backend Module Structure

```text
apps/api/src/modules/opportunities/
├── index.ts
├── opportunities.routes.ts
├── opportunities.controller.ts
├── opportunities.service.ts
├── opportunities.validators.ts
│
├── sources/
│   ├── sources.controller.ts
│   ├── sources.service.ts
│   └── sources.validators.ts
│
├── collectors/
│   ├── collector.interface.ts
│   ├── rss.collector.ts
│   ├── api.collector.ts
│   ├── scraper.collector.ts
│   └── collector.factory.ts
│
├── workers/
│   ├── collection.worker.ts      # BullMQ worker
│   ├── notification.worker.ts
│   └── digest.worker.ts
│
├── normalizer/
│   ├── normalizer.service.ts
│   ├── deduplicator.service.ts
│   └── enricher.service.ts
│
├── alerts/
│   ├── alerts.controller.ts
│   ├── alerts.service.ts
│   ├── matcher.service.ts
│   └── alerts.validators.ts
│
└── notifications/
    ├── notification.service.ts
    └── email.templates.ts
```

## 5.4 Queue Architecture (BullMQ)

```typescript
// apps/api/src/config/queues.ts
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

export const redis = new IORedis(process.env.REDIS_URL);

// Queues
export const collectionQueue = new Queue('opportunity-collection', { connection: redis });
export const notificationQueue = new Queue('opportunity-notifications', { connection: redis });
export const digestQueue = new Queue('opportunity-digests', { connection: redis });

// Job Types
export interface CollectionJob {
  sourceId: string;
  triggeredBy?: 'schedule' | 'manual';
}

export interface NotificationJob {
  type: 'realtime' | 'digest';
  userId?: string;
  alertId?: string;
  opportunityIds: string[];
}

// Scheduler pour jobs récurrents
export function setupScheduler() {
  // Collecte horaire
  collectionQueue.add('hourly-collection', {}, {
    repeat: { pattern: '0 * * * *' }, // Toutes les heures
    jobId: 'hourly-collection',
  });

  // Collecte quotidienne
  collectionQueue.add('daily-collection', {}, {
    repeat: { pattern: '0 6 * * *' }, // 6h du matin
    jobId: 'daily-collection',
  });

  // Digest quotidien
  digestQueue.add('daily-digest', {}, {
    repeat: { pattern: '0 8 * * *' }, // 8h du matin
    jobId: 'daily-digest',
  });

  // Digest hebdomadaire
  digestQueue.add('weekly-digest', {}, {
    repeat: { pattern: '0 8 * * 1' }, // Lundi 8h
    jobId: 'weekly-digest',
  });
}
```

## 5.5 Collector Implementations

```typescript
// collectors/collector.interface.ts
export interface CollectorResult {
  items: RawOpportunity[];
  errors: string[];
  metadata: {
    source: string;
    fetchedAt: Date;
    duration: number;
  };
}

export interface ICollector {
  collect(config: SourceConfig): Promise<CollectorResult>;
  validate(config: SourceConfig): Promise<boolean>;
}

// collectors/rss.collector.ts
import Parser from 'rss-parser';

export class RSSCollector implements ICollector {
  private parser = new Parser({
    customFields: {
      item: ['deadline', 'amount', 'country', 'sector'],
    },
  });

  async collect(config: SourceConfig): Promise<CollectorResult> {
    const startTime = Date.now();
    const items: RawOpportunity[] = [];
    const errors: string[] = [];

    try {
      const feed = await this.parser.parseURL(config.url);

      for (const item of feed.items) {
        items.push({
          externalId: item.guid || item.link,
          title: item.title,
          description: item.contentSnippet || item.content,
          originalUrl: item.link,
          publicationDate: item.pubDate ? new Date(item.pubDate) : undefined,
          // Map custom fields si disponibles
          deadline: item.deadline ? new Date(item.deadline) : undefined,
        });
      }
    } catch (error) {
      errors.push(error.message);
    }

    return {
      items,
      errors,
      metadata: {
        source: config.url,
        fetchedAt: new Date(),
        duration: Date.now() - startTime,
      },
    };
  }
}

// collectors/scraper.collector.ts
import * as cheerio from 'cheerio';

export class ScraperCollector implements ICollector {
  async collect(config: SourceConfig): Promise<CollectorResult> {
    const { url, config: scraperConfig } = config;
    const { selectors } = scraperConfig;

    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const items: RawOpportunity[] = [];

    $(selectors.itemContainer).each((_, element) => {
      items.push({
        title: $(element).find(selectors.title).text().trim(),
        description: $(element).find(selectors.description).text().trim(),
        originalUrl: $(element).find(selectors.link).attr('href'),
        deadline: this.parseDate($(element).find(selectors.deadline).text()),
      });
    });

    return { items, errors: [], metadata: { ... } };
  }
}
```

## 5.6 API Endpoints

```typescript
// Opportunities
GET    /api/opportunities                 // Liste avec filtres, pagination
GET    /api/opportunities/:id             // Détail
POST   /api/opportunities/:id/view        // Marquer comme vu
POST   /api/opportunities/:id/archive     // Archiver
POST   /api/opportunities/:id/notes       // Ajouter note
POST   /api/opportunities/:id/evaluate    // Go/No-Go
GET    /api/opportunities/export          // Export CSV/Excel

// Sources
GET    /api/opportunities/sources         // Liste sources
POST   /api/opportunities/sources         // Créer source
PATCH  /api/opportunities/sources/:id     // Modifier
DELETE /api/opportunities/sources/:id     // Supprimer
POST   /api/opportunities/sources/:id/test // Test connexion
POST   /api/opportunities/sources/:id/run // Lancer collecte manuelle
GET    /api/opportunities/sources/:id/logs // Logs d'exécution

// Alerts
GET    /api/opportunities/alerts          // Mes alertes
POST   /api/opportunities/alerts          // Créer alerte
PATCH  /api/opportunities/alerts/:id      // Modifier
DELETE /api/opportunities/alerts/:id      // Supprimer
GET    /api/opportunities/alerts/:id/preview // Préview matchs
```

## 5.7 Frontend Components

```text
apps/web/src/
├── pages/
│   └── opportunities/
│       ├── OpportunitiesPage.tsx       // Liste principale
│       ├── OpportunityDetailPage.tsx   // Détail + actions
│       ├── SourcesConfigPage.tsx       // Config sources
│       └── AlertsConfigPage.tsx        // Config alertes
│
├── components/
│   └── opportunities/
│       ├── OpportunityList.tsx
│       ├── OpportunityCard.tsx
│       ├── OpportunityFilters.tsx
│       ├── OpportunityDetail.tsx
│       ├── OpportunityNotes.tsx
│       ├── OpportunityEvaluation.tsx
│       ├── SourceForm.tsx
│       ├── SourceTestButton.tsx
│       ├── AlertForm.tsx
│       └── AlertPreview.tsx
│
├── hooks/
│   ├── useOpportunities.ts
│   ├── useSources.ts
│   └── useAlerts.ts
│
└── services/
    └── opportunities.service.ts
```

---

# EPIC 6: Templates & Propositions

## 6.1 Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                     PROPOSAL COMPOSITION SYSTEM                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Template   │    │   Content    │    │   Proposal   │          │
│  │   Library    │    │   Library    │    │   Editor     │          │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘          │
│         │                   │                    │                  │
│         └───────────────────┼────────────────────┘                  │
│                             ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │                    Composition Engine                     │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │      │
│  │  │ Variable │  │ Section  │  │Validation│               │      │
│  │  │ Resolver │  │ Manager  │  │  Engine  │               │      │
│  │  └──────────┘  └──────────┘  └──────────┘               │      │
│  └──────────────────────────────────────────────────────────┘      │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │                     Export Engine                         │      │
│  │     ┌──────────┐    ┌──────────┐    ┌──────────┐         │      │
│  │     │   PDF    │    │   Word   │    │  Custom  │         │      │
│  │     │ (PDFKit) │    │  (docx)  │    │ Template │         │      │
│  │     └──────────┘    └──────────┘    └──────────┘         │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 6.2 Database Schema - Proposals

```prisma
// ===== EPIC 6: TEMPLATES & PROPOSALS =====

enum ProposalTemplateStatus {
  DRAFT
  REVIEW
  APPROVED
  ARCHIVED
}

enum ProposalStatus {
  DRAFT
  IN_PROGRESS
  REVIEW
  FINALIZED
  SUBMITTED
  ACCEPTED
  REJECTED
}

// Template de proposition
model ProposalTemplate {
  id          String                 @id @default(uuid())
  name        String
  description String?
  status      ProposalTemplateStatus @default(DRAFT)
  version     Int                    @default(1)

  // Catégorisation
  donorId     String?
  donor       Donor?                 @relation(fields: [donorId], references: [id])
  category    String?                // "Note conceptuelle", "Proposition complète"

  // Structure du template
  sections    ProposalTemplateSection[]

  // Métadonnées
  usageCount  Int                    @default(0)

  createdById String
  createdBy   User                   @relation(fields: [createdById], references: [id])
  approvedById String?
  approvedBy  User?                  @relation("TemplateApprover", fields: [approvedById], references: [id])
  approvedAt  DateTime?

  createdAt   DateTime               @default(now())
  updatedAt   DateTime               @updatedAt

  proposals   Proposal[]

  @@index([status, donorId])
  @@map("proposal_templates")
}

// Section d'un template
model ProposalTemplateSection {
  id          String           @id @default(uuid())
  templateId  String
  template    ProposalTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)

  title       String
  order       Int
  isRequired  Boolean          @default(true)

  // Contraintes
  minWords    Int?
  maxWords    Int?
  guidelines  String?          @db.Text // Instructions pour rédacteur

  // Variables disponibles
  variables   String[]         // ["{{project.name}}", "{{donor.name}}"]

  @@index([templateId, order])
  @@map("proposal_template_sections")
}

// Bailleur / Donor
model Donor {
  id            String             @id @default(uuid())
  name          String             @unique
  shortName     String?            // "UE", "AFD", "USAID"
  logoUrl       String?
  website       String?
  description   String?

  // Configurations spécifiques
  formatRequirements Json?         // Exigences format

  templates     ProposalTemplate[]
  budgetTemplates BudgetTemplate[]

  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  @@map("donors")
}

// Proposition en cours
model Proposal {
  id            String         @id @default(uuid())
  title         String
  status        ProposalStatus @default(DRAFT)

  // Relations
  templateId    String?
  template      ProposalTemplate? @relation(fields: [templateId], references: [id])
  opportunityId String?
  opportunity   Opportunity?   @relation(fields: [opportunityId], references: [id])
  projectId     String?        // Projet résultant si accepté

  // Deadline
  deadline      DateTime?
  submittedAt   DateTime?

  // Contenu
  sections      ProposalSection[]

  // Collaboration
  createdById   String
  createdBy     User           @relation(fields: [createdById], references: [id])
  collaborators ProposalCollaborator[]
  comments      ProposalComment[]

  // Versions exportées
  exports       ProposalExport[]

  // Suivi post-soumission
  tracking      ProposalTracking?

  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([status, deadline])
  @@map("proposals")
}

// Section d'une proposition
model ProposalSection {
  id          String    @id @default(uuid())
  proposalId  String
  proposal    Proposal  @relation(fields: [proposalId], references: [id], onDelete: Cascade)

  title       String
  order       Int
  content     String    @db.Text
  wordCount   Int       @default(0)
  isComplete  Boolean   @default(false)

  // Référence template section si applicable
  templateSectionId String?

  updatedAt   DateTime  @updatedAt

  @@index([proposalId, order])
  @@map("proposal_sections")
}

// Collaborateur sur une proposition
model ProposalCollaborator {
  id          String   @id @default(uuid())
  proposalId  String
  proposal    Proposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  role        String   // EDITOR, REVIEWER, VIEWER
  addedAt     DateTime @default(now())

  @@unique([proposalId, userId])
  @@map("proposal_collaborators")
}

// Commentaires sur proposition
model ProposalComment {
  id          String   @id @default(uuid())
  proposalId  String
  proposal    Proposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)
  sectionId   String?  // null = commentaire général
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  content     String   @db.Text
  resolvedAt  DateTime?
  createdAt   DateTime @default(now())

  @@index([proposalId, sectionId])
  @@map("proposal_comments")
}

// Export de proposition
model ProposalExport {
  id          String   @id @default(uuid())
  proposalId  String
  proposal    Proposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)
  format      String   // PDF, DOCX
  version     Int
  fileUrl     String
  exportedById String
  exportedBy  User     @relation(fields: [exportedById], references: [id])
  createdAt   DateTime @default(now())

  @@index([proposalId])
  @@map("proposal_exports")
}

// Suivi post-soumission
model ProposalTracking {
  id          String   @id @default(uuid())
  proposalId  String   @unique
  proposal    Proposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)

  currentStage String  // SUBMITTED, UNDER_REVIEW, SHORTLISTED, ACCEPTED, REJECTED

  // Timeline
  submittedAt DateTime?
  responseExpectedAt DateTime?
  responseReceivedAt DateTime?

  // Résultat
  result      String?  // ACCEPTED, REJECTED
  feedbackNotes String? @db.Text

  // Montant
  requestedAmount Decimal? @db.Decimal(15, 2)
  awardedAmount   Decimal? @db.Decimal(15, 2)

  updatedAt   DateTime @updatedAt

  @@map("proposal_tracking")
}

// Bibliothèque de contenus réutilisables
model ContentBlock {
  id          String   @id @default(uuid())
  title       String
  category    String   // "org_presentation", "methodology", "cv", "references"
  content     String   @db.Text
  tags        String[]

  usageCount  Int      @default(0)

  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
  @@index([tags])
  @@map("content_blocks")
}
```

## 6.3 Backend Module Structure

```text
apps/api/src/modules/proposals/
├── index.ts
├── proposals.routes.ts
├── proposals.controller.ts
├── proposals.service.ts
├── proposals.validators.ts
│
├── templates/
│   ├── templates.controller.ts
│   ├── templates.service.ts
│   └── templates.validators.ts
│
├── content/
│   ├── content.controller.ts
│   ├── content.service.ts
│   └── content.validators.ts
│
├── composition/
│   ├── composition.service.ts
│   ├── variable-resolver.service.ts
│   └── validation.service.ts
│
├── export/
│   ├── export.controller.ts
│   ├── export.service.ts
│   ├── pdf-generator.service.ts
│   └── docx-generator.service.ts
│
├── collaboration/
│   ├── collaboration.service.ts
│   └── comments.service.ts
│
└── tracking/
    ├── tracking.controller.ts
    └── tracking.service.ts
```

## 6.4 Export Services

```typescript
// export/pdf-generator.service.ts
import PDFDocument from 'pdfkit';
import { Proposal } from '@prisma/client';

export class PDFGeneratorService {
  async generate(proposal: ProposalWithSections): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 72, bottom: 72, left: 72, right: 72 },
        info: {
          Title: proposal.title,
          Author: 'ONG Chadia Platform',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header
      doc.fontSize(24).text(proposal.title, { align: 'center' });
      doc.moveDown();

      // Table of contents
      this.addTableOfContents(doc, proposal.sections);
      doc.addPage();

      // Sections
      for (const section of proposal.sections) {
        doc.fontSize(16).text(section.title, { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(section.content);
        doc.moveDown(2);
      }

      doc.end();
    });
  }
}

// export/docx-generator.service.ts
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export class DocxGeneratorService {
  async generate(proposal: ProposalWithSections): Promise<Buffer> {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: proposal.title,
            heading: HeadingLevel.TITLE,
          }),
          ...proposal.sections.flatMap(section => [
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [new TextRun(section.content)],
            }),
          ]),
        ],
      }],
    });

    return Packer.toBuffer(doc);
  }
}
```

## 6.5 Variable Resolution

```typescript
// composition/variable-resolver.service.ts
export class VariableResolverService {
  private resolvers: Map<string, (context: ResolverContext) => string>;

  constructor() {
    this.resolvers = new Map([
      ['project.name', (ctx) => ctx.project?.name || ''],
      ['project.description', (ctx) => ctx.project?.description || ''],
      ['donor.name', (ctx) => ctx.donor?.name || ''],
      ['organization.name', () => 'ONG Chadia'],
      ['date.today', () => new Date().toLocaleDateString('fr-FR')],
      ['date.year', () => new Date().getFullYear().toString()],
    ]);
  }

  resolve(content: string, context: ResolverContext): string {
    return content.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const resolver = this.resolvers.get(variable.trim());
      return resolver ? resolver(context) : match;
    });
  }
}
```

## 6.6 API Endpoints

```typescript
// Templates
GET    /api/proposals/templates              // Liste templates
POST   /api/proposals/templates              // Créer template
GET    /api/proposals/templates/:id          // Détail
PATCH  /api/proposals/templates/:id          // Modifier
POST   /api/proposals/templates/:id/approve  // Approuver
POST   /api/proposals/templates/:id/duplicate // Dupliquer

// Proposals
GET    /api/proposals                        // Liste propositions
POST   /api/proposals                        // Créer (from template or blank)
GET    /api/proposals/:id                    // Détail
PATCH  /api/proposals/:id                    // Modifier métadonnées
DELETE /api/proposals/:id                    // Supprimer

// Sections
GET    /api/proposals/:id/sections           // Sections
PATCH  /api/proposals/:id/sections/:sectionId // Modifier section

// Collaboration
POST   /api/proposals/:id/collaborators      // Ajouter collaborateur
DELETE /api/proposals/:id/collaborators/:userId // Retirer
POST   /api/proposals/:id/comments           // Ajouter commentaire
PATCH  /api/proposals/:id/comments/:commentId // Résoudre

// Export
POST   /api/proposals/:id/export             // Exporter (PDF/DOCX)
GET    /api/proposals/:id/exports            // Historique exports
GET    /api/proposals/:id/preview            // Preview HTML

// Content Library
GET    /api/proposals/content                // Liste blocs
POST   /api/proposals/content                // Créer bloc
GET    /api/proposals/content/search         // Recherche full-text
POST   /api/proposals/content/:id/use        // Marquer utilisation

// Tracking
GET    /api/proposals/pipeline               // Vue pipeline Kanban
PATCH  /api/proposals/:id/tracking           // Mettre à jour suivi
GET    /api/proposals/stats                  // Statistiques
```

## 6.7 Frontend Components

```text
apps/web/src/
├── pages/
│   └── proposals/
│       ├── ProposalsListPage.tsx
│       ├── ProposalEditorPage.tsx
│       ├── TemplatesLibraryPage.tsx
│       ├── TemplateEditorPage.tsx
│       ├── ContentLibraryPage.tsx
│       └── ProposalPipelinePage.tsx
│
├── components/
│   └── proposals/
│       ├── ProposalList.tsx
│       ├── ProposalCard.tsx
│       ├── ProposalEditor.tsx
│       ├── SectionEditor.tsx
│       ├── TemplateList.tsx
│       ├── TemplateForm.tsx
│       ├── SectionForm.tsx
│       ├── ContentBlockList.tsx
│       ├── ContentBlockPicker.tsx
│       ├── CollaboratorList.tsx
│       ├── CommentThread.tsx
│       ├── ExportDialog.tsx
│       ├── ProposalPreview.tsx
│       ├── PipelineBoard.tsx
│       ├── PipelineCard.tsx
│       └── ProposalStats.tsx
│
├── hooks/
│   ├── useProposals.ts
│   ├── useTemplates.ts
│   ├── useContentBlocks.ts
│   └── useProposalTracking.ts
│
└── services/
    ├── proposals.service.ts
    ├── templates.service.ts
    └── content.service.ts
```

---

# EPIC 7: Gestion Budgétaire

## 7.1 Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                      BUDGET MANAGEMENT SYSTEM                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Template   │    │    Budget    │    │   Expense    │          │
│  │   Library    │    │   Builder    │    │   Tracker    │          │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘          │
│         │                   │                    │                  │
│         └───────────────────┼────────────────────┘                  │
│                             ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │                   Calculation Engine                      │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │      │
│  │  │ Formula  │  │ Currency │  │Allocation│               │      │
│  │  │  Parser  │  │Converter │  │  Engine  │               │      │
│  │  └──────────┘  └──────────┘  └──────────┘               │      │
│  └──────────────────────────────────────────────────────────┘      │
│                              │                                      │
│         ┌────────────────────┼────────────────────┐                │
│         ▼                    ▼                    ▼                 │
│  ┌────────────┐       ┌────────────┐       ┌────────────┐          │
│  │  Version   │       │  Tracking  │       │  Reporting │          │
│  │  Control   │       │  & Alerts  │       │   Engine   │          │
│  └────────────┘       └────────────┘       └────────────┘          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 7.2 Database Schema - Budgets

```prisma
// ===== EPIC 7: BUDGET MANAGEMENT =====

enum BudgetStatus {
  DRAFT
  ACTIVE
  CLOSED
  ARCHIVED
}

enum BudgetVersionStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  REJECTED
  SUPERSEDED
}

// Budget principal
model Budget {
  id              String       @id @default(uuid())
  name            String
  description     String?

  // Liaison projet
  projectId       String?

  // Période
  startDate       DateTime
  endDate         DateTime

  // Devise principale
  currency        String       @default("EUR")

  // Statut
  status          BudgetStatus @default(DRAFT)
  currentVersionId String?     @unique

  // Totaux (calculés)
  totalPlanned    Decimal?     @db.Decimal(15, 2)
  totalCommitted  Decimal?     @db.Decimal(15, 2)
  totalSpent      Decimal?     @db.Decimal(15, 2)

  createdById     String
  createdBy       User         @relation(fields: [createdById], references: [id])
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  // Relations
  categories      BudgetCategory[]
  versions        BudgetVersion[]
  fundingSources  FundingSource[]
  snapshots       BudgetSnapshot[]
  alerts          BudgetAlert[]
  reports         FinancialReport[]

  @@index([projectId, status])
  @@map("budgets")
}

// Catégorie budgétaire
model BudgetCategory {
  id          String       @id @default(uuid())
  budgetId    String
  budget      Budget       @relation(fields: [budgetId], references: [id], onDelete: Cascade)

  code        String       // "A", "B", "C"
  name        String       // "Personnel", "Équipement"
  order       Int

  // Totaux catégorie (calculés)
  totalPlanned Decimal?    @db.Decimal(15, 2)

  lines       BudgetLine[]

  @@unique([budgetId, code])
  @@index([budgetId, order])
  @@map("budget_categories")
}

// Ligne budgétaire
model BudgetLine {
  id          String         @id @default(uuid())
  categoryId  String
  category    BudgetCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  code        String         // "A.1", "A.2"
  description String
  order       Int

  // Calcul
  unitType    String?        // "month", "unit", "lump_sum"
  unitCost    Decimal        @db.Decimal(15, 2)
  quantity    Decimal        @db.Decimal(10, 2)

  // Total (peut être formule)
  total       Decimal        @db.Decimal(15, 2)
  formula     String?        // "=unitCost*quantity" ou formule custom

  // Ventilation temporelle
  periods     Json?          // { "2025-Q1": 5000, "2025-Q2": 5000 }

  // Justification
  justification String?      @db.Text

  // Tracking
  consumed    Decimal        @default(0) @db.Decimal(15, 2)
  committed   Decimal        @default(0) @db.Decimal(15, 2)

  // Relations
  activityAllocations BudgetActivityAllocation[]
  sourceAllocations   BudgetSourceAllocation[]
  expenses            Expense[]

  @@unique([categoryId, code])
  @@index([categoryId, order])
  @@map("budget_lines")
}

// Source de financement
model FundingSource {
  id          String   @id @default(uuid())
  budgetId    String
  budget      Budget   @relation(fields: [budgetId], references: [id], onDelete: Cascade)

  name        String   // "AFD Grant", "EU Co-funding", "Own contribution"
  type        String   // MAIN, CO_FUNDING, CONTRIBUTION
  amount      Decimal  @db.Decimal(15, 2)
  percentage  Decimal? @db.Decimal(5, 2)
  currency    String?

  allocations BudgetSourceAllocation[]
  disbursements Disbursement[]

  @@index([budgetId])
  @@map("funding_sources")
}

// Allocation ligne -> source
model BudgetSourceAllocation {
  id           String        @id @default(uuid())
  budgetLineId String
  budgetLine   BudgetLine    @relation(fields: [budgetLineId], references: [id], onDelete: Cascade)
  sourceId     String
  source       FundingSource @relation(fields: [sourceId], references: [id], onDelete: Cascade)
  percentage   Decimal       @db.Decimal(5, 2)
  amount       Decimal?      @db.Decimal(15, 2)

  @@unique([budgetLineId, sourceId])
  @@map("budget_source_allocations")
}

// Allocation ligne -> activité
model BudgetActivityAllocation {
  id           String     @id @default(uuid())
  budgetLineId String
  budgetLine   BudgetLine @relation(fields: [budgetLineId], references: [id], onDelete: Cascade)
  activityId   String     // ID activité projet
  activityName String     // Denormalized pour affichage
  percentage   Decimal    @db.Decimal(5, 2)
  amount       Decimal?   @db.Decimal(15, 2)

  @@unique([budgetLineId, activityId])
  @@map("budget_activity_allocations")
}

// Versioning budget
model BudgetVersion {
  id          String              @id @default(uuid())
  budgetId    String
  budget      Budget              @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  version     Int
  status      BudgetVersionStatus @default(DRAFT)

  // Snapshot des données
  data        Json                // Copie complète structure
  changelog   String?             @db.Text

  // Workflow
  submittedAt    DateTime?
  submittedById  String?
  approvedAt     DateTime?
  approvedById   String?
  approvalComment String?

  createdById String
  createdBy   User             @relation(fields: [createdById], references: [id])
  createdAt   DateTime         @default(now())

  auditLogs   BudgetAuditLog[]

  @@unique([budgetId, version])
  @@index([budgetId, status])
  @@map("budget_versions")
}

// Dépense liée au budget
model Expense {
  id           String     @id @default(uuid())
  budgetLineId String
  budgetLine   BudgetLine @relation(fields: [budgetLineId], references: [id])

  date         DateTime
  description  String
  amount       Decimal    @db.Decimal(15, 2)
  currency     String     @default("EUR")

  // Pièce justificative
  documentId   String?    // Lien vers Document GED
  reference    String?    // Numéro facture, etc.

  // Validation
  isValidated  Boolean    @default(false)
  validatedById String?
  validatedAt  DateTime?

  createdById  String
  createdBy    User       @relation(fields: [createdById], references: [id])
  createdAt    DateTime   @default(now())

  @@index([budgetLineId, date])
  @@map("expenses")
}

// Décaissements (versements reçus)
model Disbursement {
  id          String        @id @default(uuid())
  sourceId    String
  source      FundingSource @relation(fields: [sourceId], references: [id], onDelete: Cascade)

  amount      Decimal       @db.Decimal(15, 2)
  date        DateTime
  reference   String?       // Numéro virement
  description String?

  createdAt   DateTime      @default(now())

  @@index([sourceId, date])
  @@map("disbursements")
}

// Alertes budget
model BudgetAlert {
  id          String   @id @default(uuid())
  budgetId    String
  budget      Budget   @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  lineId      String?  // null = alerte globale

  type        String   // THRESHOLD_80, THRESHOLD_90, THRESHOLD_100, OVERSPENT
  threshold   Int?     // Pourcentage custom
  isActive    Boolean  @default(true)
  isTriggered Boolean  @default(false)
  triggeredAt DateTime?
  notifiedAt  DateTime?

  @@index([budgetId, isActive])
  @@map("budget_alerts")
}

// Snapshot quotidien pour historique
model BudgetSnapshot {
  id        String   @id @default(uuid())
  budgetId  String
  budget    Budget   @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  date      DateTime @default(now())
  data      Json     // { totalPlanned, totalSpent, byCategory: [...] }

  @@index([budgetId, date])
  @@map("budget_snapshots")
}

// Audit trail
model BudgetAuditLog {
  id        String         @id @default(uuid())
  budgetId  String
  versionId String?
  version   BudgetVersion? @relation(fields: [versionId], references: [id])

  action    String         // CREATE, UPDATE_LINE, SUBMIT, APPROVE, REJECT
  userId    String
  user      User           @relation(fields: [userId], references: [id])
  details   Json?          // { field, oldValue, newValue, lineId }
  createdAt DateTime       @default(now())

  @@index([budgetId, createdAt])
  @@map("budget_audit_logs")
}

// Template budgétaire par bailleur
model BudgetTemplate {
  id          String   @id @default(uuid())
  name        String
  description String?

  donorId     String?
  donor       Donor?   @relation(fields: [donorId], references: [id])

  // Structure pré-définie
  structure   Json     // { categories: [...], rules: [...] }

  // Règles spécifiques
  indirectCostRate Decimal? @db.Decimal(5, 2) // % frais indirects
  maxCategoryRates Json?    // { "Personnel": 50, "Admin": 7 }

  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([donorId, isActive])
  @@map("budget_templates")
}

// Rapport financier généré
enum FinancialReportType {
  EXECUTION
  CASHFLOW
  EXPENSE_DETAIL
  DISBURSEMENT
}

model FinancialReport {
  id          String              @id @default(uuid())
  budgetId    String
  budget      Budget              @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  type        FinancialReportType

  periodStart DateTime
  periodEnd   DateTime
  data        Json                // Données du rapport

  pdfUrl      String?
  excelUrl    String?

  signedAt    DateTime?
  signedById  String?
  signatureData String?           @db.Text

  generatedById String
  generatedBy User                @relation(fields: [generatedById], references: [id])
  generatedAt DateTime            @default(now())

  @@index([budgetId, type])
  @@map("financial_reports")
}

// Planification rapports auto
model ReportSchedule {
  id          String              @id @default(uuid())
  budgetId    String
  type        FinancialReportType
  frequency   String              // MONTHLY, QUARTERLY
  dayOfPeriod Int?
  recipients  String[]
  isActive    Boolean             @default(true)
  lastRunAt   DateTime?
  nextRunAt   DateTime?

  createdAt   DateTime            @default(now())

  @@index([isActive, nextRunAt])
  @@map("report_schedules")
}
```

## 7.3 Backend Module Structure

```text
apps/api/src/modules/budgets/
├── index.ts
├── budgets.routes.ts
├── budgets.controller.ts
├── budgets.service.ts
├── budgets.validators.ts
│
├── categories/
│   ├── categories.service.ts
│   └── lines.service.ts
│
├── calculations/
│   ├── calculation.service.ts
│   ├── formula-parser.service.ts
│   └── currency.service.ts
│
├── breakdown/
│   ├── breakdown.controller.ts
│   ├── breakdown.service.ts
│   ├── periods.service.ts
│   ├── activities.service.ts
│   └── sources.service.ts
│
├── tracking/
│   ├── tracking.controller.ts
│   ├── tracking.service.ts
│   ├── alerts.service.ts
│   ├── projections.service.ts
│   └── snapshots.service.ts
│
├── revisions/
│   ├── revisions.controller.ts
│   ├── revisions.service.ts
│   ├── compare.service.ts
│   ├── workflow.service.ts
│   └── audit.service.ts
│
├── reports/
│   ├── reports.controller.ts
│   ├── reports.service.ts
│   ├── generators/
│   │   ├── execution-report.ts
│   │   ├── cashflow-report.ts
│   │   ├── expense-report.ts
│   │   └── disbursement-report.ts
│   ├── formatters/
│   │   ├── pdf-formatter.ts
│   │   └── excel-formatter.ts
│   └── scheduler.service.ts
│
├── templates/
│   ├── templates.controller.ts
│   └── templates.service.ts
│
├── expenses/
│   ├── expenses.controller.ts
│   ├── expenses.service.ts
│   └── expenses.validators.ts
│
└── workers/
    ├── snapshot.worker.ts
    └── report.worker.ts
```

## 7.4 Calculation Engine

```typescript
// calculations/formula-parser.service.ts
import Decimal from 'decimal.js';

export class FormulaParserService {
  private context: Map<string, Decimal>;

  evaluate(formula: string, context: FormulaContext): Decimal {
    this.context = new Map(
      Object.entries(context).map(([k, v]) => [k, new Decimal(v)])
    );

    // Simple formulas: =unitCost*quantity
    if (formula.startsWith('=')) {
      return this.parseExpression(formula.slice(1));
    }

    // Direct value
    return new Decimal(formula);
  }

  private parseExpression(expr: string): Decimal {
    // Handle multiplication
    if (expr.includes('*')) {
      const parts = expr.split('*');
      return parts.reduce(
        (acc, part) => acc.mul(this.getValue(part.trim())),
        new Decimal(1)
      );
    }

    // Handle addition
    if (expr.includes('+')) {
      const parts = expr.split('+');
      return parts.reduce(
        (acc, part) => acc.add(this.getValue(part.trim())),
        new Decimal(0)
      );
    }

    return this.getValue(expr);
  }

  private getValue(ref: string): Decimal {
    // Variable reference
    if (this.context.has(ref)) {
      return this.context.get(ref)!;
    }

    // Cell reference like A.1, B.2
    if (/^[A-Z]\.\d+$/.test(ref)) {
      return this.context.get(`line.${ref}`) || new Decimal(0);
    }

    // Direct number
    return new Decimal(ref);
  }
}

// calculations/currency.service.ts
export class CurrencyService {
  private rates: Map<string, number> = new Map();

  async convert(amount: Decimal, from: string, to: string): Promise<Decimal> {
    if (from === to) return amount;

    const rate = await this.getRate(from, to);
    return amount.mul(rate);
  }

  private async getRate(from: string, to: string): Promise<number> {
    const key = `${from}_${to}`;
    if (!this.rates.has(key)) {
      // Fetch from API or database
      const rate = await this.fetchRate(from, to);
      this.rates.set(key, rate);
    }
    return this.rates.get(key)!;
  }
}
```

## 7.5 Tracking Service

```typescript
// tracking/tracking.service.ts
import Decimal from 'decimal.js';

export interface BudgetTrackingData {
  planned: Decimal;
  consumed: Decimal;
  committed: Decimal;
  available: Decimal;
  varianceAmount: Decimal;
  variancePercent: Decimal;
  burnRate: {
    actual: Decimal;
    planned: Decimal;
    ratio: Decimal;
  };
  projection: {
    estimatedAtCompletion: Decimal;
    varianceAtCompletion: Decimal;
    status: 'on_track' | 'at_risk' | 'over_budget';
  };
}

export class TrackingService {
  async calculateTracking(budgetId: string): Promise<BudgetTrackingData> {
    const budget = await this.getBudgetWithExpenses(budgetId);

    const consumed = this.sumExpenses(budget.expenses);
    const committed = this.sumCommitments(budget);
    const planned = new Decimal(budget.totalPlanned);

    const elapsedMonths = this.monthsBetween(budget.startDate, new Date());
    const totalMonths = this.monthsBetween(budget.startDate, budget.endDate);

    const burnRate = consumed.div(elapsedMonths || 1);
    const plannedBurnRate = planned.div(totalMonths);

    const estimatedAtCompletion = burnRate.mul(totalMonths);

    return {
      planned,
      consumed,
      committed,
      available: planned.sub(consumed).sub(committed),
      varianceAmount: planned.sub(consumed),
      variancePercent: planned.gt(0)
        ? planned.sub(consumed).div(planned).mul(100)
        : new Decimal(0),
      burnRate: {
        actual: burnRate,
        planned: plannedBurnRate,
        ratio: plannedBurnRate.gt(0)
          ? burnRate.div(plannedBurnRate)
          : new Decimal(1),
      },
      projection: {
        estimatedAtCompletion,
        varianceAtCompletion: planned.sub(estimatedAtCompletion),
        status: this.getProjectionStatus(estimatedAtCompletion, planned),
      },
    };
  }

  private getProjectionStatus(eac: Decimal, planned: Decimal): string {
    const ratio = eac.div(planned);
    if (ratio.lte(1.05)) return 'on_track';
    if (ratio.lte(1.15)) return 'at_risk';
    return 'over_budget';
  }
}
```

## 7.6 Report Generation

```typescript
// reports/generators/execution-report.ts
import ExcelJS from 'exceljs';

export class ExecutionReportGenerator {
  async generate(budget: BudgetWithTracking): Promise<ExecutionReportData> {
    const categories = await Promise.all(
      budget.categories.map(async (cat) => ({
        code: cat.code,
        name: cat.name,
        lines: cat.lines.map(line => ({
          code: line.code,
          description: line.description,
          planned: line.total,
          actual: line.consumed,
          variance: new Decimal(line.total).sub(line.consumed),
          executionRate: new Decimal(line.consumed)
            .div(line.total || 1)
            .mul(100),
        })),
        subtotal: this.calculateSubtotal(cat.lines),
      }))
    );

    return {
      header: {
        budgetName: budget.name,
        period: { start: budget.startDate, end: budget.endDate },
        currency: budget.currency,
        generatedAt: new Date(),
      },
      categories,
      totals: this.calculateTotals(categories),
    };
  }

  async toExcel(data: ExecutionReportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Exécution Budgétaire');

    // Headers
    sheet.columns = [
      { header: 'Code', key: 'code', width: 10 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Prévu', key: 'planned', width: 15 },
      { header: 'Réel', key: 'actual', width: 15 },
      { header: 'Écart', key: 'variance', width: 15 },
      { header: '% Exéc.', key: 'rate', width: 10 },
    ];

    // Data rows
    for (const category of data.categories) {
      // Category header
      sheet.addRow({
        code: category.code,
        description: category.name,
      }).font = { bold: true };

      // Lines
      for (const line of category.lines) {
        sheet.addRow({
          code: line.code,
          description: line.description,
          planned: line.planned.toNumber(),
          actual: line.actual.toNumber(),
          variance: line.variance.toNumber(),
          rate: `${line.executionRate.toFixed(1)}%`,
        });
      }

      // Subtotal
      sheet.addRow({
        description: `Sous-total ${category.name}`,
        planned: category.subtotal.planned.toNumber(),
        actual: category.subtotal.actual.toNumber(),
        variance: category.subtotal.variance.toNumber(),
        rate: `${category.subtotal.executionRate.toFixed(1)}%`,
      }).font = { bold: true, italic: true };
    }

    // Total
    sheet.addRow({
      description: 'TOTAL GÉNÉRAL',
      planned: data.totals.planned.toNumber(),
      actual: data.totals.actual.toNumber(),
      variance: data.totals.variance.toNumber(),
      rate: `${data.totals.executionRate.toFixed(1)}%`,
    }).font = { bold: true, size: 12 };

    return workbook.xlsx.writeBuffer() as Promise<Buffer>;
  }
}
```

## 7.7 API Endpoints

```typescript
// Budgets
GET    /api/budgets                          // Liste budgets
POST   /api/budgets                          // Créer
GET    /api/budgets/:id                      // Détail
PATCH  /api/budgets/:id                      // Modifier
DELETE /api/budgets/:id                      // Supprimer

// Structure (categories & lines)
POST   /api/budgets/:id/categories           // Ajouter catégorie
PATCH  /api/budgets/:id/categories/:catId    // Modifier catégorie
DELETE /api/budgets/:id/categories/:catId    // Supprimer catégorie
POST   /api/budgets/:id/categories/:catId/lines // Ajouter ligne
PATCH  /api/budgets/:id/lines/:lineId        // Modifier ligne
DELETE /api/budgets/:id/lines/:lineId        // Supprimer ligne

// Breakdown
GET    /api/budgets/:id/breakdown/periods    // Par période
GET    /api/budgets/:id/breakdown/activities // Par activité
GET    /api/budgets/:id/breakdown/sources    // Par source
GET    /api/budgets/:id/breakdown/matrix     // Tableau croisé
PATCH  /api/budgets/:id/lines/:lineId/periods // Mettre à jour ventilation

// Funding Sources
GET    /api/budgets/:id/sources              // Liste sources
POST   /api/budgets/:id/sources              // Ajouter
PATCH  /api/budgets/:id/sources/:sourceId    // Modifier
DELETE /api/budgets/:id/sources/:sourceId    // Supprimer
POST   /api/budgets/:id/sources/:sourceId/disbursements // Décaissement

// Tracking
GET    /api/budgets/:id/tracking             // Vue d'ensemble
GET    /api/budgets/:id/tracking/by-category // Par catégorie
GET    /api/budgets/:id/tracking/history     // Évolution
GET    /api/budgets/:id/tracking/alerts      // Alertes
PATCH  /api/budgets/:id/tracking/alerts/:alertId // Config alerte

// Revisions
GET    /api/budgets/:id/revisions            // Liste versions
POST   /api/budgets/:id/revisions            // Créer révision
GET    /api/budgets/:id/revisions/:version   // Détail version
GET    /api/budgets/:id/revisions/compare    // Comparer versions
POST   /api/budgets/:id/revisions/:version/submit  // Soumettre
POST   /api/budgets/:id/revisions/:version/approve // Approuver
POST   /api/budgets/:id/revisions/:version/reject  // Rejeter
GET    /api/budgets/:id/audit-log            // Audit trail

// Reports
POST   /api/budgets/:id/reports/generate     // Générer rapport
GET    /api/budgets/:id/reports              // Liste rapports
GET    /api/budgets/:id/reports/:reportId/download // Télécharger

// Expenses
GET    /api/budgets/:id/expenses             // Liste dépenses
POST   /api/budgets/:id/expenses             // Ajouter dépense
PATCH  /api/budgets/:id/expenses/:expId      // Modifier
DELETE /api/budgets/:id/expenses/:expId      // Supprimer
POST   /api/budgets/:id/expenses/:expId/validate // Valider

// Templates
GET    /api/budgets/templates                // Liste templates
POST   /api/budgets/templates                // Créer
GET    /api/budgets/templates/:id            // Détail
POST   /api/budgets/from-template/:templateId // Créer depuis template
```

## 7.8 Frontend Components

```text
apps/web/src/
├── pages/
│   └── budgets/
│       ├── BudgetsListPage.tsx
│       ├── BudgetEditorPage.tsx
│       ├── BudgetBreakdownPage.tsx
│       ├── BudgetTrackingPage.tsx
│       ├── BudgetRevisionsPage.tsx
│       ├── BudgetReportsPage.tsx
│       ├── ExpensesPage.tsx
│       └── BudgetTemplatesPage.tsx
│
├── components/
│   └── budgets/
│       ├── BudgetList.tsx
│       ├── BudgetCard.tsx
│       ├── BudgetEditor/
│       │   ├── BudgetEditor.tsx
│       │   ├── CategorySection.tsx
│       │   ├── LineRow.tsx
│       │   ├── LineForm.tsx
│       │   └── FormulaInput.tsx
│       ├── breakdown/
│       │   ├── PeriodsView.tsx
│       │   ├── ActivitiesView.tsx
│       │   ├── SourcesView.tsx
│       │   └── PivotTable.tsx
│       ├── tracking/
│       │   ├── TrackingDashboard.tsx
│       │   ├── KPICards.tsx
│       │   ├── ComparisonTable.tsx
│       │   ├── ProjectionWidget.tsx
│       │   ├── TrendChart.tsx
│       │   └── AlertsPanel.tsx
│       ├── revisions/
│       │   ├── VersionsTimeline.tsx
│       │   ├── CompareView.tsx
│       │   ├── WorkflowPanel.tsx
│       │   └── AuditLog.tsx
│       ├── reports/
│       │   ├── ReportGenerator.tsx
│       │   ├── ReportPreview.tsx
│       │   └── ReportHistory.tsx
│       ├── expenses/
│       │   ├── ExpenseList.tsx
│       │   ├── ExpenseForm.tsx
│       │   └── ExpenseValidation.tsx
│       └── FundingSourcesPanel.tsx
│
├── hooks/
│   ├── useBudgets.ts
│   ├── useBudgetEditor.ts
│   ├── useBudgetTracking.ts
│   ├── useBudgetRevisions.ts
│   ├── useExpenses.ts
│   └── useBudgetReports.ts
│
└── services/
    ├── budgets.service.ts
    ├── expenses.service.ts
    └── reports.service.ts
```

---

# Infrastructure Additionnelle

## Redis Setup

```yaml
# docker-compose.yml (ajout)
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

## Environment Variables

```bash
# .env additions
REDIS_URL=redis://localhost:6379

# Email (Nodemailer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@ong-chadia.org

# Currency API (optionnel)
EXCHANGE_RATE_API_KEY=
```

## BullMQ Dashboard (Bull Board)

```typescript
// apps/api/src/config/bull-board.ts
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { collectionQueue, notificationQueue, digestQueue } from './queues';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(collectionQueue),
    new BullMQAdapter(notificationQueue),
    new BullMQAdapter(digestQueue),
  ],
  serverAdapter,
});

export { serverAdapter };

// Dans app.ts
app.use('/admin/queues', isAdmin, serverAdapter.getRouter());
```

---

# Résumé des Nouveaux Modules

| Module | Epic | Tables | Endpoints | Workers |
|--------|------|--------|-----------|---------|
| `opportunities` | 5 | 7 | 18 | 3 |
| `proposals` | 6 | 10 | 22 | 0 |
| `budgets` | 7 | 15 | 35 | 2 |
| **Total Phase 2** | - | **32** | **75** | **5** |

## Dépendances entre Epics

```text
Epic 5 ──────────────────────────────────────────┐
   │                                             │
   │ Opportunity → Proposal (liaison)            │
   ▼                                             │
Epic 6 ──────────────────────────────────────────┤
   │                                             │
   │ Proposal → Budget (projection)              │
   │ ContentBlock → Document (GED)               │
   ▼                                             │
Epic 7 ──────────────────────────────────────────┘
   │
   │ Budget → Project (liaison existante)
   │ Expense → Document (justificatifs GED)
   ▼
Micro-MVP (Epics 1-4)
```

---

*Document créé par Winston (Architect) - Phase 2 Architecture*
*Dernière mise à jour : 2025-01-27*
