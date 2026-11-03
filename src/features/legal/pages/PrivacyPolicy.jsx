
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    id: "information-collected",
    title: "1. Information We Collect",
    paragraphs: [
      "KuizRoom collects and processes information necessary to provide its quiz and multiplayer services. This may include your name, email address, display name, account details, room codes, quiz content, submitted answers, scores, and game results.",
      "The application may also collect technical information generated during its operation, including timestamps, connection events, response times, and synchronization measurements.",
    ],
  },
  {
    id: "how-information-is-used",
    title: "2. How We Use Your Information",
    paragraphs: [
      "The information collected is used to create and manage user accounts, organize quiz rooms, manage multiplayer sessions, process answers, calculate scores, display leaderboards, and improve the functionality of KuizRoom.",
      "Technical information may also be used to monitor application performance, identify errors, evaluate synchronization strategies, and improve the reliability of real-time communication.",
    ],
  },
  {
    id: "live-rooms",
    title: "3. Multiplayer Rooms and User Activity",
    paragraphs: [
      "When you join a quiz room, your display name and relevant game activity may be visible to the room host and other participants. This may include submitted answers, scores, rankings, and participation status.",
      "Users are encouraged to choose appropriate display names and avoid sharing passwords, confidential information, or unnecessary personal details during quiz activities.",
    ],
  },
  {
    id: "research-and-performance",
    title: "4. Research and System Performance",
    paragraphs: [
      "KuizRoom is developed as an academic research project examining real-time multiplayer communication and synchronization strategies in web applications.",
      "During system testing and evaluation, technical measurements may be recorded, including response latency, server-confirmed latency, consistency rates, reconciliation events, simulated network delays, and recovery performance.",
      "These measurements are used to evaluate the application's performance and support academic research. Where research findings are presented in dissertations, reports, or presentations, personal information should be excluded or anonymized where reasonably possible. Participation in research activities should follow the applicable consent and institutional requirements.",
    ],
  },
  {
    id: "data-storage",
    title: "5. Data Storage and Third-Party Services",
    paragraphs: [
      "KuizRoom uses Supabase and PostgreSQL for application data and authentication, according to the services configured for the application. Socket.IO supports real-time communication between connected users and the server.",
      "Information may be processed or stored through these services to support account management, quiz activities, room participation, and application functionality.",
      "Third-party service providers may process information in accordance with their own privacy policies and terms of service.",
    ],
  },
  {
    id: "sharing",
    title: "6. Information Sharing",
    paragraphs: [
      "KuizRoom does not require users to make their private account information publicly available. However, certain game-related information, such as display names, scores, rankings, and participation details, may be shared with other participants within a quiz room.",
      "Information may also be processed by service providers responsible for hosting, authentication, database management, and application functionality. Information may be disclosed where required by applicable laws or legitimate legal requests.",
    ],
  },
  {
    id: "retention",
    title: "7. Data Retention and Deletion",
    paragraphs: [
      "Information is retained for as long as necessary to support the application's functionality, maintain relevant records, and conduct the academic evaluation of the system.",
      "The retention period may differ depending on the type of information, including account details, quizzes, submitted answers, game results, and synchronization logs.",
      "Users who wish to request access, correction, or deletion of their personal information may contact the project administrator. Requests will be considered in accordance with applicable requirements and research record-retention obligations.",
    ],
  },
  {
    id: "security",
    title: "8. Data Security",
    paragraphs: [
      "KuizRoom applies appropriate technical and organizational measures to help protect information against unauthorized access, alteration, disclosure, or loss.",
      "However, no internet-based application or electronic storage system can guarantee complete security. Users should protect their login credentials and avoid sharing sensitive information through the platform.",
    ],
  },
  {
    id: "children",
    title: "9. Children's Privacy",
    paragraphs: [
      "KuizRoom is designed to support educational and interactive quiz activities. The application should not be used to collect children's personal information without appropriate parental, guardian, school, or institutional authorization where required.",
      "Anyone organizing quiz activities involving children should ensure that appropriate consent and privacy requirements are followed.",
    ],
  },
  {
    id: "user-rights",
    title: "10. Your Privacy Choices",
    paragraphs: [
      "Users may stop using KuizRoom at any time. Where account management features are available, users may update their account information through the application.",
      "Users may also contact the project administrator to ask questions about how their information is collected, used, stored, or managed.",
    ],
  },
  {
    id: "policy-changes",
    title: "11. Changes to This Privacy Policy",
    paragraphs: [
      "This Privacy Policy may be updated when new features are introduced, existing functionality changes, or improvements are made to the application's data-handling practices.",
      "Any revised version will be published on this page together with an updated revision date. Users are encouraged to review this page periodically.",
    ],
  },
  {
    id: "contact",
    title: "12. Contact Information",
    paragraphs: [
      "KuizRoom is an academic software development and research project.",
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
          Back to Home
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
            At KuizRoom, we respect your privacy and are committed to
            handling your information responsibly. This Privacy Policy
            explains how information is collected, used, stored, and
            protected when you use our real-time multiplayer quiz
            application.
          </p>

          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Last updated: 3 November 2026
          </p>
        </header>

        <nav
          className="border-b border-[var(--border-color)] py-6"
          aria-label="Privacy policy contents"
        >
          <p className="text-sm font-semibold">Table of Contents</p>

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
              <h2 className="text-xl font-bold">
                {section.title}
              </h2>

              <div className="mt-3 space-y-4 text-sm leading-7 text-[var(--text-secondary)]">
                {section.id === "contact" ? (
                  <>
                    <p>
                      For questions, concerns, or requests relating to this
                      Privacy Policy, your account, or your personal
                      information, contact the KuizRoom project administrator
                      at{" "}
                      <a
                        href="mailto:officialkuizroom@gmail.com"
                        className="underline underline-offset-4 hover:text-[var(--text-primary)]"
                      >
                        officialkuizroom@gmail.com
                      </a>
                      .
                    </p>
                    {section.paragraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </>
                ) : (
                  section.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-4 border-t border-[var(--border-color)] pt-6">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} KuizRoom. All rights reserved.
          </p>
        </footer>

      </div>
    </main>
  );
}
