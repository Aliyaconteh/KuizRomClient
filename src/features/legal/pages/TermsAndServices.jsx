
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    id: "about-kuizroom",
    title: "1. About KuizRoom",
    paragraphs: [
      "KuizRoom is a web-based real-time multiplayer quiz application that allows users to create quizzes, join quiz rooms, answer questions, and view live leaderboards.",
      "The platform is also developed as part of an academic research project focusing on real-time communication and synchronization strategies in multiplayer applications. By accessing or using KuizRoom, you agree to comply with these Terms of Use.",
    ],
  },
  {
    id: "accounts",
    title: "2. User Accounts and Responsibilities",
    paragraphs: [
      "Users may be required to provide account information to access certain features of KuizRoom. You are responsible for providing accurate information and maintaining the confidentiality of your login credentials.",
      "You must not access another person's account without authorization or use false information to impersonate another user. You are responsible for activities carried out through your account.",
    ],
  },
  {
    id: "using-the-service",
    title: "3. Use of the Platform",
    paragraphs: [
      "KuizRoom is intended for educational activities, knowledge assessment, learning, practice, and interactive quiz sessions.",
      "Users agree to use the platform responsibly and in accordance with applicable laws. You must not interfere with other users' activities, misuse platform features, or attempt to disrupt normal system operations.",
    ],
  },
  {
    id: "rooms-and-participants",
    title: "4. Quiz Rooms and Participation",
    paragraphs: [
      "Users can create or join quiz rooms using the room codes provided by the application or room host. Participants may be identified by their selected display names during live sessions.",
      "Information such as display names, participation status, answers, scores, and leaderboard positions may be visible to other participants within a room.",
      "Users must not impersonate other participants, deliberately disrupt quiz sessions, share inappropriate content, or interfere with the activities of the room host.",
    ],
  },
  {
    id: "quiz-content",
    title: "5. Quiz Content and Intellectual Property",
    paragraphs: [
      "Quiz hosts are responsible for the questions, answer options, images, and other materials they create or upload to the platform. Users must ensure that they have the necessary rights or permission to use any submitted content.",
      "Users must not upload or distribute unlawful, offensive, misleading, harmful, or copyrighted material without appropriate authorization.",
      "Users retain responsibility for the content they submit. They must not claim ownership of content belonging to other individuals or organizations.",
    ],
  },
  {
    id: "scores-and-synchronization",
    title: "6. Scoring, Timing, and Synchronization",
    paragraphs: [
      "KuizRoom processes submitted answers and calculates scores according to the application's configured quiz rules and synchronization strategy.",
      "The platform may use server-authoritative or optimistic synchronization to manage real-time interactions. In some situations, an initial score or response displayed to a participant may be adjusted after server confirmation.",
      "Network conditions, connection interruptions, device performance, and processing delays may affect the timing and display of game information. Final results are based on the confirmed game state maintained by the application.",
    ],
  },
  {
    id: "research",
    title: "7. Academic Research and Performance Evaluation",
    paragraphs: [
      "KuizRoom is part of an academic research project investigating the performance and consistency of real-time multiplayer quiz applications.",
      "Technical information, including response latency, server-confirmed latency, synchronization consistency, reconciliation frequency, simulated network delays, and recovery performance, may be collected during testing and evaluation.",
      "Research findings may be used in academic dissertations, reports, and presentations. Any research involving participants must follow applicable consent, privacy, and institutional requirements.",
      "KuizRoom is a research and educational application and should not be treated as a replacement for an accredited examination or other high-stakes assessment system.",
    ],
  },
  {
    id: "acceptable-use",
    title: "8. Acceptable Use and Prohibited Activities",
    paragraphs: [
      "Users agree not to misuse, damage, or interfere with KuizRoom or its services. Prohibited activities include:",
      "Attempting unauthorized access to accounts, rooms, servers, or databases.",
      "Manipulating scores, answers, timers, or game results through unauthorized methods.",
      "Introducing malicious software, harmful scripts, or automated requests intended to disrupt the platform.",
      "Harassing, threatening, impersonating, or deliberately disrupting other participants.",
      "Copying, modifying, or distributing protected platform materials without appropriate permission.",
      "Using the application for unlawful activities or violating the rights of other users.",
    ],
  },
  {
    id: "availability",
    title: "9. Service Availability and Modifications",
    paragraphs: [
      "KuizRoom is continuously being developed and improved. Features, functionality, and system components may be modified, updated, temporarily suspended, or discontinued when necessary.",
      "Although reasonable efforts are made to maintain service availability, uninterrupted access cannot be guaranteed. Technical problems, maintenance, network failures, or third-party service interruptions may affect the platform.",
      "Access may be restricted where necessary to protect the platform, its users, or the integrity of quiz sessions.",
    ],
  },
  {
    id: "third-party-services",
    title: "10. Third-Party Services",
    paragraphs: [
      "KuizRoom may depend on external services and technologies, including Supabase, PostgreSQL hosting infrastructure, and real-time communication services, to provide its functionality.",
      "The availability and performance of these services may affect the operation of KuizRoom. Users may also be subject to the applicable terms and privacy policies of third-party providers when using their services.",
    ],
  },
  {
    id: "privacy",
    title: "11. Privacy and Data Protection",
    paragraphs: [
      "The collection, use, storage, and processing of information through KuizRoom are explained in the platform's Privacy Policy.",
      "By using the application, users acknowledge that information may be processed as described in the Privacy Policy. Users are encouraged to review the Privacy Policy to understand how their information is handled.",
    ],
  },
  {
    id: "responsibility",
    title: "12. Disclaimer and Limitation of Responsibility",
    paragraphs: [
      "KuizRoom is provided as an educational and research application. While reasonable efforts are made to ensure that its features operate correctly, the platform is provided without a guarantee that all functions will always be available, accurate, or error-free.",
      "Users should verify important quiz information and results where necessary. To the extent permitted by applicable law, the project team does not guarantee uninterrupted service or accept responsibility for losses arising from temporary service interruptions, network failures, or inaccurate user-submitted content.",
    ],
  },
  {
    id: "changes",
    title: "13. Changes to These Terms",
    paragraphs: [
      "This version reflects the current rules for KuizRoom. The date at the top of this page shows when this version was last revised.",
      "Please review this page periodically, especially before taking part in a research session or continuing to use the platform after a significant update.",
    ],
  },
  {
    id: "contact",
    title: "14. Contact Information",
    paragraphs: [
      "For questions, concerns, or requests regarding these Terms of Use, account access, or a data request, contact the KuizRoom project administrator.",
      "KuizRoom is an academic software development and research project.",
    ],
  },
];

