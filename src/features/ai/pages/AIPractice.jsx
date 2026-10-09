import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, BookOpen, Brain, Lightbulb, Loader2, Sparkles, Target, Trash2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/ui/ToastContext";

const starterMessages = [
  {
    id: 1,
    role: "assistant",
    content:
      "Ask me any private study question. I can explain a concept, give you practice questions, or walk through a doubt step by step."
  }
];


const CHAT_STORAGE_KEY = "kuizroom_ai_practice_chat";
const CHAT_DRAFT_KEY = "kuizroom_ai_practice_draft";
const suggestedPrompts = [
  { icon: BookOpen, title: "Explain a concept", prompt: "Explain a difficult concept to me in simple steps, with an example." },
  { icon: Brain, title: "Quiz me", prompt: "Give me a short practice quiz and wait for my answer after each question." },
  { icon: Lightbulb, title: "Help me understand", prompt: "Help me understand a topic I am struggling with. Ask what topic first." },
  { icon: Target, title: "Make a study plan", prompt: "Help me make a focused study plan for my next quiz." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
};

function renderFormattedReply(content) {
  const text = String(content || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .trim();
  if (!text) return null;

  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return blocks.map((block, blockIndex) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const bulletLines = lines.every((line) => /^([*-]|\d+[.)])\s+/.test(line));

    if (bulletLines) {
      const Tag = /^\d+[.)]\s+/.test(lines[0]) ? "ol" : "ul";
      return (
        <Tag key={`${blockIndex}-${block}`} className="ml-4 space-y-1.5 pl-4">
          {lines.map((line, lineIndex) => (
            <li key={`${blockIndex}-${lineIndex}`} className="leading-6">
              {line.replace(/^([*-]|\d+[.)])\s+/, "")}
            </li>
          ))}
        </Tag>
      );
    }

    const paragraphs = block.split(/\n/).map((line) => line.trim()).filter(Boolean);
    return (
      <div key={`${blockIndex}-${block}`} className="space-y-2">
        {paragraphs.map((line, lineIndex) => (
          <p key={`${blockIndex}-${lineIndex}`} className="whitespace-pre-wrap leading-6">
            {line}
          </p>
        ))}
      </div>
    );
  });
}

