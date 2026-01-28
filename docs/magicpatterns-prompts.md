# Prompts MagicPatterns - Amélioration UI

**Date:** 2026-01-25
**Stack:** React + Tailwind CSS + shadcn/ui
**Outil:** MagicPatterns (magicpatterns.com)

> **Note:** Ne pas modifier la page Login. Ces prompts sont pour les autres pages.

---

## 1. Dashboard Page

```
Create a modern NGO dashboard page using React, Tailwind CSS, and shadcn/ui.

Design Style:
- Clean enterprise SaaS aesthetic
- Teal primary color (#0D9488), slate grays, white backgrounds
- Rounded corners (rounded-xl), subtle shadows
- Lucide React icons

Layout:
- Full width content area with p-6 padding
- Welcome section at top with greeting "Welcome back, [Name]" and subtitle

Components needed:

1. Stats Row (3-4 cards horizontal):
- Card 1: "Total Documents" - value "1,248" - icon FileText in blue container - trend "+12%"
- Card 2: "Active Projects" - value "24" - icon FolderKanban in amber container - trend "+3"
- Card 3: "Team Members" - value "156" - icon Users in emerald container - trend "+8"
Each card: white bg, rounded-xl, shadow-sm, hover lift effect

2. Recent Documents Table (2/3 width):
- Header: "Recent Documents" with "View All" link
- Table columns: Document Name (with icon + title + subtitle), Status (badge), Date, Actions (3-dot menu)
- Status badges: green "Approved", yellow "Review", gray "Draft"
- Rows with hover:bg-slate-50 effect
- 4-5 sample rows

3. Activity Feed Sidebar (1/3 width):
- Header: "Recent Activity"
- Timeline items with: avatar circle, user name bold, action text, target link in teal, timestamp
- Vertical connecting line between items
- "View All Activity" button at bottom

4. Action Buttons in header:
- Secondary button "History" with Clock icon
- Primary button "New Document" with FileText icon
```

---

## 2. Documents Page

```
Create a file management documents page using React, Tailwind CSS, and shadcn/ui.

Design Style:
- Clean enterprise SaaS aesthetic
- Teal primary color (#0D9488), slate grays, white backgrounds
- Rounded corners (rounded-xl), subtle shadows
- Lucide React icons

Layout:
- Split view: left sidebar (256px) + main content area
- Full height design (calc 100vh - navbar)

Components needed:

1. Folder Tree Sidebar:
- Header: "Folders" with plus icon button
- Tree structure with folder icons, expand/collapse chevrons
- Items: "Projects", "Administration", "Human Resources", "Donors", "Templates"
- Nested folders with indentation
- Selected state: teal background, teal text
- Hover state: slate-50 background

2. Main Content Header:
- Toggle sidebar button (PanelLeft icon)
- Page title "Documents" with subtitle "Manage and organize your files"
- Breadcrumb: Home > Folder > Subfolder (clickable links)

3. Toolbar Bar:
- Search input with Search icon, placeholder "Search by name..."
- View toggle buttons: Grid icon / List icon
- Filter dropdown: "All Types", "PDF", "Word", "Excel", "Images"
- Sort dropdown: "Date", "Name", "Size"

4. Document Grid View:
- 4 columns responsive grid
- Document cards: file type icon (colored by type), filename, file size, date
- Hover: show action buttons (Download, Rename, Delete, Share)
- Checkbox in corner for multi-select

5. Upload Dropzone:
- Dashed border container
- Cloud upload icon centered
- Text: "Drag & drop files here or click to browse"
- Hover: teal border, teal background light

6. Empty State (when no documents):
- Large folder icon grayed out
- Text: "No documents yet"
- Primary button: "Upload your first document"
```

---

## 3. Users Management Page

