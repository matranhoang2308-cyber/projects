# ContractCRM design system

## Product principles

- Optimize for task completion and data confidence before decoration.
- Keep one application shell and one primary navigation model.
- Desktop supports dense comparison; mobile supports lookup and focused actions.
- Preserve route names, field names and domain status semantics.

## Layout

- Page padding: 16px on mobile, 24px from `md` upward.
- Content width: use the full product workspace; constrain dense modules to `max-w-screen-xl` when needed.
- Use `min-h-[100dvh]`, not `h-screen`.
- Every flexible content column inside the shell must include `min-w-0`.

## Visual hierarchy

- Page background: `slate-50`.
- Primary surface: white with `slate-200` border.
- Primary action: `slate-950`; one primary action per page or section.
- Blue indicates informational states, emerald success, amber warning and red overdue/error.
- Status colors are semantic and must not be reused as decorative accents.

## Shape and spacing

- Controls and small containers: `rounded-lg`.
- Cards and sheets may use `rounded-xl` when they contain grouped content.
- Control height: 40px desktop; minimum target 44px for touch-first controls.
- Avoid horizontal control rails on mobile. Use disclosure, sheet or wrapping layouts.

## Typography

- Use the project sans stack consistently; do not override font family inside features.
- Use sentence case for labels and headings.
- Use `tabular-nums` for money, percentages, dates and contract metrics.

## Accessibility

- Icon-only buttons require an accessible name.
- Inputs require a visible label or `aria-label` when the surrounding context is unambiguous.
- Keyboard focus must be visible with a 2px ring.
- Clickable table rows must support Enter and Space, or expose a real link/button.
- Provide a skip link to `#main-content`.

## Responsive data views

- Desktop: tables with sticky context columns for comparison.
- Mobile: cards or compact lists containing identity, status, next due date and primary amount.
- Detailed fields belong in progressive disclosure, not in mobile tables.
