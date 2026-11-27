import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, Clock3, Eye, Loader2, Search, ShieldCheck, Trash2, X } from "lucide-react";
import { useAuth } from "../../../app/contexts/AuthContext";

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString();
}

export default function AdminQuizzesPage() {
  const { authFetch } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [quizDetails, setQuizDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    authFetch("/api/admin/quizzes")
      .then((response) => {
        if (!response.success) throw new Error(response.message || "Unable to load quizzes");
        if (active) setQuizzes(response.data || []);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authFetch]);

  const filteredQuizzes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return quizzes;
    return quizzes.filter((quiz) =>
      [quiz.title, quiz.description, quiz.owner_name, quiz.owner_email]
        .some((value) => value?.toLowerCase().includes(query))
    );
  }, [quizzes, search]);

  const deleteQuiz = async (quiz) => {
    if (!window.confirm(`Permanently delete "${quiz.title}" and its questions? This cannot be undone.`)) return;
    setDeletingId(quiz.id);
    setError("");
    setNotice("");

    try {
      const response = await authFetch(`/api/admin/quizzes/${encodeURIComponent(quiz.id)}`, { method: "DELETE" });
      if (!response.success) throw new Error(response.message || "Unable to delete quiz");
      setQuizzes((current) => current.filter((item) => item.id !== quiz.id));
      setNotice(`Quiz "${quiz.title}" was removed.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeletingId("");
    }
  };

  const closeQuizDetails = () => {
    setSelectedQuizId("");
    setQuizDetails(null);
    setDetailsError("");
  };

  const viewQuestions = async (quiz) => {
    setSelectedQuizId(quiz.id);
    setQuizDetails(null);
    setDetailsError("");
    setDetailsLoading(true);

    try {
      const response = await authFetch(`/api/admin/quizzes/${encodeURIComponent(quiz.id)}`);
      if (!response.success) throw new Error(response.message || "Unable to load quiz questions");
      setQuizDetails(response.data);
    } catch (requestError) {
      setDetailsError(requestError.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedQuizId) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedQuizId("");
        setQuizDetails(null);
        setDetailsError("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedQuizId]);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-8 text-[var(--text-primary)] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-400">
              <ShieldCheck size={15} /> Admin · Quizzes
            </p>
            <h1 className="text-3xl font-extrabold sm:text-4xl">Quiz management</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Browse platform quizzes and search by quiz title or host Gmail.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm">
            <BookOpen size={17} className="text-indigo-400" /> {quizzes.length} quizzes
          </div>
        </header>

        {error && <div role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>}
        {notice && <div role="status" className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

        <section className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
          <div className="border-b border-[var(--border-color)] px-5 py-4 sm:px-6">
            <h2 className="text-lg font-bold">All quizzes</h2>
            <label htmlFor="admin-quiz-search" className="sr-only">Search quizzes by title or host Gmail</label>
            <div className="relative mt-4 max-w-xl">
              <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input id="admin-quiz-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title or host Gmail" className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--app-input-bg)] py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-400" />
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-[var(--text-muted)]" role="status"><Loader2 size={18} className="animate-spin" /> Loading quizzes...</div>
          ) : filteredQuizzes.length === 0 ? (
            <p className="p-8 text-center text-sm text-[var(--text-muted)]">{quizzes.length ? "No quizzes match your search." : "No quizzes found."}</p>
          ) : (
            <ul className="divide-y divide-[var(--border-color)]">
              {filteredQuizzes.map((quiz) => (
                <li key={quiz.id} className="flex flex-col gap-3 px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="break-words font-semibold">{quiz.title}</h3>
                      {quiz.description && <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--text-muted)]">{quiz.description}</p>}
                      <span className="mt-2 inline-flex w-fit rounded-full border border-[var(--border-color)] bg-[var(--app-surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--text-muted)]">
                        {quiz.question_count} {quiz.question_count === 1 ? "question" : "questions"}
                      </span>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:shrink-0">
                      <button
                        type="button"
                        onClick={() => viewQuestions(quiz)}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[var(--brand-secondary)] bg-[var(--brand-secondary)] px-3 py-2 text-xs font-semibold text-white transition hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-[var(--app-bg)] sm:w-36"
                      >
                        <Eye size={14} aria-hidden="true" /> View questions
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteQuiz(quiz)}
                        disabled={deletingId === quiz.id}
                        aria-label={`Delete inappropriate quiz ${quiz.title}`}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-500/10 disabled:opacity-60 sm:w-36"
                      >
                        {deletingId === quiz.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} aria-hidden="true" />}
                        Remove quiz
                      </button>
                    </div>
                  </div>
                  <dl className="grid gap-2 text-xs text-[var(--text-muted)] sm:grid-cols-3">
                    <div><dt className="inline font-semibold">Host: </dt><dd className="inline">{quiz.owner_name || "Deleted user"}</dd></div>
                    <div><dt className="inline font-semibold">Host Gmail: </dt><dd className="inline break-all">{quiz.owner_email || "Unavailable"}</dd></div>
                    <div><dt className="inline font-semibold">Created: </dt><dd className="inline">{formatDate(quiz.created_at)}</dd></div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {selectedQuizId && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeQuizDetails();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-quiz-dialog-title"
            className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-[var(--border-color)] px-5 py-5 sm:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                  <BookOpen size={22} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-500">Quiz review</p>
                  <h2 id="admin-quiz-dialog-title" className="mt-1 truncate text-xl font-extrabold">
                    {quizDetails?.title || "Quiz questions"}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={closeQuizDetails}
                aria-label="Close quiz details"
                className="rounded-xl border border-[var(--border-color)] p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
              >
                <X size={18} />
              </button>
            </header>

            <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              {detailsLoading ? (
                <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-[var(--text-muted)]" role="status">
                  <Loader2 size={20} className="animate-spin text-indigo-500" /> Loading quiz questions...
                </div>
              ) : detailsError ? (
                <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">{detailsError}</div>
              ) : quizDetails ? (
                <>
                  <div className="grid gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/40 p-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Host</p>
                      <p className="mt-1 font-semibold">{quizDetails.owner_name || "Deleted user"}</p>
                      <p className="mt-1 break-all text-sm text-[var(--text-muted)]">{quizDetails.owner_email || "Email unavailable"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Created</p>
                      <p className="mt-1 text-sm font-medium">{formatDate(quizDetails.created_at)}</p>
                    </div>
                    {quizDetails.description && <p className="text-sm leading-6 text-[var(--text-muted)] sm:col-span-3">{quizDetails.description}</p>}
                  </div>

                  <div className="mb-3 mt-6 flex items-end justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">Questions and answers</h3>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">Correct answers are marked for moderation review.</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-xs font-bold text-indigo-500">
                      {quizDetails.questions?.length || 0} total
                    </span>
                  </div>
                  {quizDetails.questions?.length ? (
                    <ol className="space-y-3">
                      {quizDetails.questions.map((question, index) => {
                        const options = Array.isArray(question.options) ? question.options : [];
                        return (
                          <li key={question.id || `${question.question}-${index}`} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-5">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="flex min-w-0 gap-3 font-semibold leading-6">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-sm font-bold text-indigo-500">{index + 1}</span>
                                <span className="break-words">{question.question}</span>
                              </h4>
                              <span className="inline-flex shrink-0 items-center gap-1 text-xs text-[var(--text-muted)]">
                                <Clock3 size={13} /> {question.time_limit || 15}s
                              </span>
                            </div>
                            {options.length > 0 && (
                              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                                {options.map((option, optionIndex) => {
                                  const correct = String(option).trim() === String(question.correct_answer ?? "").trim();
                                  return (
                                    <li
                                      key={`${question.id}-${optionIndex}`}
                                      className={`flex min-w-0 items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${
                                        correct
                                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                                          : "border-[var(--border-color)] text-[var(--text-secondary)]"
                                      }`}
                                    >
                                      <span className="shrink-0 font-bold">{String.fromCharCode(65 + optionIndex)}.</span>
                                      <span className="min-w-0 flex-1 break-words">{option}</span>
                                      {correct && <Check size={15} className="shrink-0" aria-label="Correct answer" />}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <div className="rounded-2xl border border-[var(--border-color)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">This quiz has no questions.</div>
                  )}
                </>
              ) : null}
            </div>

            <footer className="flex justify-end border-t border-[var(--border-color)] px-5 py-4 sm:px-7">
              <button type="button" onClick={closeQuizDetails} className="rounded-xl border border-[var(--border-color)] px-4 py-2.5 text-sm font-semibold transition hover:bg-[var(--bg-secondary)]">
                Close
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
