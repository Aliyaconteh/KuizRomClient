import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    id: "information-collected",
    title: "1. Information KuizRoom uses",
    paragraphs: [
      "KuizRoom uses information needed to run quizzes and live rooms. Depending on how you use the app, this may include account details, a display name, room code, quiz questions, submitted answers, scores, and game results.",
      "If you create an account, your name and email address may be used to identify your account. Authentication is handled by the configured authentication service. Do not assume that information is deleted automatically when you leave a room or stop using the app.",
    ],
  },
  {
    id: "live-rooms",
    title: "2. Live quizzes and room activity",
    paragraphs: [
      "When you join a room, KuizRoom processes your display name and game activity so the host and other participants can take part in the same quiz. Depending on the room and features in use, participants may see answers, scores, rankings, or other game information.",
      "Choose a display name that you are comfortable sharing with other people in the room. Do not use another person's name or submit information about someone else without permission.",
    ],
  },
  {
    id: "research-and-performance",
    title: "3. System performance and research",
    paragraphs: [
      "KuizRoom is a student research project that examines how a real-time quiz application keeps players' screens and scores in sync. During testing, the application may record technical measurements such as response time, server-confirmed latency, consistency, reconciliation events, simulated network delay, and throughput.",
      "These measurements help evaluate the system. If results are used in a dissertation, report, or presentation, personal details should be excluded or removed where practical. Any required participant consent or research approval should be handled separately.",
    ],
  },
  {
    id: "ai-and-uploads",
    title: "4. AI tools and uploaded documents",
    paragraphs: [
      "If you use an AI-assisted feature, the text, questions, or document content you submit may be sent to the AI service configured for KuizRoom so it can generate quiz material or provide an explanation. The AI provider's own terms and privacy policy may also apply.",
      "Only upload documents you are allowed to use. Avoid including passwords, private records, confidential information, or personal details about other people. The storage and deletion of uploaded files depends on how the feature has been implemented.",
    ],
  },
  {
    id: "storage-and-security",
    title: "5. Storage and security",
    paragraphs: [
      "KuizRoom is built to use Supabase for authentication and application data, and Socket.IO for live communication between the browser and server. Information may pass through these services while the app is operating.",
      "Technical measures should be used to protect the information the application handles. However, no website or online service can guarantee complete security. The project should only claim protections that have actually been configured and tested.",
    ],
  },
  {
    id: "sharing-and-retention",
    title: "6. Sharing and how long information is kept",
    paragraphs: [
      "Information may be visible to a room host or other players when needed to run a quiz, display scores, or show results. Service providers may also process information to provide the app's features.",
      "How long account details, quizzes, answers, results, uploaded documents, and research logs are retained depends on the application's configuration and project practices. This policy does not promise automatic deletion or a specific retention period.",
    ],
  },
  {
    id: "your-choices",
    title: "7. Your choices",
    paragraphs: [
      "You can stop using KuizRoom at any time. Where the app provides account settings, you can use them to update the information available there. For questions about accessing, correcting, or deleting information, contact the project administrator or the person responsible for the research.",
      "If you are taking part in a research test, ask the researcher how your information will be used and whether you can withdraw your data from the study. The answer may depend on the study arrangements and whether the data can still be linked to you.",
    ],
  },
  {
    id: "children",
    title: "8. Children and classroom use",
    paragraphs: [
      "KuizRoom may be used for learning activities, but it should not be used to collect children's personal information unless the person organising the activity has followed the relevant consent, school, and legal requirements.",
    ],
  },
  {
    id: "changes-and-contact",
    title: "9. Changes and contact",
    paragraphs: [
      "This policy may be updated as KuizRoom is tested and developed. Update the date at the top of this page whenever a revised version is published.",
      "For privacy questions or requests about information held by KuizRoom, contact the project administrator through the contact details supplied by the project team or your institution.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to home
        </Link>

        <header className="mt-8 border-b border-[var(--border-color)] pb-8">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--brand-secondary)]">
            <LockKeyhole size={18} aria-hidden="true" />
            KuizRoom
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
            This page explains what information KuizRoom may use when you
            create a quiz, join a room, submit answers, or try its AI-assisted
            features.
          </p>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Last updated: 11 October 2026
          </p>
        </header>

        <nav
          className="border-b border-[var(--border-color)] py-6"
          aria-label="Privacy policy sections"
        >
          <p className="text-sm font-semibold">Contents</p>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-[var(--text-secondary)] underline-offset-4 hover:text-[var(--text-primary)] hover:underline"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="divide-y divide-[var(--border-color)]">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-8 py-7 sm:py-8"
            >
              <h2 className="text-xl font-bold">{section.title}</h2>
              <div className="mt-3 space-y-4 text-sm leading-7 text-[var(--text-secondary)]">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-4 border-t border-[var(--border-color)] pt-6 text-sm leading-6 text-[var(--text-muted)]">
          KuizRoom is a research prototype. Before publishing this policy,
          confirm that it matches the data your deployed application actually
          collects, where that data is stored, and how it is deleted.
        </p>
      </div>
    </main>
  );
}
