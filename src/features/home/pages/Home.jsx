import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../../../shared/components/ui/Footer";
import { useToast } from "../../../shared/components/ui/ToastContext";

// -------------------------------------------------------------------
//  Data
// -------------------------------------------------------------------
const workflows = [
  {
    title: "Create a quiz",
    text: "Write your questions and answer options, set a timer for each one, and save the quiz to use whenever you like.",
    path: "/quizzes/create",
    action: "Create a quiz",
  },
  {
    title: "Open a room",
    text: "Choose one of your quizzes and you get a room code. Share it and players show up in the lobby.",
    path: "/create-room",
    action: "Open a room",
  },
  {
    title: "Join with a code",
    text: "Type in the room code and pick a username. You don't need an account or an email address.",
    path: "/join-room",
    action: "Join a room",
  },
  {
    title: "Check the leaderboard",
    text: "When the last question closes, everyone sees the final scores and where they ended up.",
    path: "/leaderboard",
    action: "View leaderboard",
  },
  {
    title: "Practise with the AI tutor",
    text: "Stuck on a question? Ask the tutor to explain it step by step, then try again.",
    path: "/ai-practice",
    action: "Open AI tutor",
  },
];

const features = [
  {
    title: "Everyone plays at once",
    text: "Questions, timers and scores update live for every player in the room.",
  },
  {
    title: "Scores you can trust",
    text: "The server checks every answer, so the leaderboard is the same for everyone.",
  },
  {
    title: "Instant feedback",
    text: "You see your own result as soon as you answer, before the server confirms it.",
  },
  {
    title: "Your quizzes are saved",
    text: "Quizzes, rooms and results are stored, so you can come back and reuse them.",
  },
];

const heroImages = [
  { src: "/Image1.jpeg", alt: "KuizRoom question mark logo", label: "Curiosity starts here", fit: "contain" },
  { src: "/image2.jpeg", alt: "Learners connected through a shared digital classroom", label: "Learn together", fit: "cover" },
  { src: "/image3.jpeg", alt: "Students answering a quiz together in class", label: "Every answer counts", fit: "cover" },
  { src: "/image4.jpeg", alt: "A student smiling while working through a quiz", label: "Make learning playful", fit: "cover" },
  { src: "/image5.jpeg", alt: "Learners collaborating around a laptop", label: "Bring your room to life", fit: "cover" },
  { src: "/image6.jpeg", alt: "KuizRoom learning experience", label: "Learn something new", fit: "cover" },
  { src: "/image7.png", alt: "KuizRoom quiz experience", label: "Ready for the next challenge", fit: "cover" },
];

// -------------------------------------------------------------------
//  Components
// -------------------------------------------------------------------
function WorkflowCard({ title, text, action, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full flex-col rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-left transition duration-200 hover:-translate-y-1 hover:border-[var(--border-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
      aria-label={`${action}: ${title}`}
    >
      <h3 className="font-display text-2xl font-bold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-[var(--text-muted)]">{text}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-primary)]">
        {action}
        <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  );
}

function FeatureCard({ title, text }) {
  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-6">
      <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{text}</p>
    </div>
  );
}

