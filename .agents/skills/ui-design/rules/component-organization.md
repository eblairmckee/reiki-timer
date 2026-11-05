# Component placement and dependencies

Follow the target app's established directories. For a new React and TypeScript app, use atomic directories for reusable app-owned UI and feature directories for application-specific composition. Create directories as their code is needed. Keep supplied UI-library sources at their expected paths; their primitives already provide the corresponding building blocks.

## Ownership and reuse

Use the [composition responsibilities](composition.md#responsibility-and-boundaries) to choose a level. Keep an organism that knows one feature's data or workflow within that feature. Promote it into shared UI when independent consumers need the same public behavior. Keep component-specific helpers, styles, and behavior tests beside their owner; shared domain types and API functions belong to their feature.

Dependencies flow from screens and features toward reusable organisms, molecules, and primitives. Inject caller-owned content and actions through the component API to preserve that import direction. Keep feature imports out of shared UI and keep cross-component imports acyclic. Expose the public component contract while leaving implementation details local.

## React and TypeScript layout

This layout illustrates placement for an app without an existing convention. The selected library may supply `components/ui/`; locally authored primitives can use `atoms/`. Use the framework's own route directories to assemble feature screens.

```text
apps/<app>/src/
  components/
    ui/
    atoms/
    molecules/
      search-field/
        search-field.tsx
        search-field.test.tsx
    organisms/
      filterable-list/
        filterable-list.tsx
  features/
    catalog/
      catalog-screen.tsx
      catalog-api.ts
      catalog-types.ts
      components/
        catalog-results.tsx
```

Keep a supplied library's established exports and import paths. Resolve code from within the owning app; promote code across apps only when there is a real shared consumer and an agreed package boundary.
