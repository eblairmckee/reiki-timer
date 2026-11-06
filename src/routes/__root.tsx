import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <section className="route-message">
      <h1>Page not found</h1>
      <Link to="/">Return home</Link>
    </section>
  ),
  errorComponent: ({ reset }) => (
    <section className="route-message" role="alert">
      <h1>This page couldn’t load</h1>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </section>
  ),
});
function RootLayout() {
  return (
    <>
      <main id="main">
        <Outlet />
      </main>
    </>
  );
}
