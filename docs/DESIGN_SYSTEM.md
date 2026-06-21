# Cyra Design System

**Inspiration:** Flo · Clue · Apple Health · Linear  
**Personality:** Modern · Trustworthy · Premium · Calm · Human  
**Default mode:** Light

---

## Color Rules

| Token | Hex | Usage |
|-------|-----|-------|
| **Brand (Violet)** | `#5B4BDB` | Interactions only — buttons, links, focus rings, nav active, charts (general) |
| **Cycle (Pink)** | `#EC4899` | Cycle-related only — period tracking, fertility, menstrual UI |
| **Risk Low** | `#059669` | Health assessments — normal / low risk |
| **Risk Moderate** | `#D97706` | Health assessments — elevated / watch |
| **Risk High** | `#DC2626` | Health assessments — high risk / errors |

**Never** use pink for general CTAs. **Never** use violet for cycle widgets. **Never** use risk colors for decoration.

### WCAG AA contrast (light mode)

| Pair | Ratio | Pass |
|------|-------|------|
| `#111118` on `#FFFFFF` | ~17:1 | ✅ Body text |
| `#4A4A5C` on `#FFFFFF` | ~7.5:1 | ✅ Secondary text |
| `#6B6B7B` on `#FFFFFF` | ~4.6:1 | ✅ Tertiary / captions |
| `#FFFFFF` on `#5B4BDB` | ~4.8:1 | ✅ Button labels |
| `#FFFFFF` on `#EC4899` | ~3.9:1 | ⚠️ Large text only — use `#DB2777` (cycle-600) for small text on white |

---

## File Structure

```
client/src/
├── styles/tokens.css       # CSS custom properties (source of truth)
├── lib/tokens.ts           # TypeScript tokens + cn()
├── lib/chartTheme.ts       # Recharts theme
├── index.css               # Tailwind layers + component classes
└── components/ui/          # Design system components

client/tailwind.config.js  # Tailwind theme (maps to CSS vars)
docs/DESIGN_SYSTEM.md       # This document
```

---

## 1. Design Tokens

All tokens live in `client/src/styles/tokens.css` as CSS variables and are mirrored in `client/src/lib/tokens.ts`.

```css
/* Interaction */
--color-brand-500: #5b4bdb;

/* Cycle */
--color-cycle-500: #ec4899;

/* Risk */
--color-risk-low: #059669;
--color-risk-moderate: #d97706;
--color-risk-high: #dc2626;
```

---

## 2. Tailwind Configuration

Use semantic Tailwind classes:

```tsx
// Interactions
className="bg-brand-500 text-ink-inverse hover:bg-brand-600"

// Cycle
className="bg-cycle-50 text-cycle-700 border-cycle-200"

// Risk
className="bg-risk-high-bg text-risk-high"
```

Legacy aliases (`cyra-*`, `lavender-*`, `coral-*`, `wellness-*`) map to brand/cycle/risk for backward compatibility.

---

## 3. Typography Scale

| Token | Size | Use |
|-------|------|-----|
| `text-display-xl` | 2.75rem | Marketing hero |
| `text-display-lg` | 2.25rem | Splash |
| `text-display-md` | 1.875rem | Page hero |
| `text-display-sm` | 1.5rem | Screen titles |
| `text-title-lg` | 1.25rem | Section headers |
| `text-title` | 1.125rem | Card titles |
| `text-title-sm` | 1rem | Subsection |
| `text-body-lg` | 1rem | Lead paragraphs |
| `text-body` | 0.9375rem | Default body |
| `text-body-sm` | 0.875rem | Dense UI |
| `text-caption` | 0.8125rem | Labels, meta |
| `text-micro` | 0.6875rem | Badges, counts |
| `text-overline` | 0.6875rem | Section labels (uppercase) |

**Fonts:** `font-sans` = Inter · `font-display` = Plus Jakarta Sans

---

## 4. Spacing System

