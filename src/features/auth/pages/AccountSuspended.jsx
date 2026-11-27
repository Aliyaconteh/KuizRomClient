import { Mail, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/contexts/AuthContext";

const SUPPORT_EMAIL = "officialkuizroom@gmail.com";

export default function AccountSuspended() {
  const navigate = useNavigate();
  const { accountSuspension, clearAccountSuspension } = useAuth();

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[var(--app-bg)] px-4 py-10 text-[var(--app-text)]">
      <section className="w-full max-w-xl rounded-3xl border border-[var(--app-border)] border-t-2 border-t-[var(--brand-primary)] bg-[var(--app-surface)] p-6 shadow-2xl shadow-black/30 sm:p-9">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-secondary)] text-[var(--brand-primary)]">
          <ShieldAlert size={28} aria-hidden="true" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-primary)]">
          Account access
        </p>
        <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          Your account has been suspended
        </h1>
        <p className="mt-4 leading-7 text-[var(--text-muted)]">
          {accountSuspension || "This account has been suspended. Contact officialkuizroom@gmail.com for assistance."}
        </p>
        <p className="mt-3 leading-7 text-[var(--text-muted)]">
          We’re sorry for the inconvenience. If you believe this is a mistake or need more information, contact the KuizRoom team.
        </p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-3 font-bold text-[var(--app-bg)] transition hover:brightness-105 sm:w-auto"
        >
          <Mail size={18} aria-hidden="true" />
          Contact {SUPPORT_EMAIL}
        </a>
        <button
          type="button"
          onClick={() => {
            clearAccountSuspension();
            navigate("/signin");
          }}
          className="mt-4 block text-sm font-semibold text-[var(--text-muted)] underline-offset-4 transition hover:text-[var(--brand-primary)] hover:underline"
        >
          Return to sign in
        </button>
      </section>
    </main>
  );
}
