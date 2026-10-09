import { useEffect, useState, memo, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  Radio,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  ArrowRight,
  Laugh,
  Puzzle,
  Joystick,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/ui/Footer";
import { useToast } from "../components/ui/ToastContext";

// -------------------------------------------------------------------
//  Data
// -------------------------------------------------------------------
const workflows = [
  {
    title: "Whip up a quiz",
    text: "Throw in questions, options, and weird wrong answers. Set a timer, then hit the road.",
    path: "/quizzes/create",
    icon: Puzzle,
    action: "Start crafting",
  },
  {
    title: "Spin up a room",
    text: "Pick your quiz, get a room code, and watch the lobby fill with eager players.",
    path: "/create-room",
    icon: Joystick,
    action: "Launch room",
  },
  {
    title: "Hop in with code",
    text: "Enter the code, pick a silly username, and you're in. No email, no fuss.",
    path: "/join-room",
    icon: Users,
    action: "Join the chaos",
  },
  {
    title: "See who survived",
    text: "After the final buzzer, check the leaderboard and laugh at your friends' scores.",
    path: "/leaderboard",
    icon: Trophy,
    action: "Gloat",
  },
  {
    title: "Get your AI buddy",
    text: "Stuck on a question? Open the AI tutor – it explains like a clever friend.",
    path: "/ai-practice",
    icon: Sparkles,
    action: "Chat with AI",
  },
];

const features = [
  { icon: Radio, title: "Live, instant rooms", text: "Everything moves via websockets – questions, timers, and scores update in real time." },
  { icon: ShieldCheck, title: "Server's the boss", text: "The backend checks every answer and scores you fairly – no cheating!" },
  { icon: Clock3, title: "Feedback that's snappy", text: "You see your own answer immediately, while we double-check behind the scenes." },
  { icon: Database, title: "Every quiz saved", text: "All quizzes, rooms, and results live safely in Supabase – you can always revisit." },
  { icon: BarChart3, title: "Synchronisation insights", text: "We compare server-authoritative and optimistic updates so you see what's really going on." },
  { icon: CheckCircle2, title: "One-stop demo", text: "Create, join, play, and review – all from this same dashboard. No wandering." },
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
//  Animation variants
// -------------------------------------------------------------------
const popIn = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 0.6 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

// -------------------------------------------------------------------
//  Memoised components
// -------------------------------------------------------------------
const WorkflowCard = memo(function WorkflowCard({
  title,
  text,
  icon: Icon,
  action,
  onOpen,
}) {
  return (
    <motion.button
      onClick={onOpen}
      variants={popIn}
      whileHover={{ scale: 1.03, rotate: -1 }}
      whileTap={{ scale: 0.97, rotate: 1 }}
      className="group relative flex h-full flex-col rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-left transition-colors hover:border-[var(--border-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
      aria-label={`${action}: ${title}`}
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-[var(--brand-secondary)] text-white shadow-lg">
          <Icon size={22} aria-hidden="true" />
        </div>
        <span className="text-3xl font-black opacity-20">✦</span>
      </div>

      <h3 className="font-display text-2xl font-bold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-[var(--text-muted)]">{text}</p>

      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--brand-primary)] transition-colors group-hover:text-[var(--brand-accent)]">
        {action}
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-2 group-hover:-rotate-6" />
      </span>
    </motion.button>
  );
});

const FeatureCard = memo(function FeatureCard({ icon: Icon, title, text }) {
  return (
    <motion.div
      variants={popIn}
      whileHover={{ y: -4 }}
      className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-6 transition-colors hover:bg-[var(--bg-card-hover)]"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--bg-secondary)] text-[var(--brand-primary)]">
          <Icon size={20} aria-hidden="true" />
        </div>
        <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">{title}</h3>
      </div>
      <p className="text-sm leading-6 text-[var(--text-muted)]">{text}</p>
    </motion.div>
  );
});

