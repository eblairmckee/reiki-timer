import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <section className="page-heading">
      <h1>Page not found</h1>
      <Link to="/">Return home</Link>
    </section>
  ),
  errorComponent: ({ reset }) => (
    <section className="page-heading" role="alert">
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
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="app-header">
        <Link className="brand" to="/">
          Olyx UI
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/" activeOptions={{ exact: true }}>
            Overview
          </Link>
          <Link to="/data-table">Data table</Link>
        </nav>
      </header>
      <main id="main" className="demo">
        <Outlet />
      </main>
    </>
  );
}
