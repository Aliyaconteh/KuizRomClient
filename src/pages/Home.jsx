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
    color: "from-pink-400 to-rose-500",
  },
  {
    title: "Spin up a room",
    text: "Pick your quiz, get a room code, and watch the lobby fill with eager players.",
    path: "/create-room",
    icon: Joystick,
    action: "Launch room",
    color: "from-teal-400 to-cyan-500",
  },
  {
    title: "Hop in with code",
    text: "Enter the code, pick a silly username, and you're in. No email, no fuss.",
    path: "/join-room",
    icon: Users,
    action: "Join the chaos",
    color: "from-amber-400 to-orange-500",
  },
  {
    title: "See who survived",
    text: "After the final buzzer, check the leaderboard and laugh at your friends' scores.",
    path: "/leaderboard",
    icon: Trophy,
    action: "Gloat",
    color: "from-purple-400 to-indigo-500",
  },
  {
    title: "Get your AI buddy",
    text: "Stuck on a question? Open the AI tutor – it explains like a clever friend.",
    path: "/ai-practice",
    icon: Sparkles,
    action: "Chat with AI",
    color: "from-sky-400 to-blue-500",
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
  color,
}) {
  return (
    <motion.button
      onClick={onOpen}
      variants={popIn}
      whileHover={{ scale: 1.03, rotate: -1 }}
      whileTap={{ scale: 0.97, rotate: 1 }}
      className={`group relative flex h-full flex-col rounded-[2rem] border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-left backdrop-blur-sm transition-colors hover:border-[var(--border-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400`}
      aria-label={`${action}: ${title}`}
    >
      {/* Decorative wobbly background */}
      <div className={`absolute -inset-1 -z-10 rounded-[2rem] bg-gradient-to-br ${color} opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-30`} />
      
      <div className="mb-5 flex items-center justify-between">
        <div className={`grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br ${color} text-white shadow-lg`}>
          <Icon size={22} aria-hidden="true" />
        </div>
        <span className="text-3xl font-black opacity-20">✦</span>
      </div>

      <h3 className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)]">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-[var(--text-muted)]">{text}</p>

      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-teal-500 transition-colors group-hover:text-teal-400">
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
      className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 backdrop-blur-md hover:bg-[var(--bg-card-hover)]"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--bg-secondary)] text-amber-500">
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
    <main className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      {/* Decorative floating blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl animate-float-slower" />
        <div className="absolute top-1/2 left-1/3 h-40 w-40 rounded-full bg-amber-400/10 blur-2xl animate-pulse" />
      </div>

      <div className="relative">
        {/* HERO */}
        <section id="hero" className="flex min-h-screen items-center justify-center px-4 py-20 sm:px-6">
          <div className={`max-w-4xl text-center ${heroOpacity} ${heroTransition}`}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--bg-secondary)] px-4 py-2 text-sm font-semibold text-amber-600 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              KuizRoom is live
            </div>

            <h1 className="font-display text-5xl font-black leading-tight sm:text-7xl text-[var(--text-primary)]">
              Learn.{" "}
              <span className="relative inline-block bg-gradient-to-r from-rose-400 via-amber-300 to-teal-400 bg-clip-text text-transparent">
                Laugh.
              </span>{" "}
              <span className="underline decoration-wavy decoration-amber-400/50 underline-offset-8">
                Compete.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
              The multiplayer quiz platform that feels like a game night with your
              loudest friends. Create a quiz, grab a room code, and watch the
              leaderboard erupt. 
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <motion.button
                onClick={handleNavigation("/quizzes/create")}
                whileHover={{ scale: 1.05, rotate: -1 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-8 py-4 font-bold text-white shadow-xl shadow-rose-500/20 hover:shadow-rose-500/40"
              >
                Make a quiz
              </motion.button>

              <motion.button
                onClick={handleNavigation("/join-room")}
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full border-2 border-[var(--border-color)] bg-[var(--bg-card)] px-8 py-4 font-bold text-[var(--text-primary)] backdrop-blur transition-colors hover:border-teal-400 hover:text-teal-500"
              >
                Join a room
              </motion.button>

              {!isInstalled && (
                <motion.button
                  onClick={handleInstall}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-secondary)] px-6 py-4 font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
                >
                  <Download size={18} />
                  Install app
                </motion.button>
              )}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="border-y border-[var(--border-color)] bg-[var(--bg-secondary)] py-14">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6">
            <div className="flex items-center gap-3 text-amber-500">
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
            <p className="font-display text-sm font-bold uppercase tracking-widest text-teal-500">
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
              <p className="font-display text-sm font-bold uppercase tracking-widest text-rose-500">
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