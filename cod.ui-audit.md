# UI Audit (shadcn/ui harmonization)

## Summary
- Project already ships shadcn-style primitives in `components/ui` (e.g., `button.tsx`, `card.tsx`, `badge.tsx`, inputs, dialog, dropdown, table, etc.).
- Three brand-specific atoms overlap with shadcn primitives: `brand-button.tsx`, `brand-card.tsx`, `brand-badge.tsx`.
- Actionable: replace usage of brand atoms with shadcn primitives + brand-themed variants via Tailwind tokens.

## Inventory

### Existing shadcn primitives (non-exhaustive)
- Button: `components/ui/button.tsx`
- Card: `components/ui/card.tsx`
- Badge: `components/ui/badge.tsx`
- Form/Input/Textarea/Select/Switch/Tabs/Tooltip/Dropdown/Menu/Dialog/Sheet/Checkbox/Radio/Accordion/Pagination/Table/etc.

### Custom brand atoms (overlapping)
- `components/ui/brand-button.tsx`
- `components/ui/brand-card.tsx`
- `components/ui/brand-badge.tsx`

## Usage findings
- BrandButton: used in 5 files (dashboard pages/slots). Example reference:

```24:31:app/(dashboard)/dashboard/@actions/page.tsx
            <BrandButton
              asChild
              variant='outline'
              className='h-auto flex-col gap-2 p-6'
            >
```

- BrandCard: referenced by `app/(dashboard)/dashboard/@stats/page.tsx`.
- BrandBadge: no external usage found; defined only.

## Replacement map
- BrandButton → `components/ui/button` with brand variants via Tailwind theme (e.g., `variant="brand" | "brandOutline" | "brandGhost"`).
- BrandCard → `components/ui/card` with className/variant props (e.g., `variant="brand"` if extending card cva) or utility `cn()` with brand classes.
- BrandBadge → `components/ui/badge` with brand variants.

## Migration notes
1) Extend existing shadcn primitives' cva variant sets to include brand styles (keep semantic variants: `default`, `secondary`, add `brand`, `brandGradient`).
2) Replace imports:
   - from `@/components/ui/brand-button` → `@/components/ui/button`
   - from `@/components/ui/brand-card` → `@/components/ui/card`
   - from `@/components/ui/brand-badge` → `@/components/ui/badge`
3) Map props:
   - `asChild` is supported by shadcn Button; sizes map (`sm|default|lg|icon`).
   - For Card subcomponents (`Header/Title/Description/Content/Footer`) use existing shadcn card parts; replicate spacing if needed.
4) Remove brand files after replacement and references are gone.

## Theming follow-ups
- Consolidate brand colors (codac-pink/teal, gradients) in `tailwind.config.ts` to support new variants consistently.
- Ensure dark mode tokens exist for brand colors.

## Scope for next step (standardization)
- Replace BrandButton usage in:
  - `app/(dashboard)/dashboard/page.tsx`
  - `app/(dashboard)/dashboard/@myProjects/page.tsx`
  - `app/(dashboard)/dashboard/@featured/page.tsx`
  - `app/(dashboard)/dashboard/@actions/page.tsx`
  - `app/(dashboard)/dashboard/@stats/page.tsx` (if present)
- Replace BrandCard usage in `app/(dashboard)/dashboard/@stats/page.tsx`.
- Remove `brand-*` components once usages are gone.


