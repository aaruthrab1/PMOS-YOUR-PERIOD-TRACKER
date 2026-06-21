# Component Hierarchy

## Application Tree

```
App
├── Public Routes
│   ├── LandingPage
│   ├── LoginPage
│   └── SignUpPage
│
├── ProtectedRoute (auth guard)
│   ├── OnboardingPage
│   └── AppLayout
│       ├── Sidebar (desktop) / BottomNav (mobile)
│       └── Outlet
│           ├── DashboardPage
│           │   ├── QuickActionCards
│           │   ├── StatCards
│           │   ├── SymptomTrendChart
│           │   └── TopSymptomsList
│           │
│           ├── TrackPage
│           │   ├── MoodSelector
│           │   ├── CyclePhaseSelector
│           │   ├── EnergySleepSliders
│           │   ├── SymptomChecklist
│           │   └── NotesField
│           │
│           ├── InsightsPage
│           │   ├── SummaryStats
│           │   ├── SymptomTrendChart
│           │   ├── EnergySleepChart
│           │   └── SymptomFrequencyBars
│           │
│           ├── LearnPage
│           │   ├── FeaturedArticles
│           │   └── ArticleList
│           │
│           ├── ArticlePage
│           │   └── MarkdownContent
│           │
│           ├── ChatPage
│           │   ├── MessageList
│           │   ├── StarterPrompts
│           │   ├── TypingIndicator
│           │   └── ChatInput
│           │
│           ├── ReportsPage
│           │   ├── ReportList
│           │   └── ReportDetail
│           │
│           └── SettingsPage
│               ├── ProfileForm
│               ├── ThemeSelector
│               ├── CyclePreferences
│               └── SignOutButton
│
└── Shared UI Components
    ├── Button (primary | secondary | ghost)
    ├── Card / CardHeader / CardTitle
    ├── Input (with label + error)
    └── LoadingScreen
```

## Design System

### Color Palette

| Token | Light | Usage |
|-------|-------|-------|
| `cyra-400` | #E8B4CB | Primary brand, accents |
| `cyra-500` | #D4899F | Buttons, active states |
| `cyra-700` | #9A4F68 | Headings, dark accents |
| `sage-400` | #6BAF8A | Success, positive metrics |
| `surface-light` | #FFFBFE | Page background (light) |
| `surface-dark` | #1A1218 | Page background (dark) |

### Typography

| Element | Font | Weight |
|---------|------|--------|
| Headings | DM Sans | 600–700 |
| Body | Inter | 400–500 |
| Labels | Inter | 500 |

### Spacing & Radius

- Cards: `rounded-3xl` (1.5rem)
- Buttons: `rounded-2xl` (1rem)
- Inputs: `rounded-xl` (0.75rem)
- Page padding: `px-4 py-6`
- Max content width: `max-w-5xl`

## Accessibility (WCAG AA)

| Requirement | Implementation |
|-------------|---------------|
| Color contrast | All text meets 4.5:1 ratio against backgrounds |
| Keyboard navigation | All interactive elements focusable; skip-to-content link |
| Screen readers | `aria-label`, `aria-live`, `role` attributes on dynamic content |
| Focus indicators | `:focus-visible` with 2px cyra-500 outline |
| Reduced motion | `prefers-reduced-motion` disables animations |
| Form labels | All inputs have associated `<label>` elements |
| Error messages | `role="alert"` on validation errors |
| Charts | `role="img"` with descriptive `aria-label` |

## Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| `< 640px` | Single column, bottom nav, stacked cards |
| `640px–1024px` | 2-column grids, bottom nav |
| `≥ 1024px` | Sidebar navigation, 3–4 column grids |

## PWA Components

| Feature | Implementation |
|---------|-------------|
| Manifest | Vite PWA plugin (`vite.config.ts`) |
| Service worker | Workbox auto-generated |
| Offline shell | App shell cached on install |
| API cache | NetworkFirst strategy for Supabase REST |
| Install prompt | Browser-native (no custom prompt yet) |
| Icons | 192x192, 512x512 PNG + maskable |

## Context Provider Tree

```
<BrowserRouter>
  <ThemeProvider>          ← theme state, DOM class toggling
    <AuthProvider>         ← Supabase session, profile
      <SymptomProvider>    ← symptom data cache, API calls
        <App />            ← route rendering
      </SymptomProvider>
    </AuthProvider>
  </ThemeProvider>
</BrowserRouter>
```

Provider ordering matters: ThemeProvider wraps AuthProvider so theme can read preferences after auth loads. SymptomProvider is innermost because it depends on the auth session token.
