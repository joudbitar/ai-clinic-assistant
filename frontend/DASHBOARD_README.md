# Mission-Control Dashboard

A single-screen dashboard for oncology EMR built with React + Vite and the warm beige theme.

## 🚀 Features

### Layout Components
- **PatientHeader**: Sticky header (90px) with patient identity, status chips, and demographics modal
- **TabsBar**: Navigation between Diagnosis, Treatment, Imaging, and Patient Comms
- **PrimaryCanvas**: Main content area (72% width) with animated tab transitions
- **ContextPane**: Collapsible sidebar (28% width) with context-sensitive cards
- **FooterRibbon**: Sticky footer (40px) with autosave, actions, and timestamps

### Tab Components

#### 1. Diagnosis Tab (`/dashboard/:id/diagnosis`)
- **TimelineDifferentials**: Clinical timeline with expandable events
- **GenomicVariantTable**: Genomic analysis with filtering and detailed views
- Context: NCCN Guidelines, Actionable Mutations

#### 2. Treatment Tab (`/dashboard/:id/treatment`)
- **RegimenSelector**: NCCN treatment selection with compatibility filtering
- **DrugInteractionPanel**: Real-time interaction monitoring with alerts
- Context: Drug Interactions, Survival Curves

#### 3. Imaging Tab (`/dashboard/:id/imaging`)
- **ImageCarousel**: Medical images with AI callouts overlay
- **PathologySummaryCard**: Comprehensive pathology reports
- Context: TNM Staging reference

#### 4. Patient Comms Tab (`/dashboard/:id/comms`)
- **PatientCommunicationEditor**: WYSIWYG editor with live preview
- **Multilingual Support**: Translation preview for 5 languages
- **Reading Level Analysis**: Automated complexity scoring
- Context: Reading Level Meter, Consent Forms

## 🎨 Design System

### Color Palette (Warm Beige Theme)
```css
--parchment: #F9F6F1    /* Main background */
--almond: #F1EAE1       /* Cards/sections */
--cacao: #5B4A42        /* Text headings */
--sage: #7E9C90         /* Accents/links */
--saffron: #FFB547      /* Status highlights */
--clay: #D0614C         /* Urgency/alerts */
```

### Animations
- Tab transitions: fade-slide with `AnimatePresence`
- Card hover effects: subtle scale (1.02)
- Context cards: staggered entrance (50ms delay)
- Smooth spring animations (stiffness: 80, damping: 15)

## 📊 State Management

### Data Fetching
- TanStack Query for all API calls
- Hover prefetching on tab navigation
- Optimistic updates for mutations
- 5-minute stale time, 10-minute cache

### URL Routing
- `/dashboard/:patientId` → defaults to diagnosis tab
- `/dashboard/:patientId/:tab` → specific tab view
- React Router v6 with replace navigation

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS v3
- **Components**: shadcn/ui (customized for beige theme)
- **Animations**: framer-motion
- **Icons**: lucide-react
- **Forms**: react-hook-form + Zod validation
- **Notifications**: sonner
- **Data**: TanStack Query + Supabase

## 🚦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. View Sample Data
```bash
node scripts/seedPatients.js
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Navigate to Dashboard
- URL: `http://localhost:5174/dashboard/1`
- Try different tabs: `/dashboard/1/diagnosis`, `/dashboard/1/treatment`, etc.

## 📱 Responsive Design

### Desktop (lg+)
- Full layout with sidebar context pane
- 72% primary canvas, 28% context pane
- All animations and interactions enabled

### Tablet (md)
- Context pane collapses to icon cluster
- Single column grid layouts adapt
- Touch-friendly button sizes

### Mobile (sm)
- Context pane hidden
- Simplified card layouts
- Priority content prioritized

## 🔧 Customization

### Adding New Tabs
1. Create tab component in `src/pages/tabs/`
2. Add to `tabs` array in `Dashboard.jsx`
3. Add context cards in `ContextPane.jsx`
4. Update prefetch logic for new data

### Theme Modifications
- Update colors in `tailwind.config.js`
- Modify component variants in `src/components/ui/`
- Adjust animation parameters in individual components

## 📦 Component Structure

```
src/
├── pages/
│   ├── Dashboard.jsx                 # Main dashboard shell
│   └── tabs/
│       ├── DiagnosisTab.jsx         # Diagnosis content
│       ├── TreatmentTab.jsx         # Treatment planning
│       ├── ImagingTab.jsx           # Medical imaging
│       └── PatientCommsTab.jsx      # Communications
├── components/
│   ├── PatientHeader.jsx            # Sticky patient info
│   ├── ContextPane.jsx              # Dynamic sidebar
│   ├── FooterRibbon.jsx             # Actions & status
│   ├── diagnosis/
│   │   ├── TimelineDifferentials.jsx
│   │   └── GenomicVariantTable.jsx
│   ├── treatment/
│   │   ├── RegimenSelector.jsx
│   │   └── DrugInteractionPanel.jsx
│   ├── imaging/
│   │   ├── ImageCarousel.jsx
│   │   └── PathologySummaryCard.jsx
│   └── communications/
│       └── PatientCommunicationEditor.jsx
└── scripts/
    └── seedPatients.js              # Sample data
```

## 🎯 Key Features

### Auto-save & State Management
- Real-time autosave with visual indicators
- Optimistic UI updates
- Conflict resolution for concurrent edits

### Accessibility
- Full keyboard navigation
- Screen reader support
- RTL language support
- High contrast ratios

### Performance
- Code splitting by route
- Image lazy loading
- Virtual scrolling for large datasets
- Debounced search inputs

### Medical-Specific Features
- NCCN guideline integration
- Drug interaction checking
- Clinical decision support
- Evidence-based recommendations

## 🔍 Testing

The dashboard includes mock data for all components and can be tested without a backend. All components are designed to work with the existing warm beige theme and integrate seamlessly with the current application architecture.

## 📈 Future Enhancements

- Real-time collaboration
- Offline support
- Advanced AI insights
- Integration with medical devices
- Voice navigation support 