```
Create an admin users management page using React, Tailwind CSS, and shadcn/ui.

Design Style:
- Clean enterprise SaaS aesthetic
- Teal primary color (#0D9488), slate grays, white backgrounds
- Rounded corners (rounded-xl), subtle shadows
- Lucide React icons

Layout:
- Single column, full width with p-6 padding
- Stacked sections: header, stats, filters, table, pagination

Components needed:

1. Page Header:
- Title: "User Management"
- Subtitle: "Create and manage platform user accounts"
- Primary button right: "Add User" with UserPlus icon

2. Stats Cards Row (4 cards):
- "Total Users" - value "156" - Users icon
- "Active" - value "142" - green dot indicator
- "Admins" - value "3" - Shield icon
- "Staff" - value "24" - Briefcase icon
Cards: smaller size, horizontal layout, icon left

3. Filter Bar:
- Search input: "Search users..."
- Role dropdown filter: "All Roles", "Super Admin", "Staff", "Contributor", "Guest"
- Status toggle: "All", "Active", "Inactive"
- Clear filters link

4. Users Data Table:
- Columns: User (avatar + name + email stacked), Role (badge), Status (badge), Last Login, Actions
- Role badges: purple "Super Admin", blue "Staff", teal "Contributor", gray "Guest"
- Status badges: green dot "Active", red dot "Inactive"
- Actions: 3-dot menu with Edit, Deactivate options
- Row hover effect
- 6-8 sample user rows with realistic names

5. Pagination:
- "Showing 1-20 of 156 users" text
- Previous/Next buttons
- Page numbers: 1, 2, 3, ..., 8

6. Table hover actions:
- Edit icon button
- Trash icon button (red on hover)
```

---

## 4. Projects Page

```
Create a project management page with Kanban view using React, Tailwind CSS, and shadcn/ui.

Design Style:
- Clean enterprise SaaS aesthetic
- Teal primary color (#0D9488), slate grays, white backgrounds
- Rounded corners (rounded-xl), subtle shadows
- Lucide React icons

Layout:
- Header section + horizontal scrollable Kanban columns
- Full width, overflow-x-auto for columns

Components needed:

1. Page Header:
- Title: "Projects"
- Subtitle: "Track and manage NGO projects"
- View toggle: "Kanban" / "List" buttons
- Primary button: "New Project" with Plus icon

2. Stats Bar (horizontal):
- "Total: 24" | "On Track: 18" (green) | "At Risk: 4" (amber) | "Completed: 8" (teal)
- Small cards or pill badges inline

3. Filter Tabs:
- "All Projects", "My Projects", "Starred"
- Active tab: teal underline

4. Kanban Columns (4 columns):
Column headers with count badge:
- "Draft" (gray) - 3 cards
- "Preparation" (blue) - 4 cards
- "In Progress" (amber) - 6 cards
- "Completed" (green) - 8 cards

5. Project Cards in each column:
- Card header: Project title bold
- Description: 2 lines truncated gray text
- Progress bar: colored by status, percentage label
- Bottom row:
  - Stacked avatars (3-4 team members, +2 overflow)
  - Deadline badge with Calendar icon "Jan 30"
- Hover: subtle lift shadow
- Drag handle icon top-right

6. Add Card Button:
- At bottom of each column
- Dashed border, plus icon, "Add Project" text
- Hover: teal border

7. Project Card Status Indicators:
- Green dot: on track
- Amber dot: at risk
- Red dot: overdue

Sample projects:
- "Water Sanitation Phase 2" - 75% - 4 members
- "Medical Supply Distribution" - 45% - 3 members
- "Education Center Construction" - 20% - 5 members
- "Food Security Program" - 100% - 2 members
```

---

## Instructions d'utilisation

1. Copier un prompt à la fois dans MagicPatterns
2. Générer le design
3. Ajuster si nécessaire en demandant des modifications
4. Exporter en React + Tailwind
5. Intégrer dans le projet en adaptant les imports aux composants existants

## Composants existants à réutiliser

- `@/components/ui/button` - Button avec variants
- `@/components/ui/card` - Card avec hoverEffect
- `@/components/ui/badge` - Badge avec variants
- `@/components/ui/input` - Input avec icon
- `@/components/ui/avatar` - Avatar avec fallback
- `@/components/ui/table` - Table components
- `@/components/layout/DashboardLayout` - Layout wrapper

## Palette de couleurs

| Couleur | Tailwind Class | Hex |
|---------|----------------|-----|
| Primary | primary-600 | #0D9488 |
| Text | slate-900 | #0F172A |
| Text secondary | slate-600 | #475569 |
| Background | white / slate-50 | #FFFFFF / #F8FAFC |
| Border | slate-200 | #E2E8F0 |
| Success | emerald-600 | #059669 |
| Warning | amber-600 | #D97706 |
| Error | red-600 | #DC2626 |
