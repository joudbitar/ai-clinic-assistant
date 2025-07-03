# AI Clinic Assistant - Frontend

A modern, responsive React dashboard for medical clinic management with comprehensive inline editing capabilities.

## Features

### 🚀 Enhanced Inline Editing System

The frontend now includes a complete, production-ready inline editing system with the following features:

#### ✨ Basic Demographics Editing

- **Double-click to edit** any patient demographic field
- **Auto-focus** and text selection for quick editing
- **Real-time validation** with immediate feedback
- **Instant save** on Enter or blur, with visual confirmation
- **Shadcn/UI components** for consistent styling

#### 📝 Multi-line Text Editing

- **Textarea support** for longer text fields like patient history
- **Auto-expanding** text areas for better user experience
- **Rich formatting** support for clinical notes

#### 📊 Advanced Table Editing

- **Row-by-row editing** for treatments, medications, and procedures
- **Edit/Save/Cancel** controls for each row
- **Inline forms** for adding new entries
- **Confirmation dialogs** for deletions
- **Optimistic updates** for instant feedback

#### 🎯 Smart Form Controls

- **Select dropdowns** for categorical data (gender, marital status, etc.)
- **Date pickers** with proper formatting
- **Phone number formatting** with validation
- **Email validation** with pattern matching

#### 📱 Mobile-Responsive Design

- **Touch-friendly** controls for mobile devices
- **Responsive layouts** that adapt to screen size
- **Accessible interactions** following WCAG guidelines

### 🔧 Technical Implementation

#### State Management

- **React Query** for server state management
- **Optimistic updates** for instant UI feedback
- **Automatic cache invalidation** and refetching
- **Error handling** with retry mechanisms

#### API Integration

- **Supabase** for real-time database operations
- **PATCH requests** for efficient updates
- **Bulk operations** for table row updates
- **Transaction support** for data consistency

#### User Experience

- **Toast notifications** for operation feedback
- **Loading states** with skeleton components
- **Error boundaries** for graceful error handling
- **Keyboard shortcuts** (Enter to save, Escape to cancel)

#### Styling & Design

- **Shadcn/UI** component library for consistency
- **Tailwind CSS** for utility-first styling
- **Custom animations** for smooth transitions
- **Dark mode support** (ready for implementation)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and database

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage

### Basic Inline Editing

1. **Navigate** to any patient detail page
2. **Double-click** on any editable field
3. **Edit** the value using the appropriate input type
4. **Save** by pressing Enter or clicking the checkmark
5. **Cancel** by pressing Escape or clicking the X

### Table Data Management

1. **View** existing data in organized tables
2. **Click Edit** on any row to modify existing entries
3. **Use Add New** buttons to create new entries
4. **Confirm deletions** with the built-in safety prompts

### Form Validation

- **Required fields** are marked with red asterisks
- **Invalid data** shows immediate error messages
- **Format validation** for emails, phones, and dates
- **Custom validation** rules for medical data

## File Structure

```
src/
├── components/
│   ├── ui/              # Shadcn/UI components
│   ├── EditableField.jsx   # Core inline editing component
│   └── AddNewRowForm.jsx   # Table row management
├── hooks/
│   ├── usePatients.js   # React Query hooks for data
│   ├── useMutations.js  # Mutation hooks for updates
│   └── useToast.jsx     # Toast notification system
├── pages/
│   ├── PatientsPage.jsx     # Patient list view
│   ├── PatientDetailPage.jsx # Enhanced patient details
│   └── ...
├── config/
│   └── fieldConfigs.js  # Field definitions and validation
└── lib/
    ├── supabase.js      # Database client
    └── utils.js         # Utility functions
```

## Key Components

### EditableField

The core component that powers inline editing:

- Supports multiple input types (text, select, date, textarea)
- Built-in validation and error handling
- Automatic API integration with React Query
- Keyboard navigation support

### EditableTable

Advanced table component with row-level editing:

- Add, edit, and delete functionality
- Optimistic updates for instant feedback
- Mobile-responsive design
- Customizable field configurations

### Toast System

User-friendly notifications:

- Success, error, and info messages
- Auto-dismissing with customizable timing
- Accessible and screen-reader friendly
- Consistent positioning and styling

## Customization

### Adding New Editable Fields

1. **Define field configuration** in `fieldConfigs.js`
2. **Add validation rules** if needed
3. **Include in component** using `EditableField`
4. **Test thoroughly** across different devices

### Extending Table Functionality

1. **Define field schema** with types and options
2. **Create mutation hooks** in `useMutations.js`
3. **Configure EditableTable** with proper handlers
4. **Add custom validation** as needed

## Performance Optimizations

- **Memoized components** to prevent unnecessary re-renders
- **Debounced API calls** to reduce server load
- **Lazy loading** for large datasets
- **Optimistic updates** for instant user feedback
- **Efficient cache management** with React Query

## Accessibility

- **Keyboard navigation** throughout the application
- **Screen reader support** with proper ARIA labels
- **High contrast mode** compatibility
- **Focus management** for modal interactions
- **Touch-friendly** controls for mobile devices

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Follow the existing code style and patterns
2. Test thoroughly on different screen sizes
3. Ensure accessibility standards are met
4. Update documentation for new features
5. Add appropriate error handling and validation

## License

This project is licensed under the MIT License.