export default function TermsAndServices() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Home
        </Link>

        <header className="mt-8 border-b border-[var(--border-color)] pb-8">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--brand-secondary)]">
            <FileText size={18} aria-hidden="true" />
            KuizRoom · Website Terms
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Terms of Use
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
            Welcome to KuizRoom. These Terms of Use establish the rules
            and responsibilities governing access to and use of our
            real-time multiplayer quiz application. Please read them
            carefully before using the platform.
          </p>

          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Last updated: 3 November 2026
          </p>
        </header>

        <nav
          className="border-b border-[var(--border-color)] py-6"
          aria-label="Terms of use contents"
        >
          <h2 className="text-sm font-semibold">
            Table of Contents
          </h2>

          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {sections.map(({ id, title }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="text-[var(--text-secondary)] underline decoration-[var(--border-color)] underline-offset-4 hover:text-[var(--text-primary)]"
                >
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="divide-y divide-[var(--border-color)]">
          {sections.map(({ id, title, paragraphs }) => (
            <section
              key={id}
              id={id}
              className="scroll-mt-8 py-7 sm:py-8"
            >
              <h2 className="text-xl font-bold tracking-tight">
                {title}
              </h2>

              <div className="mt-3 space-y-4 text-sm leading-7 text-[var(--text-secondary)]">
                {id === "contact" ? (
                  <>
                    <p>
                      For questions, concerns, or requests regarding these Terms of Use, account access, or a data request, contact the KuizRoom project administrator at{" "}
                      <a
                        href="mailto:officialkuizroom@gmail.com"
                        className="underline underline-offset-4 hover:text-[var(--text-primary)]"
                      >
                        officialkuizroom@gmail.com
                      </a>
                      .
                    </p>
                    {paragraphs
                      .filter((paragraph) => !paragraph.toLowerCase().includes("contact the kuizroom project administrator"))
                      .map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                  </>
                ) : (
                  paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-8 border-t border-[var(--border-color)] pt-6">
          <p className="text-sm leading-6 text-[var(--text-muted)]">
            By accessing and using KuizRoom, you acknowledge that you
            have read and understood these Terms of Use and agree to
            comply with the applicable conditions.
          </p>

          <p className="mt-4 text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} KuizRoom. All rights reserved.
          </p>
        </footer>

      </div>
    </main>
  );
}
