import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: ({ reset }) => (
    <section className="route-message" role="alert">
      <h1>This page couldn’t load</h1>
      <button onClick={reset} type="button">
        Try again
      </button>
    </section>
  ),
  notFoundComponent: () => (
    <section className="route-message">
      <h1>Page not found</h1>
      <Link to="/">Return home</Link>
    </section>
  ),
});
function RootLayout() {
  return (
    <main id="main">
      <Outlet />
    </main>
  );
}
