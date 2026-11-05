# Routing and rendering boundaries

Follow the app's router and rendering model. In the App Router, keep layouts and pages as Server Components where possible and place `"use client"` at the interactive boundary that needs browser APIs, event handlers, or client hooks. A client boundary brings its imported component tree into the client graph; compose server-rendered content through supported props or children when needed.

Preserve typed route and component contracts. Use the installed version's signatures for route parameters, search parameters, request APIs, and generated types. Handle loading, missing content, errors, redirects, and pending mutations through the conventions supported by the affected router.

Keep server-only credentials and data access on the server. Validate and authorize requests at their data or action boundary. Pass the data a client component needs through serializable contracts, preserving the application's existing access control and escaping or sanitization behavior.

Use the app's Next.js link, image, font, and metadata facilities where appropriate to its configuration. Preserve ordinary link behavior, responsive image layout, accessible controls, and completed page content. Apply the shared React and interface contracts to the affected components.

For cache or streaming changes, establish the data's owner, request sensitivity, lifetime, and mutation behavior first. Keep request-specific reads outside reusable cache scopes. Preserve required authorization and HTTP response behavior when moving reads behind Suspense, and verify both direct visits and client navigation when they exercise different paths.
