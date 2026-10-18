import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Check, Clock3, Loader2, Play, FileText } from "lucide-react";
import { useAuth } from "../../../app/contexts/AuthContext";
import { useToast } from "../../../shared/components/ui/ToastContext";

function formatCreatedAt(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function getOptions(question) {
  if (Array.isArray(question.options)) return question.options;
  return ["option_a", "option_b", "option_c", "option_d"]
    .map((key) => question[key])
    .filter(Boolean);
}

export default function QuizDetails() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const { addToast } = useToast();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    authFetch(`/api/quizzes/${encodeURIComponent(quizId)}`)
      .then((response) => {
        if (!response.success) {
          throw new Error(response.message || "Failed to load quiz details");
        }
        if (active) setQuiz(response.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load quiz details");
        addToast(err.message || "Failed to load quiz details", { type: "error" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authFetch, quizId, addToast]);

  const handleUseRoom = () => {
    navigate(`/create-room?quizId=${encodeURIComponent(quizId)}`);
  };

  return (
    <main className="min-h-screen bg-[#060a0f] px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/quizzes")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0d131c]/80 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-700 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to quizzes
        </button>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center text-indigo-300" role="status">
            <Loader2 className="mr-3 animate-spin" size={22} />
            Loading quiz details...
          </div>
        ) : error ? (
          <section className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <h1 className="text-xl font-bold text-red-300">Could not load this quiz</h1>
            <p className="mt-2 text-sm text-red-200/80">{error}</p>
          </section>
        ) : quiz ? (
          <>
            <section className="rounded-2xl border border-slate-800 bg-[#0d131c]/90 p-5 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-400">
                    Quiz details
                  </p>
                  <h1 className="break-words text-3xl font-extrabold sm:text-4xl">{quiz.title}</h1>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                    {quiz.description || "No description provided."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUseRoom}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 px-5 py-3 text-sm font-bold transition hover:opacity-90"
                >
                  <Play size={16} />
                  Use for Room
                </button>
              </div>

              <div className="mt-6 grid gap-3 border-t border-slate-800 pt-5 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-900/70 p-3">
                  <FileText size={18} className="shrink-0 text-indigo-400" />
                  <div>
                    <p className="text-lg font-bold">{quiz.questions?.length ?? 0}</p>
                    <p className="text-xs text-slate-500">Questions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-slate-900/70 p-3 sm:col-span-2">
                  <CalendarDays size={18} className="shrink-0 text-indigo-400" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Created</p>
                    <p className="break-words text-sm font-semibold text-slate-200">
                      {formatCreatedAt(quiz.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold">Questions</h2>
                  <p className="mt-1 text-sm text-slate-500">Full question and answer details</p>
                </div>
                <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300">
                  {quiz.questions?.length ?? 0} total
                </span>
              </div>

              {quiz.questions?.length ? (
                <div className="space-y-4">
                  {quiz.questions.map((question, index) => (
                    <article
                      key={question.id || `${question.question}-${index}`}
                      className="rounded-2xl border border-slate-800 bg-[#0d131c]/80 p-5 sm:p-6"
                    >
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <h3 className="flex min-w-0 flex-1 gap-3 text-base font-bold leading-6 sm:text-lg">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-sm font-extrabold text-indigo-300">
                            {index + 1}
                          </span>
                          <span className="whitespace-pre-wrap">{question.question}</span>
                        </h3>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
                          <Clock3 size={13} />
                          {question.time_limit ?? 15} sec
                        </span>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {getOptions(question).map((option, optionIndex) => {
                          const isCorrect = option === question.correct_answer;
                          return (
                            <div
                              key={`${option}-${optionIndex}`}
                              className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${
                                isCorrect
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                  : "border-slate-800 bg-slate-900/50 text-slate-300"
                              }`}
                            >
                              <span className="font-bold text-slate-500">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              <span className="min-w-0 flex-1 break-words">{option}</span>
                              {isCorrect && (
                                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-300">
                                  <Check size={14} />
                                  Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-[#0d131c]/80 p-6 text-center text-sm text-slate-400">
                  This quiz does not have any questions yet.
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
