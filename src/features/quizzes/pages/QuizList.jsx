import { useEffect, useState, memo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Trash2,
  PlusCircle,
  ListChecks,
  AlertTriangle,
  Plus
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/ui/ToastContext";
import Skeleton from "../../../components/ui/Skeleton";

// ═══════════════════════════════
//  Animation variants (respects motion preference)
// ═══════════════════════════════
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
};

// ═══════════════════════════════
//  Memoised Quiz Card
// ═══════════════════════════════
const QuizCard = memo(function QuizCard({
  quiz,
  onDelete,
  onUseRoom,
  deletingId,
  variants
}) {
  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -2 }}
      className="group bg-[#0d131c]/80 border border-slate-800 rounded-2xl p-4 sm:p-6 transition-colors duration-200 hover:border-indigo-500/40 flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 flex-1">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-extrabold truncate">
            {quiz.title}
          </h2>
          {quiz.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
              {quiz.description}
            </p>
          )}
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-0.5 mt-2">
            {quiz.question_count || 0} questions
          </span>
        </div>
        <button
          onClick={() => onDelete(quiz)}
          disabled={deletingId === quiz.id}
          className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-red-600 text-white border-2 border-red-700 shadow-sm shadow-red-900/30 hover:bg-red-700 hover:border-red-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          title={`Delete ${quiz.title}`}
          aria-label={`Delete ${quiz.title}`}
        >
          {deletingId === quiz.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-[18px] w-[18px]" strokeWidth={3} />
          )}
        </button>
      </div>
      <button
        onClick={() => onUseRoom(quiz.id)}
        className="mt-4 w-full rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all"
      >
        Use for Room
      </button>
    </motion.div>
  );
});

// ═══════════════════════════════
//  Main Component
// ═══════════════════════════════
export default function QuizList() {
  const navigate = useNavigate();
  const { authFetch, isAuthenticated, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const prefersReducedMotion = useReducedMotion();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [confirmDeleteQuiz, setConfirmDeleteQuiz] = useState(null);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    authFetch("/api/quizzes")
      .then((response) => {
        if (!response.success) throw new Error(response.message || "Failed to load quizzes");
        setQuizzes(response.data || []);
      })
      .catch((err) => {
        setError(err.message);
        addToast(err.message, { type: "error" });
      })
      .finally(() => setLoading(false));
  }, [authFetch, isAuthenticated, authLoading, addToast]);

  const handleDeleteQuiz = useCallback((quiz) => setConfirmDeleteQuiz(quiz), []);
  const handleCancelDelete = useCallback(() => setConfirmDeleteQuiz(null), []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDeleteQuiz) return;
    const quiz = confirmDeleteQuiz;
    setDeletingId(quiz.id);
    setError("");

    try {
      const response = await authFetch(`/api/quizzes/${quiz.id}`, {
        method: "DELETE"
      });
      if (!response.success) throw new Error(response.message || "Could not delete");

      setQuizzes((prev) => prev.filter((item) => item.id !== quiz.id));
      setConfirmDeleteQuiz(null);
      addToast("Quiz deleted", { type: "info" });
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId("");
    }
  }, [confirmDeleteQuiz, authFetch, addToast]);

  const handleUseRoom = useCallback(
    (quizId) => navigate(`/create-room?quizId=${encodeURIComponent(quizId)}`),
    [navigate]
  );

  // Loading skeleton
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton count={4} />
    </div>
  );

  // Empty state
  const renderEmpty = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0d131c]/80 border border-slate-800 rounded-2xl p-6 sm:p-10 text-center"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 sm:mb-5">
        <ListChecks size={28} className="text-indigo-400" />
      </div>
      <p className="text-slate-300 text-base sm:text-lg font-semibold mb-2">
        No quizzes yet
      </p>
      <p className="text-slate-500 text-sm mb-5 sm:mb-6">
        Create your first quiz to start hosting rooms.
      </p>
      <button
        onClick={() => navigate("/quizzes/create")}
        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 px-5 py-3 sm:px-6 sm:py-3 font-bold text-sm shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:brightness-110 active:scale-[0.98] transition-all"
      >
        <PlusCircle size={16} />
        Create First Quiz
      </button>
    </motion.div>
  );

  return (
    <>
      <div
        className={`min-h-screen bg-[#060a0f] text-white px-4 sm:px-6 py-8 sm:py-10 relative overflow-hidden transition-opacity duration-700 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Ambient blobs */}
        <div className="absolute w-[300px] sm:w-[520px] h-[300px] sm:h-[520px] rounded-full bg-indigo-500/8 blur-[80px] sm:blur-[90px] -top-20 -right-20 sm:-top-32 sm:-right-36 pointer-events-none" />
        <div className="absolute w-[250px] sm:w-[380px] h-[250px] sm:h-[380px] rounded-full bg-violet-500/8 blur-[60px] sm:blur-[80px] -bottom-16 -left-10 sm:-bottom-20 sm:-left-16 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative">
          {/* Header */}
          <motion.div
            variants={prefersReducedMotion ? {} : fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold tracking-[0.12em] uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-2 sm:mb-3">
                <ListChecks size={11} />
                Quiz Bank
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mt-1">
                Manage{" "}
                <span className="bg-gradient-to-br from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Quizzes
                </span>
              </h1>
            </div>
            {/* Optional: could add a "Create Quiz" button here, but FAB exists */}
          </motion.div>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-5 sm:mb-6 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
              >
                <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          {loading ? (
            renderSkeletons()
          ) : quizzes.length > 0 ? (
            <motion.div
              variants={prefersReducedMotion ? {} : staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {quizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onDelete={handleDeleteQuiz}
                  onUseRoom={handleUseRoom}
                  deletingId={deletingId}
                  variants={prefersReducedMotion ? {} : fadeUp}
                />
              ))}
            </motion.div>
          ) : (
            renderEmpty()
          )}
        </div>

        {/* Floating Action Button (mobile & desktop) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/quizzes/create")}
          className="fixed bottom-6 sm:bottom-8 right-4 sm:right-8 z-40 w-14 h-14 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center active:shadow-md transition-shadow"
          aria-label="Create new quiz"
        >
          <Plus size={24} />
        </motion.button>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDeleteQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCancelDelete}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-quiz-title"
              className="relative z-10 w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0d131c] p-5 text-white shadow-2xl shadow-black/40 sm:p-6"
            >
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-400/25 bg-red-500/10 text-red-300">
                  <AlertTriangle size={19} />
                </div>
                <div className="min-w-0">
                  <h3 id="delete-quiz-title" className="text-base font-bold text-white sm:text-lg">
                    Delete quiz?
                  </h3>
                  <p className="mt-1 break-words text-sm leading-5 text-slate-400">
                    "{confirmDeleteQuiz.title}"
                  </p>
                </div>
              </div>
              <p className="mb-6 text-sm leading-6 text-slate-400">
                This permanently removes the quiz and all its questions. This action cannot be undone.
              </p>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deletingId === confirmDeleteQuiz.id}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === confirmDeleteQuiz.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