// -------------------------------------------------------------------
//  Home page
// -------------------------------------------------------------------
export default function Home() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  const [activeHeroImage, setActiveHeroImage] = useState(0);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  });

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const interval = window.setInterval(() => {
      setActiveHeroImage((current) => (current + 1) % heroImages.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const showHeroImage = (direction) => {
    setActiveHeroImage((current) => (current + direction + heroImages.length) % heroImages.length);
  };

  const handleInstall = async () => {
    if (!installPrompt) {
      addToast(
        "To install KuizRoom, open your browser menu and choose 'Install app' or 'Add to Home Screen'.",
        { type: "info", duration: 6000 }
      );
      return;
    }

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  return (
    <main className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Hero */}
      <section
        id="hero"
        className="flex min-h-0 items-start border-b border-[var(--border-color)] px-4 py-8 sm:min-h-[min(760px,calc(100svh-4rem))] sm:items-center sm:px-6 sm:py-14 lg:py-20"
      >
        <div className="mx-auto grid w-full max-w-7xl min-w-0 items-center gap-6 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div className="w-full min-w-0 max-w-2xl -translate-y-2 sm:-translate-y-3">
            <h1 className="font-display text-[clamp(2.4rem,12vw,3.75rem)] font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-[clamp(3.75rem,6vw,6rem)]">
              <span className="block">
                Learn. <span className="text-[var(--brand-primary)]">Laugh.</span>
              </span>
              <span className="block">Compete.</span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:mt-6 sm:text-lg sm:leading-8">
              Write a quiz, share the room code, and everyone answers on their own
              device while the scores update on screen. Players join with just a
              username.
            </p>

            <div className="mt-6 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => navigate("/quizzes/create")}
                className="w-full rounded-lg bg-[var(--brand-primary)] px-7 py-3.5 font-bold text-[#17283a] transition hover:-translate-y-0.5 hover:bg-[#ffc15b] sm:w-auto"
              >
                Create a quiz
              </button>

              <button
                type="button"
                onClick={() => navigate("/join-room")}
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-7 py-3.5 font-bold text-[var(--text-primary)] transition-colors hover:border-[var(--brand-secondary)] hover:text-[var(--brand-secondary)] sm:w-auto"
              >
                Join a room
              </button>

              {!isInstalled && (
                <button
                  type="button"
                  onClick={handleInstall}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3.5 font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] sm:w-auto"
                >
                  <Download size={18} aria-hidden="true" />
                  Install app
                </button>
              )}
            </div>
          </div>

          <div className="relative mx-auto w-full min-w-0 max-w-[520px] lg:justify-self-end">
            <div className="relative aspect-[1.13/1] overflow-hidden border border-[var(--border-color)] bg-[var(--app-surface)] shadow-[0_24px_60px_rgba(17,48,78,0.16)]">
              {heroImages.map((image, index) => (
                <img
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  aria-hidden={index !== activeHeroImage}
                  className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
                    image.fit === "contain" ? "bg-white object-contain p-5 sm:p-8" : "object-cover"
                  } ${index === activeHeroImage ? "opacity-100" : "opacity-0"}`}
                />
              ))}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-[#0c1422]/90 via-[#0c1422]/45 to-transparent px-4 pb-4 pt-14 sm:px-5 sm:pb-5">
                <div aria-live="polite" aria-atomic="true">
                  <p className="text-[10px] font-bold uppercase text-white/70">KuizRoom</p>
                  <p className="mt-1 text-lg font-bold text-white sm:text-xl">
                    {heroImages[activeHeroImage].label}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => showHeroImage(-1)}
                    aria-label="Show previous image"
                    className="grid h-9 w-9 place-items-center border border-white/25 bg-black/20 text-white transition hover:bg-white/15"
                  >
                    <ChevronLeft size={18} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => showHeroImage(1)}
                    aria-label="Show next image"
                    className="grid h-9 w-9 place-items-center border border-white/25 bg-black/20 text-white transition hover:bg-white/15"
                  >
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2" role="group" aria-label="Choose homepage image">
              {heroImages.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setActiveHeroImage(index)}
                  aria-label={`Show image ${index + 1}: ${image.label}`}
                  aria-current={index === activeHeroImage ? "true" : undefined}
                  className={`h-1.5 transition-all ${
                    index === activeHeroImage
                      ? "w-8 bg-[var(--brand-primary)]"
                      : "w-4 bg-[var(--app-text-muted)]/50 hover:bg-[var(--brand-secondary)]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-display text-3xl font-black">Quizzes that don't feel like a test</h2>
          <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
            KuizRoom is for the kind of quiz where people shout answers across the
            room. Everyone plays at the same time, you see scores change as
            answers come in, and there's an AI tutor for when a question needs
            explaining. It also works as a working example of real-time syncing
            between players and a server.
          </p>
        </div>
      </section>

      {/* Workflows */}
      <section id="workflows" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="mb-10 font-display text-4xl font-black">How it works</h2>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {workflows.map((item, index) => (
            <div
              key={item.title}
              className={`${index === 0 ? "md:col-span-2 xl:col-span-1" : ""} ${index === 3 ? "xl:col-span-2" : ""}`}
            >
              <WorkflowCard {...item} onOpen={() => navigate(item.path)} />
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <h2 className="mb-10 font-display text-4xl font-black">What you get</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}