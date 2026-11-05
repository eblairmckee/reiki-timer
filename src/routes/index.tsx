import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Overview });

function Overview() {
  return (
    <section className="page-heading">
      <p className="eyebrow">Component workspace</p>
      <h1>A foundation for thoughtful interfaces.</h1>
      <p>Explore reusable components, composed with Olyx UI.</p>
      <Link className="text-link" to="/data-table">
        Explore the data table →
      </Link>
    </section>
  );
}