// -------------------------------------------------------------------
//  Home page
// -------------------------------------------------------------------
export default function Home() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
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
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

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

  const handleNavigation = useCallback((path) => () => navigate(path), [navigate]);
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

  const heroOpacity = mounted ? "opacity-100" : "opacity-0";
  const heroTransition = prefersReducedMotion ? "transition-none" : "transition-opacity duration-1000";

  return (
    <main className="relative overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div>
        {/* HERO */}
        <section id="hero" className="relative flex min-h-[min(760px,calc(100svh-4rem))] items-center border-b border-[var(--border-color)] px-4 py-14 sm:px-6 lg:py-20">
          <div className={`mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 ${heroOpacity} ${heroTransition}`}>
            <div className="max-w-2xl">
              <div className="mb-7 flex items-center gap-3">
                <img src="/logo.png" alt="KuizRoom logo" className="h-14 w-14 rounded-lg bg-white object-contain p-1 shadow-md sm:h-16 sm:w-16" />
                <div>
                  <p className="text-xl font-extrabold tracking-tight"><span className="text-[var(--brand-primary)]">Kuiz</span><span className="text-[var(--brand-secondary)]">Room</span></p>
                  <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">Live quiz arena</p>
                </div>
              </div>
              <div className="mb-5 inline-flex items-center gap-2 border-l-2 border-[var(--brand-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)]">
                <span className="h-2 w-2 rounded-full bg-[var(--brand-success)]" />
                Play together, learn in real time
              </div>

            <h1 className="font-display text-5xl font-black leading-[1.04] sm:text-6xl lg:text-7xl text-[var(--text-primary)]">
              Learn. <span className="text-[var(--brand-primary)]">Laugh.</span><br />Compete.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
              The multiplayer quiz platform that feels like a game night with your
              loudest friends. Create a quiz, grab a room code, and watch the
              leaderboard erupt. 
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <motion.button
                onClick={handleNavigation("/quizzes/create")}
                whileHover={{ scale: 1.05, rotate: -1 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg bg-[var(--brand-primary)] px-7 py-3.5 font-bold text-[#17283a] shadow-lg shadow-[rgba(247,166,43,0.2)] transition hover:-translate-y-0.5 hover:bg-[#ffc15b]"
              >
                Make a quiz
              </motion.button>

              <motion.button
                onClick={handleNavigation("/join-room")}
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-7 py-3.5 font-bold text-[var(--text-primary)] transition-colors hover:border-[var(--brand-secondary)] hover:text-[var(--brand-secondary)]"
              >
                Join a room
              </motion.button>

              {!isInstalled && (
                <motion.button
                  onClick={handleInstall}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3.5 font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)]"
                >
                  <Download size={18} />
                  Install app
                </motion.button>
              )}
            </div>
            </div>
            <div className="relative mx-auto w-full max-w-[520px] lg:justify-self-end">
              <div className="relative aspect-[1.13/1] overflow-hidden border border-[var(--border-color)] bg-[var(--app-surface)] shadow-[0_24px_60px_rgba(17,48,78,0.16)]">
                {heroImages.map((image, index) => (
                  <img
                    key={image.src}
                    src={image.src}
                    alt={image.alt}
                    aria-hidden={index !== activeHeroImage}
                    className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${image.fit === "contain" ? "bg-white object-contain p-5 sm:p-8" : "object-cover"} ${index === activeHeroImage ? "opacity-100" : "opacity-0"}`}
                  />
                ))}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-[#0c1422]/90 via-[#0c1422]/45 to-transparent px-4 pb-4 pt-14 sm:px-5 sm:pb-5">
                  <div aria-live="polite" aria-atomic="true">
                    <p className="text-[10px] font-bold uppercase text-white/70">KuizRoom</p>
                    <p className="mt-1 text-lg font-bold text-white sm:text-xl">{heroImages[activeHeroImage].label}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button type="button" onClick={() => showHeroImage(-1)} aria-label="Show previous image" className="grid h-9 w-9 place-items-center border border-white/25 bg-black/20 text-white transition hover:bg-white/15">
                      <ChevronLeft size={18} aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => showHeroImage(1)} aria-label="Show next image" className="grid h-9 w-9 place-items-center border border-white/25 bg-black/20 text-white transition hover:bg-white/15">
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
                    className={`h-1.5 transition-all ${index === activeHeroImage ? "w-8 bg-[var(--brand-primary)]" : "w-4 bg-[var(--app-text-muted)]/50 hover:bg-[var(--brand-secondary)]"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="border-y border-[var(--border-color)] bg-[var(--bg-secondary)] py-14">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6">
            <div className="flex items-center gap-3 text-[var(--brand-primary)]">
              <Laugh size={28} />
              <p className="font-display text-lg font-bold uppercase tracking-widest">Why KuizRoom?</p>
            </div>
            <p className="max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
              Because learning shouldn't feel like a lecture. KuizRoom combines live
              quiz battles, instant feedback, and a bit of friendly trash-talking.
              It's built to show how real-time sync works – but honestly, we just
              wanted a reason to throw a quiz party.
            </p>
          </div>
        </section>

        {/* Workflows */}
        <motion.section
          id="workflows"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={prefersReducedMotion ? {} : staggerContainer}
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6"
        >
          <div className="mb-10">
            <p className="font-display text-sm font-bold uppercase tracking-widest text-[var(--brand-secondary)]">
              The flow
            </p>
            <h2 className="mt-2 font-display text-4xl font-black text-[var(--text-primary)]">
              Your quiz night, step by step
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {workflows.map((item, index) => (
              <div key={item.title} className={`${index === 0 ? "md:col-span-2 xl:col-span-1" : ""} ${index === 3 ? "xl:col-span-2" : ""}`}>
                <WorkflowCard {...item} onOpen={handleNavigation(item.path)} />
              </div>
            ))}
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          id="features"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={prefersReducedMotion ? {} : staggerContainer}
          className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]"
        >
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <div className="mb-12 text-center">
              <p className="font-display text-sm font-bold uppercase tracking-widest text-[var(--brand-primary)]">
                Under the hood
              </p>
              <h2 className="mt-2 font-display text-4xl font-black text-[var(--text-primary)]">
                Engineered for fun, built for speed
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </motion.section>

        <Footer />
      </div>
    </main>
  );
}