4px base grid. Page gutters: `--space-page-x` (20px), `--space-page-y` (24px).

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-12` | 48px |

Layout utilities: `.page-container`, `.page-container-wide`

---

## 5. Elevation System

| Level | Class | Use |
|-------|-------|-----|
| 0 | `shadow-0` | Flat |
| 1 | `shadow-1` / `shadow-xs` | Inputs, chips |
| 2 | `shadow-2` / `shadow-soft` | Buttons |
| 3 | `shadow-3` / `shadow-card` | Cards |
| 4 | `shadow-4` / `shadow-elevated` | Hover cards, dropdowns |
| 5 | `shadow-5` | Modals |
| — | `shadow-glow` | Brand loading / splash |
| — | `shadow-glow-cycle` | Cycle highlights |

---

## 6. Card Styles

| Class / Prop | Use |
|--------------|-----|
| `.card` | Default surface card |
| `.card-elevated` | Raised card |
| `.card-interactive` | Tappable card with hover |
| `.card-cycle` | Cycle-related content |
| `.card-risk-*` | Health assessment results |
| `<Card variant="cycle">` | React API |

---

## 7. Form Styles

| Class | Use |
|-------|-----|
| `.input-field` | Text inputs |
| `.input-field-error` | Invalid state |
| `.input-label` | Field labels |
| `.input-hint` | Helper text |
| `.input-error-text` | Validation errors |
| `.select-field` | Select dropdowns |
| `.checkbox-field` | Checkboxes |

Component: `<Input label hint error icon />`

---

## 8. Buttons

| Variant | Class | Use |
|---------|-------|-----|
| Primary | `.btn-primary` | Main actions (violet) |
| Secondary | `.btn-secondary` | Secondary actions |
| Ghost | `.btn-ghost` | Tertiary / inline |
| Cycle | `.btn-cycle` | Period / cycle CTAs only |
| Danger | `.btn-danger` | Destructive (uses risk-high) |

Component: `<Button variant="primary|secondary|ghost|cycle|danger" loading />`

---

## 9. Navigation

| Class | Use |
|-------|-----|
| `.glass-nav` | Bottom tab bar |
| `.nav-link` | Desktop nav item |
| `.nav-link-active` | Desktop active |
| `.nav-tab` | Mobile tab |
| `.nav-tab-active` | Mobile active tab |
| `.nav-tab-icon-active` | Mobile icon background |

Active state uses **brand violet only** — never pink in nav.

---

## 10. Charts

Theme: `client/src/lib/chartTheme.ts`

| Series | Color | Use |
|--------|-------|-----|
| `brand` | `#5B4BDB` | Symptoms, general trends |
| `cycle` | `#EC4899` | Sleep overlay, cycle metrics |
| `risk-*` | Risk palette | Assessment visualizations |

Wrapper: `.chart-container`

---

## 11. Empty States

| Class / Component | Use |
|-------------------|-----|
| `.empty-state` | Container |
| `.empty-state-icon` | Brand icon background |
| `.empty-state-icon-cycle` | Cycle icon background |
| `<EmptyState context="cycle">` | Menstrual empty states |

---

## 12. Loading States

| Class / Component | Use |
|-------------------|-----|
| `.skeleton` | Shimmer placeholder |
| `.loading-brand` | Brand pulse block |
| `.spinner-brand` | Inline spinner |
| `<LoadingScreen />` | Full-page load |
| `<LoadingSpinner />` | Inline spinner |
| `<SkeletonCard />` | Card skeleton |

---

## 13. Error States

| Class / Component | Use |
|-------------------|-----|
| `.error-state` | Container |
| `.error-state-icon` | Risk-high icon background |
| `<ErrorState onRetry />` | Recoverable errors |
| `.input-error-text` | Form validation |

Errors use **risk-high** — not brand violet.

---

## Quick Reference

```tsx
// Interaction CTA
<Button variant="primary">Continue</Button>

// Cycle CTA
<Button variant="cycle">Log period</Button>

// Cycle card
<Card variant="cycle">
  <ProgressBar color="cycle" value={65} />
</Card>

// Health assessment
<Badge variant="risk-moderate">Elevated</Badge>
<Card variant="risk-moderate">...</Card>

// Section label
<p className="section-label">Insights</p>
```

---

## Migration Notes

- `cyra-*` Tailwind classes → alias to `brand-*`
- `gradient-primary` → alias to `gradient-brand`
- `color="primary"` on ProgressBar → maps to brand
- `Badge variant="coral"` → maps to cycle
- `Badge variant="wellness"` → maps to risk-low

New code should use `brand`, `cycle`, and `risk-*` explicitly.