export default function AIPractice() {
  const { authFetch } = useAuth();
  const { addToast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  const [messages, setMessages] = useState(() => {
    if (typeof window === "undefined") return starterMessages;
    try {
      const stored = window.localStorage.getItem(CHAT_STORAGE_KEY);
      if (!stored) return starterMessages;
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) return starterMessages;
      return parsed.filter((item) => item && typeof item === "object" && item.role && item.content) || starterMessages;
    } catch {
      return starterMessages;
    }
  });
  const [draft, setDraft] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return window.localStorage.getItem(CHAT_DRAFT_KEY) || "";
    } catch {
      return "";
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const composerRef = useRef(null);
  const conversationMessages = messages.filter(
    (message) => !(message.role === "assistant" && message.id === 1)
  );
  const isWelcome = conversationMessages.length === 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [messages, prefersReducedMotion]);

  useEffect(() => {
    const textarea = composerRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [draft]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignore storage failures and keep the chat usable.
    }
  }, [messages]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAT_DRAFT_KEY, draft);
    } catch {
      // Ignore storage failures and keep the chat usable.
    }
  }, [draft]);

  const resetChat = () => {
    setMessages(starterMessages);
    setDraft("");
    setError("");
    try {
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
      window.localStorage.removeItem(CHAT_DRAFT_KEY);
    } catch {
      // Ignore storage failures on reset.
    }
  };

  const sendMessage = async (text) => {
    const messageText = (text ?? draft).trim();
    if (!messageText || loading) {
      return;
    }

    const messageId = messages.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    const nextMessages = [...messages, { id: messageId, role: "user", content: messageText }];
    setMessages(nextMessages);
    setDraft("");
    setLoading(true);
    setError("");

    try {
      const response = await authFetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          history: messages.map((item) => ({ role: item.role, content: item.content }))
        })
      });

      const payload = response;
      if (!payload.success) {
        throw new Error(payload.message || "AI chat failed.");
      }

      setMessages((current) => [
        ...current,
        { id: messageId + 1, role: "assistant", content: payload.data.reply }
      ]);
    } catch (err) {
      setError(err.message);
      addToast(err.message, { type: "error" });
      setMessages((current) => [
        ...current,
        {
          id: messageId + 1,
          role: "assistant",
          content: "I could not answer that right now. Please try again in a moment."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.main
      initial={prefersReducedMotion ? {} : "hidden"}
      animate="visible"
      variants={fadeUp}
      className="relative min-h-screen overflow-hidden bg-[#050914] px-4 py-5 text-white sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-[calc(100svh-2.5rem)] max-w-5xl flex-col">
        <header className="mb-4 flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#1b5f9c] text-white shadow-lg shadow-blue-950/30">
              <Sparkles size={19} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight text-white sm:text-xl">AI Study Coach</h1>
              <p className="text-xs text-slate-400 sm:text-sm">Your personal space to learn and practice</p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetChat}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-blue-500/60 hover:text-white sm:px-4"
            aria-label="Clear chat"
          >
            <Trash2 size={15} />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </header>

        <motion.section
          variants={fadeUp}
          className="mx-auto flex min-h-[72vh] w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/60 shadow-2xl shadow-black/20 backdrop-blur-xl"
          aria-label="AI tutor conversation"
        >
          <div
            className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {isWelcome ? (
              <div className="mx-auto flex min-h-[52vh] max-w-2xl flex-col items-center justify-center text-center">
                <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                  <Sparkles size={26} />
                </div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">KuizRoom AI Tutor</p>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">What would you like to learn?</h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400 sm:text-base">
                  Ask a question, work through a tricky idea, or practice for your next quiz. We can take it one step at a time.
                </p>
                <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                  {suggestedPrompts.map(({ icon: Icon, title, prompt }) => (
                    <button
                      key={title}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="group flex min-h-20 items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 text-left transition hover:border-blue-500/60 hover:bg-slate-900"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-300 transition group-hover:bg-[#1b5f9c] group-hover:text-white">
                        <Icon size={18} />
                      </span>
                      <span className="text-sm font-semibold text-slate-200">{title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {conversationMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex max-w-[min(100%,42rem)] gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      {message.role === "assistant" && (
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-900/90">
                          <img src="/logo.png" alt="KuizRoom" className="h-full w-full object-contain p-1" />
                        </div>
                      )}

                      <div
                        className={`rounded-3xl border px-4 py-3 text-sm ${
                          message.role === "user"
                            ? "border-blue-400/20 bg-blue-500/10 text-blue-50"
                            : "border-slate-700/70 bg-slate-900/90 text-slate-100"
                        }`}
                      >
                        <div className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {message.role === "user" ? "You" : "AI Tutor"}
                        </div>
                        <div className="space-y-3">
                          {renderFormattedReply(message.content)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3 rounded-3xl border border-slate-700/70 bg-slate-900/90 px-4 py-3 text-sm text-slate-300">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-950/90">
                    <img src="/logo.png" alt="KuizRoom loading" className="h-full w-full object-contain p-1" />
                  </div>
                  <div>
                    <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      AI Tutor is thinking
                    </div>
                    <div className="flex items-center gap-1.5 pt-1" aria-label="Loading response">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300 [animation-delay:-0.2s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300 [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {error && (
            <div className="border-t border-red-500/20 bg-red-500/5 px-5 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="border-t border-slate-800/80 bg-slate-950/50 p-3 sm:p-5">
            <div className="rounded-[1.5rem] border border-slate-700/70 bg-slate-900/90 p-2.5 shadow-2xl shadow-black/20 backdrop-blur-sm transition focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/10">
              <div className="flex items-end gap-2.5">
                <textarea
                  ref={composerRef}
                  rows={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  aria-label="Message the AI tutor"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask anything about what you're studying..."
                  className="min-h-[42px] flex-1 resize-none border-0 bg-transparent px-2.5 py-2.5 text-[14px] leading-6 text-white outline-none placeholder:text-slate-500"
                />

                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={loading || !draft.trim()}
                  aria-label="Send message"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1b5f9c] text-white transition hover:bg-[#164b78] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {loading ? <Loader2 size={17} className="animate-spin" /> : <ArrowUp size={18} />}
                </button>
              </div>

              <p className="mt-1.5 px-2.5 text-[11px] text-slate-500">
                Press Enter to send. Shift+Enter adds a new line.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.main>
  );
}