import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUp,
  BookOpen,
  Brain,
  FileText,
  Lightbulb,
  Loader2,
  MessageSquare,
  Paperclip,
  PanelLeft,
  Plus,
  Sparkles,
  Target,
  Trash2,
  X
} from "lucide-react";
import { useAuth } from "../../../app/contexts/AuthContext";
import { useToast } from "../../../shared/components/ui/ToastContext";

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
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ".pdf,.docx,.txt";
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

function loadChatHistory() {
  if (typeof window === "undefined") return [];

  try {
    const stored = JSON.parse(window.localStorage.getItem(CHAT_STORAGE_KEY) || "null");
    if (Array.isArray(stored)) {
      const messages = stored.filter((item) => item?.role && item?.content);
      if (!messages.length) return [];
      const firstUserMessage = messages.find((item) => item.role === "user");
      return [{
        id: "previous-chat",
        title: firstUserMessage?.content?.split("\n")[0]?.slice(0, 60) || "Previous conversation",
        updatedAt: Date.now(),
        messages
      }];
    }

    return Array.isArray(stored?.conversations)
      ? stored.conversations.filter((chat) => chat?.id && Array.isArray(chat.messages))
      : [];
  } catch {
    return [];
  }
}

function renderFormattedReply(content) {
  const text = String(content || "")
    .replace(/\r\n/g, "\n")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/(?<!\w)\*(?!\s)([^*]+?)(?<!\s)\*(?!\w)/g, "$1")
    .replace(/(?<!\w)\*(?!\s)/g, "")
    .replace(/\*(?=\s|$)/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  if (!text) return null;

  const blocks = text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return blocks.map((block, blockIndex) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const bulletLines = lines.length > 1 && lines.every((line) => /^[A-Za-z0-9].+/.test(line));

    if (bulletLines) {
      return (
        <ul key={`${blockIndex}-${block}`} className="ml-4 list-disc space-y-1.5 pl-4">
          {lines.map((line, lineIndex) => (
            <li key={`${blockIndex}-${lineIndex}`} className="leading-6">
              {line}
            </li>
          ))}
        </ul>
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
  const instanceId = useId();
  const [chatHistory, setChatHistory] = useState(loadChatHistory);
  const [activeChatId, setActiveChatId] = useState(() => loadChatHistory()[0]?.id || null);
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
  const [retryRequest, setRetryRequest] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const endRef = useRef(null);
  const composerRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatSequenceRef = useRef(0);
  const activeChat = chatHistory.find((chat) => chat.id === activeChatId);
  const messages = activeChat?.messages || starterMessages;
  const conversationMessages = messages.filter(
    (message) => !(message.role === "assistant" && message.id === 1)
  );
  const isWelcome = conversationMessages.length === 0;

  const updateChat = (chatId, nextMessages) => {
    setChatHistory((current) => {
      const existing = current.find((chat) => chat.id === chatId);
      const firstUserMessage = nextMessages.find((message) => message.role === "user");
      const updatedChat = {
        id: chatId,
        title: existing?.title || firstUserMessage?.content?.split("\n")[0]?.slice(0, 60) || "New conversation",
        messages: nextMessages
      };
      return [updatedChat, ...current.filter((chat) => chat.id !== chatId)];
    });
  };

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
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({ conversations: chatHistory }));
    } catch {
      addToast("Could not save chat history in this browser.", { type: "error" });
    }
  }, [chatHistory, addToast]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAT_DRAFT_KEY, draft);
    } catch {
      // Ignore storage failures and keep the chat usable.
    }
  }, [draft]);

  const resetChat = () => {
    setActiveChatId(null);
    setDraft("");
    setError("");
    setRetryRequest(null);
    setSelectedFile(null);
    setSidebarOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.localStorage.removeItem(CHAT_DRAFT_KEY);
  };

  const deleteChat = (chatId) => {
    setChatHistory((current) => {
      const next = current.filter((chat) => chat.id !== chatId);

      if (chatId === activeChatId) {
        setActiveChatId(next[0]?.id ?? null);
      }

      if (!next.length) {
        setDraft("");
        setError("");
        setRetryRequest(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        window.localStorage.removeItem(CHAT_DRAFT_KEY);
      }

      return next;
    });
  };

  const selectFile = (file) => {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "txt"].includes(extension)) {
      addToast("Choose a PDF, DOCX, or TXT file.", { type: "error" });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      addToast("The file must be 20 MB or smaller.", { type: "error" });
      return;
    }
    setSelectedFile(file);
  };

  const sendMessage = async (text, retry = null) => {
    if (loading) return;
    const messageText = retry?.messageText ?? (text ?? draft).trim();
    const fileToUpload = retry ? retry.fileToUpload : selectedFile;
    if (!messageText && !fileToUpload) return;

    const chatId = retry?.chatId || activeChatId || `chat-${instanceId}-${chatSequenceRef.current++}`;
    const existingMessages = retry?.existingMessages || conversationMessages;
    const messageId = retry?.messageId || existingMessages.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    const nextMessages = retry?.nextMessages || [
      ...existingMessages,
      {
        id: messageId,
        role: "user",
        content: [
          fileToUpload ? `Attached file: ${fileToUpload.name}` : "",
          messageText || (fileToUpload ? "Please review this file and help me understand its contents." : "")
        ].filter(Boolean).join("\n")
      }
    ];
    setActiveChatId(chatId);
    updateChat(chatId, nextMessages);
    setDraft("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setLoading(true);
    setError("");
    if (!retry) setRetryRequest(null);

    try {
      let body;
      let headers;
      if (fileToUpload) {
        body = new FormData();
        body.append("document", fileToUpload);
        body.append("message", messageText || "Please review this file and help me understand its contents.");
        body.append("history", JSON.stringify(existingMessages.map((item) => ({
          role: item.role,
          content: item.content
        }))));
      } else {
        headers = { "Content-Type": "application/json" };
        body = JSON.stringify({
          message: messageText,
          history: existingMessages.map((item) => ({ role: item.role, content: item.content }))
        });
      }

      const response = await authFetch("/api/ai/chat", {
        method: "POST",
        headers,
        body
      });

      const payload = response;
      if (!payload.success) {
        throw new Error(payload.message || "AI chat failed.");
      }

      updateChat(chatId, [...nextMessages, { id: messageId + 1, role: "assistant", content: payload.data.reply }]);
      setRetryRequest(null);
    } catch (err) {
      setError(err.message);
      updateChat(chatId, nextMessages);
      setRetryRequest({ messageText, fileToUpload, chatId, existingMessages, nextMessages, messageId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.main
      initial={prefersReducedMotion ? {} : "hidden"}
      animate="visible"
      variants={fadeUp}
      className="relative flex h-[calc(100svh-8.5rem)] min-h-[480px] flex-col overflow-hidden bg-[#050914] px-3 py-3 text-white sm:px-5 sm:py-4 lg:h-[calc(100svh-4rem)] lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col">
        <header className="mb-3 flex shrink-0 items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 text-slate-300 transition hover:text-white lg:hidden"
              aria-label="Toggle chat history"
              aria-expanded={sidebarOpen}
            >
              <PanelLeft size={17} />
            </button>
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
            aria-label="Start a new chat"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </header>

        <div className="relative flex min-h-0 flex-1 gap-3">
          {sidebarOpen && (
            <button
              type="button"
              className="absolute inset-0 z-20 bg-black/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close chat history"
            />
          )}
          <aside
            className={`absolute inset-y-0 left-0 z-30 flex w-72 flex-col rounded-2xl border border-slate-800 bg-[#080e1b] p-3 shadow-2xl transition-transform lg:static lg:z-auto lg:w-64 lg:shrink-0 lg:translate-x-0 lg:shadow-none ${
              sidebarOpen ? "translate-x-0" : "-translate-x-[110%] lg:translate-x-0"
            }`}
            aria-label="Chat history"
          >
            <button
              type="button"
              onClick={resetChat}
              className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-blue-500/60 hover:bg-slate-800"
            >
              <Plus size={16} />
              New chat
            </button>
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Recent chats</p>
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-sm transition ${
                    chat.id === activeChatId ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setDraft("");
                      setError("");
                      setRetryRequest(null);
                      setSelectedFile(null);
                      setSidebarOpen(false);
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <MessageSquare size={15} className="shrink-0" />
                    <span className="truncate">{chat.title}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="rounded-lg p-1.5 text-slate-400 opacity-80 transition hover:bg-slate-700 hover:text-white"
                    aria-label={`Delete ${chat.title}`}
                    title="Delete chat history"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {chatHistory.length === 0 && (
                <p className="px-2 py-3 text-xs leading-5 text-slate-500">Your conversations will appear here.</p>
              )}
            </div>
          </aside>

          <motion.section
            variants={fadeUp}
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/60 shadow-2xl shadow-black/20 backdrop-blur-xl"
            aria-label="AI tutor conversation"
          >
          <div
            className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-5 sm:px-8 sm:py-7"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {isWelcome ? (
              <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center py-6 text-center">
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
                              ? "border-[#1b5f9c] bg-[#1b5f9c] text-white"
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
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-red-900 bg-[#7f1d1d] px-5 py-3 text-sm text-white" role="alert">
              <p>{error}</p>
              {retryRequest && (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    sendMessage(retryRequest.messageText, retryRequest);
                  }}
                  disabled={loading}
                  className="shrink-0 rounded-lg border border-white/40 px-3 py-1.5 font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          <div className="shrink-0 border-t border-slate-800/80 bg-slate-950/95 p-3 sm:p-5">
            <div className="rounded-[1.5rem] border border-slate-700/70 bg-slate-900/90 p-2.5 shadow-2xl shadow-black/20 backdrop-blur-sm transition focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/10">
              {selectedFile && (
                <div className="mb-2 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-300">
                  <FileText size={15} className="shrink-0 text-blue-300" />
                  <span className="min-w-0 flex-1 truncate">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="rounded-md p-1 text-slate-400 hover:text-white"
                    aria-label="Remove attached file"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
              <div className="flex items-end gap-2.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  className="hidden"
                  aria-label="Upload a document"
                  onChange={(event) => selectFile(event.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                  aria-label="Attach a PDF, DOCX, or TXT file"
                  title="Attach a PDF, DOCX, or TXT file"
                >
                  <Paperclip size={17} />
                </button>
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
                  disabled={loading || (!draft.trim() && !selectedFile)}
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
      </div>
    </motion.main>
  );
}