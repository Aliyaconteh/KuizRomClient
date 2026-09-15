import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-lg font-extrabold tracking-tight text-[var(--text-primary)]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500 text-white">
              <ShieldCheck size={17} aria-hidden="true" />
            </span>
            KuizRoom
          </Link>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            A real-time multiplayer quiz system for live learning, fair scoring, and synchronization research.
          </p>
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} KuizRoom. Built for learning and evaluation.
          </p>
        </div>

        <nav
          aria-label="Legal and project links"
          className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[var(--text-secondary)]"
        >
          <Link
            className="transition-colors hover:text-[var(--text-primary)]"
            to="/privacy-policy"
          >
            Privacy Policy
          </Link>
          <Link
            className="transition-colors hover:text-[var(--text-primary)]"
            to="/terms-and-services"
          >
            Terms and Services
          </Link>
        </nav>
      </div>
    </footer>
  );
}