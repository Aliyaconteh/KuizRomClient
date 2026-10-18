import { Link } from "react-router-dom";
import { ArrowLeft, Compass, House } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[calc(100svh-5rem)] items-center justify-center overflow-hidden px-4 py-16 text-center sm:px-6">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--brand-primary)]/10 blur-3xl" />

      <section className="relative w-full max-w-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--brand-primary)] shadow-lg">
          <Compass size={30} aria-hidden="true" />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--brand-secondary)]">
          Page not found
        </p>
        <h1 className="mt-3 text-7xl font-black tracking-tight text-[var(--text-primary)] sm:text-8xl">
          404
        </h1>
        <h2 className="mt-4 text-2xl font-extrabold text-[var(--text-primary)] sm:text-3xl">
          Looks like you took a wrong turn
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[var(--text-secondary)]">
          The page you’re looking for doesn’t exist or may have moved. Let’s get you back to the quiz.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 py-3 font-bold text-[#17283a] transition hover:-translate-y-0.5 hover:brightness-105"
          >
            <House size={17} aria-hidden="true" />
            Back to Home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-6 py-3 font-bold text-[var(--text-primary)] transition hover:border-[var(--brand-secondary)]"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Go Back
          </button>
        </div>
      </section>
    </main>
  );
}