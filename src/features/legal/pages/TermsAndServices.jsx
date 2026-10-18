import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    id: "about-kuizroom",
    title: "1. About KuizRoom",
    paragraphs: [
      "KuizRoom is a web-based quiz application for creating quizzes and taking part in live quiz rooms. It is also being developed as part of an academic research project. Some features may change as the project is tested and improved.",
      "These terms explain the basic rules for using the site. By using KuizRoom, you agree to follow them. If you do not agree, please stop using the service.",
    ],
  },
  {
    id: "using-the-service",
    title: "2. Using the service",
    paragraphs: [
      "Use KuizRoom only for lawful learning, practice, teaching, testing, or research activities. Follow any instructions given by the host of a quiz and do not use the service in a way that prevents other people from taking part.",
      "You are responsible for the nickname, quiz material, and other information you submit. If a feature requires an account, keep your sign-in details private and do not use another person's account without permission.",
    ],
  },
  {
    id: "rooms-and-participants",
    title: "3. Rooms and other participants",
    paragraphs: [
      "A room code and nickname help participants join and identify one another during a live session. Other people in that room may be able to see your nickname, answers, score, or position on the leaderboard. Avoid using personal information as your nickname.",
      "Do not pretend to be another participant, share a room code in a way that disrupts a session, harass other players, or deliberately interfere with a host's quiz.",
    ],
  },
  {
    id: "quiz-content",
    title: "4. Quiz content",
    paragraphs: [
      "Hosts are responsible for the questions, images, documents, and other material they add to a quiz. Only upload or share material you have permission to use, and do not submit content that is unlawful, abusive, or intended to harm others.",
      "KuizRoom does not guarantee that every user-created question is accurate, suitable, or free from mistakes. Hosts should check their quiz content before using it with a class or group.",
    ],
  },
  {
    id: "scores-and-timing",
    title: "5. Scores, timing, and live feedback",
    paragraphs: [
      "KuizRoom uses server-confirmed answers and scores to determine official results. The interface may show a quick response before the server confirms it. If the confirmed result differs, the displayed feedback or score may be updated.",
      "Network delays, device performance, connection problems, or service interruptions can affect what a participant sees and when they see it. Do not assume that a temporary display or connection issue represents the final result; check the confirmed results shown by the application.",
    ],
  },
  {
    id: "ai-features",
    title: "6. AI-generated questions and uploaded files",
    paragraphs: [
      "If AI-assisted quiz generation is available, its suggestions are provided as a starting point. Generated questions and explanations may be wrong, incomplete, or unsuitable for your purpose. Review them before using them in a quiz.",
      "Do not upload confidential, sensitive, or personal information unless you have permission and understand how the feature handles it. Processing may involve third-party services, depending on the feature being used.",
    ],
  },
  {
    id: "research-and-data",
    title: "7. Research and performance data",
    paragraphs: [
      "Some sessions may be used to evaluate how the application behaves, including response times, synchronization, score consistency, and correction of early feedback. Where research data is collected, it should be handled in line with the project's privacy notice and any applicable research requirements.",
      "Do not use KuizRoom's results or performance measurements as the sole basis for a high-stakes decision about a person. The application is a research prototype and is not intended to replace a formal examination system.",
    ],
  },
  {
    id: "acceptable-use",
    title: "8. Things you must not do",
    paragraphs: [
      "You must not attempt to access rooms, accounts, data, or system functions without permission; interfere with the service; manipulate scores or timing; introduce malicious code; or use automated methods to overload the application.",
      "You must not use KuizRoom to break the law, infringe someone else's rights, or disrupt other people's learning or research activities.",
    ],
  },
  {
    id: "availability-and-suspension",
    title: "9. Availability and access",
    paragraphs: [
      "KuizRoom is a developing project, so features may be changed, temporarily unavailable, or removed. We cannot promise uninterrupted access or that every result, generated question, or performance measurement will always be error-free.",
      "Access may be restricted when reasonably necessary to protect participants, the service, or the integrity of a session. You may stop using KuizRoom at any time.",
    ],
  },
  {
    id: "external-services",
    title: "10. External services",
    paragraphs: [
      "KuizRoom may rely on hosting, database, authentication, real-time communication, or AI providers to run certain features. Those services may have their own terms and privacy practices. Their availability can affect KuizRoom, and their terms may apply when you use the relevant feature.",
    ],
  },
  {
    id: "changes-and-contact",
    title: "11. Changes and questions",
    paragraphs: [
      "These terms may be updated as KuizRoom develops. The date at the top of this page shows when this version was last revised. Please review the page occasionally, especially before taking part in a research session.",
      "For questions about these terms, account access, or a data request, contact the KuizRoom project administrator using the contact details provided by the project team. Add a real project email or contact link here before publishing this page.",
    ],
  },
];

export default function TermsAndServices() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Home
        </Link>

        <header className="mt-8 border-b border-[var(--border-color)] pb-8">
          <p className="text-sm font-medium text-[var(--text-muted)]">
            KuizRoom · Website terms
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Terms of Use
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
            These are the basic rules for using KuizRoom to create quizzes,
            join live rooms, and take part in project testing.
          </p>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Last updated: 11 October 2026
          </p>
        </header>

        <nav className="border-b border-[var(--border-color)] py-6" aria-label="Table of contents">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Contents
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {sections.map(({ id, title }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="text-sm leading-6 text-[var(--text-secondary)] underline decoration-[var(--border-color)] underline-offset-4 hover:text-[var(--text-primary)]"
                >
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="divide-y divide-[var(--border-color)]">
          {sections.map(({ id, title, paragraphs }) => (
            <section key={id} id={id} className="scroll-mt-8 py-7">
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-8 border-t border-[var(--border-color)] pt-5 text-xs leading-6 text-[var(--text-muted)]">
          This page is a practical starting point for a student research
          prototype, not legal advice. Before publishing, check that it matches
          the features and data practices actually used by KuizRoom.
        </p>
      </div>
    </main>
  );
}