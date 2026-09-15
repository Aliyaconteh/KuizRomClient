import {
  AlertTriangle,
  CheckCircle2,
  Users,
  ShieldCheck,
  Server,
  Sparkles,
  LifeBuoy,
  UserX,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

const terms = [
  {
    id: "using-kuizroom",
    title: "Using KuizRoom",
    icon: Users,
    text: "You may use KuizRoom to create and participate in educational quizzes, live rooms, practice activities, and project evaluation. You are responsible for the accuracy of content you create and for keeping your account credentials private.",
  },
  {
    id: "fair-play",
    title: "Fair play and acceptable content",
    icon: ShieldCheck,
    text: "Do not impersonate another person, disrupt a live room, attempt to manipulate scores or synchronization data, probe the service for unauthorized access, or upload content that is unlawful, harmful, or unrelated to the quiz activity. Hosts should only share content they have the right to use.",
  },
  {
    id: "scoring-results",
    title: "Scoring and live results",
    icon: Server,
    text: "The server is the official authority for answer validation, timing, scoring, and final results. Optimistic feedback may appear before confirmation and can be corrected when the server response arrives. Room codes and nicknames should be treated as visible to other participants in the same room.",
  },
  {
    id: "ai-features",
    title: "AI-assisted features",
    icon: Sparkles,
    text: "AI practice and quiz generation are provided as assistance, not as a substitute for teacher or expert review. AI output can be inaccurate, incomplete, or unsuitable for a particular learner. Review generated questions and explanations before using them in a live quiz.",
  },
  {
    id: "availability",
    title: "Availability and changes",
    icon: LifeBuoy,
    text: "KuizRoom is a research and dissertation prototype. Features may change, be interrupted, or be removed while the system is developed and evaluated. Results, metrics, and generated content should not be treated as guaranteed or error-free.",
  },
  {
    id: "account-closure",
    title: "Account closure and suspension",
    icon: UserX,
    text: "Access may be limited or suspended when necessary to protect users, the service, live sessions, or research data. You may stop using the service at any time and should contact the project administrator about account or data requests.",
  },
];

export default function TermsAndServices() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="relative overflow-hidden">
        {/* Soft glow background */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_55%)]" />

        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
          {/* Back button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-indigo-400 hover:text-[var(--text-primary)]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Home
          </Link>

          {/* Header */}
          <header className="mt-8 border-b border-[var(--border-color)] pb-12">
            <div className="mb-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-indigo-500">
              <CheckCircle2 size={17} aria-hidden="true" />
              KuizRoom agreement
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Terms and Services
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
              These terms set the ground rules for using KuizRoom as a host, player, or participant in the synchronization study.
            </p>
            <p className="mt-4 text-sm text-[var(--text-muted)]">Last updated: 19 August 2026</p>
          </header>

          {/* Table of contents */}
          <nav className="my-10" aria-label="Table of contents">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              On this page
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {terms.map(({ id, title }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] transition hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-[var(--text-primary)]"
                  >
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Policy sections */}
          <div className="space-y-6">
            {terms.map(({ id, title, text, icon: Icon }) => (
              <section
                key={id}
                id={id}
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 transition hover:border-indigo-500/50 hover:bg-[var(--bg-card-hover)] sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{text}</p>
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* Warning notice */}
          <div className="mt-8 flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm leading-6 text-[var(--text-secondary)]">
            <AlertTriangle
              className="mt-0.5 shrink-0 text-amber-400"
              size={20}
              aria-hidden="true"
            />
            <p>
              By continuing to use KuizRoom, you acknowledge these terms. This page describes the project's current operation and is not a replacement for formal legal advice.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}