import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Loader2,
  Mail,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  UserRoundMinus,
  Users
} from "lucide-react";
import { useAuth } from "../../../app/contexts/AuthContext";

function roleLabel(role) {
  if (role === "super_admin") return "Super admin";
  if (role === "researcher") return "Researcher";
  if (role === "player") return "Player";
  return "Host";
}

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString();
}

const cardClass = "rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]";
const mutedClass = "text-[var(--text-muted)]";

export default function AdminDashboard() {
  const { authFetch, user: signedInUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [userForm, setUserForm] = useState({ username: "", email: "", password: "" });
  const [researcherEmail, setResearcherEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingResearcher, setSavingResearcher] = useState(false);
  const [busyUserId, setBusyUserId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDashboard = useCallback(async () => {
    const [usersResponse, quizzesResponse] = await Promise.all([
      authFetch("/api/admin/users"),
      authFetch("/api/admin/quizzes")
    ]);

    if (!usersResponse.success) {
      throw new Error(usersResponse.message || "Unable to load user accounts");
    }
    if (!quizzesResponse.success) {
      throw new Error(quizzesResponse.message || "Unable to load quizzes");
    }

    setUsers(usersResponse.data || []);
    setQuizzes(quizzesResponse.data || []);
  }, [authFetch]);

  useEffect(() => {
    let active = true;
    loadDashboard()
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadDashboard]);

  const addUser = async (event) => {
    event.preventDefault();
    setSavingUser(true);
    setError("");
    setNotice("");

    try {
      const response = await authFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(userForm)
      });
      if (!response.success) throw new Error(response.message || "Unable to create user account");
      await loadDashboard();
      setUserForm({ username: "", email: "", password: "" });
      setNotice(`Host account created for ${response.data.email}. Share the initial password securely.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingUser(false);
    }
  };

  const addResearcher = async (event) => {
    event.preventDefault();
    setSavingResearcher(true);
    setError("");
    setNotice("");

    try {
      const response = await authFetch("/api/admin/researchers", {
        method: "POST",
        body: JSON.stringify({ email: researcherEmail })
      });
      if (!response.success) throw new Error(response.message || "Unable to grant researcher access");
      await loadDashboard();
      setResearcherEmail("");
      setNotice(`Researcher access granted to ${response.data.email}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingResearcher(false);
    }
  };

  const removeResearcher = async (account) => {
    if (!window.confirm(`Remove researcher access from ${account.email}? The account will remain active as a host.`)) {
      return;
    }

    setBusyUserId(account.id);
    setError("");
    setNotice("");
    try {
      const response = await authFetch(`/api/admin/researchers/${encodeURIComponent(account.id)}`, {
        method: "DELETE"
      });
      if (!response.success) throw new Error(response.message || "Unable to remove researcher access");
      setUsers((currentUsers) => currentUsers.map((currentUser) =>
        currentUser.id === account.id ? response.data : currentUser
      ));
      setNotice(`Researcher access removed from ${account.email}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyUserId("");
    }
  };

  const toggleSuspension = async (account) => {
    const nextSuspended = !account.is_suspended;
    const action = nextSuspended ? "suspend" : "reactivate";
    if (!window.confirm(`${action[0].toUpperCase()}${action.slice(1)} ${account.email}?`)) return;

    setBusyUserId(account.id);
    setError("");
    setNotice("");
    try {
      const response = await authFetch(`/api/admin/users/${encodeURIComponent(account.id)}/suspension`, {
        method: "PATCH",
        body: JSON.stringify({ is_suspended: nextSuspended })
      });
      if (!response.success) throw new Error(response.message || `Unable to ${action} account`);
      setUsers((currentUsers) => currentUsers.map((currentUser) =>
        currentUser.id === account.id ? response.data : currentUser
      ));
      setNotice(`${account.email} has been ${nextSuspended ? "suspended" : "reactivated"}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyUserId("");
    }
  };

  const deleteUser = async (account) => {
    if (!window.confirm(
      `Delete ${account.email}'s account? Their quizzes will be kept and will continue to show this username as owner.`
    )) return;

    setBusyUserId(account.id);
    setError("");
    setNotice("");
    try {
      const response = await authFetch(`/api/admin/users/${encodeURIComponent(account.id)}`, {
        method: "DELETE"
      });
      if (!response.success) throw new Error(response.message || "Unable to delete user account");
      setUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== account.id));
      setNotice(`Account ${account.email} was deleted.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyUserId("");
    }
  };

  const adminAccount = users.find((account) => account.id === signedInUser?.id);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-8 text-[var(--text-primary)] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-400">
              <ShieldCheck size={15} />
              System administration
            </p>
            <h1 className="text-3xl font-extrabold sm:text-4xl">Super admin dashboard</h1>
            <p className={`mt-2 text-sm ${mutedClass}`}>
              Manage accounts, review platform quizzes, and identify each quiz owner.
            </p>
          </div>
          <div className={`${cardClass} inline-flex w-fit items-center gap-2 px-4 py-3 text-sm`}>
            <Users size={17} className="text-indigo-400" />
            {users.length} accounts
          </div>
        </header>

        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        )}

        <section className={`${cardClass} mb-8 p-5 sm:p-6`}>
          <h2 className="mb-4 text-lg font-bold">Administrator account</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>Name</p>
              <p className="mt-1 font-semibold">{adminAccount?.username || signedInUser?.username || "Super admin"}</p>
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>Email</p>
              <p className="mt-1 break-all font-semibold">{adminAccount?.email || signedInUser?.email || "Unavailable"}</p>
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>Account created</p>
              <p className="mt-1 inline-flex items-center gap-2 font-semibold">
                <CalendarDays size={15} aria-hidden="true" />
                {formatDate(adminAccount?.created_at)}
              </p>
            </div>
          </div>
        </section>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <section className={`${cardClass} p-5 sm:p-6`}>
            <div className="mb-4">
              <h2 className="text-lg font-bold">Create host account</h2>
              <p className={`mt-1 text-sm ${mutedClass}`}>
                Create a verified account and securely share its initial password with the user.
              </p>
            </div>
            <form onSubmit={addUser} className="grid gap-3">
              <label className="sr-only" htmlFor="new-user-name">User name</label>
              <input
                id="new-user-name"
                required
                maxLength={32}
                value={userForm.username}
                onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="Full name"
                autoComplete="name"
                className="min-w-0 rounded-xl border border-[var(--border-color)] bg-[var(--app-input-bg)] px-4 py-3 text-sm outline-none focus:border-indigo-400"
              />
              <label className="sr-only" htmlFor="new-user-email">User email</label>
              <input
                id="new-user-email"
                required
                type="email"
                maxLength={254}
                value={userForm.email}
                onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="Email address"
                autoComplete="email"
                className="min-w-0 rounded-xl border border-[var(--border-color)] bg-[var(--app-input-bg)] px-4 py-3 text-sm outline-none focus:border-indigo-400"
              />
              <label className="sr-only" htmlFor="new-user-password">Initial password</label>
              <input
                id="new-user-password"
                required
                type="password"
                minLength={8}
                maxLength={72}
                value={userForm.password}
                onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Initial password (at least 8 characters)"
                autoComplete="new-password"
                className="min-w-0 rounded-xl border border-[var(--border-color)] bg-[var(--app-input-bg)] px-4 py-3 text-sm outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                disabled={savingUser}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingUser ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} />}
                Create host account
              </button>
            </form>
          </section>

          <section className={`${cardClass} p-5 sm:p-6`}>
            <div className="mb-4">
              <h2 className="text-lg font-bold">Grant researcher access</h2>
              <p className={`mt-1 text-sm ${mutedClass}`}>
                The researcher must already have a KuizRoom account.
              </p>
            </div>
            <form onSubmit={addResearcher} className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="researcher-email" className="sr-only">Researcher email address</label>
              <input
                id="researcher-email"
                type="email"
                autoComplete="email"
                required
                value={researcherEmail}
                onChange={(event) => setResearcherEmail(event.target.value)}
                placeholder="researcher@example.com"
                className="min-w-0 flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--app-input-bg)] px-4 py-3 text-sm outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                disabled={savingResearcher}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingResearcher ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} />}
                Add researcher
              </button>
            </form>
          </section>
        </div>

        <section className={`${cardClass} mb-8 overflow-hidden`}>
          <div className="border-b border-[var(--border-color)] px-5 py-4 sm:px-6">
            <h2 className="text-lg font-bold">User accounts</h2>
            <p className={`mt-1 text-sm ${mutedClass}`}>
              Review account details, suspend access, or delete an account.
            </p>
          </div>
          {loading ? (
            <div className={`flex items-center justify-center gap-2 p-10 text-sm ${mutedClass}`} role="status">
              <Loader2 size={18} className="animate-spin" />
              Loading accounts...
            </div>
          ) : users.length === 0 ? (
            <p className={`p-8 text-center text-sm ${mutedClass}`}>No user accounts found.</p>
          ) : (
            <ul className="divide-y divide-[var(--border-color)]">
              {users.map((account) => {
                const isProtected = account.role === "super_admin" || account.id === signedInUser?.id;
                return (
                  <li key={account.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{account.username || "Unnamed user"}</p>
                      <p className={`mt-1 flex items-center gap-1.5 truncate text-sm ${mutedClass}`}>
                        <Mail size={14} aria-hidden="true" />
                        {account.email || "No email address"}
                      </p>
                      <p className={`mt-1 text-xs ${mutedClass}`}>Joined {formatDate(account.created_at)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span className="rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-xs font-semibold text-indigo-500">
                        {roleLabel(account.role)}
                      </span>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        account.is_suspended
                          ? "border-red-400/30 bg-red-400/10 text-red-500"
                          : "border-emerald-400/30 bg-emerald-400/10 text-emerald-600"
                      }`}>
                        {account.is_suspended ? "Suspended" : "Active"}
                      </span>
                      {!isProtected && account.role === "researcher" && (
                        <button
                          type="button"
                          onClick={() => removeResearcher(account)}
                          disabled={busyUserId === account.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 px-3 py-2 text-xs font-semibold text-amber-600 transition hover:bg-amber-500/10 disabled:opacity-60"
                        >
                          {busyUserId === account.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <UserRoundMinus size={14} />}
                          Remove research role
                        </button>
                      )}
                      {!isProtected && (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleSuspension(account)}
                            disabled={busyUserId === account.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] px-3 py-2 text-xs font-semibold transition hover:bg-[var(--bg-secondary)] disabled:opacity-60"
                          >
                            {busyUserId === account.id
                              ? <Loader2 size={14} className="animate-spin" />
                              : account.is_suspended ? <UserCheck size={14} /> : <UserRoundMinus size={14} />}
                            {account.is_suspended ? "Reactivate" : "Suspend"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteUser(account)}
                            disabled={busyUserId === account.id}
                            aria-label={`Delete account for ${account.email}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-500/10 disabled:opacity-60"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={`${cardClass} overflow-hidden`}>
          <div className="border-b border-[var(--border-color)] px-5 py-4 sm:px-6">
            <h2 className="inline-flex items-center gap-2 text-lg font-bold">
              <BookOpen size={19} aria-hidden="true" />
              All quizzes
            </h2>
            <p className={`mt-1 text-sm ${mutedClass}`}>Quiz owners remain visible even after their account is deleted.</p>
          </div>
          {loading ? (
            <div className={`flex items-center justify-center gap-2 p-10 text-sm ${mutedClass}`} role="status">
              <Loader2 size={18} className="animate-spin" />
              Loading quizzes...
            </div>
          ) : quizzes.length === 0 ? (
            <p className={`p-8 text-center text-sm ${mutedClass}`}>No quizzes found.</p>
          ) : (
            <ul className="divide-y divide-[var(--border-color)]">
              {quizzes.map((quiz) => (
                <li key={quiz.id} className="flex flex-col gap-2 px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold">{quiz.title}</p>
                      {quiz.description && <p className={`mt-1 text-sm ${mutedClass}`}>{quiz.description}</p>}
                    </div>
                    <span className={`shrink-0 text-xs ${mutedClass}`}>
                      {quiz.question_count} {quiz.question_count === 1 ? "question" : "questions"}
                    </span>
                  </div>
                  <div className={`flex flex-wrap gap-x-5 gap-y-1 text-xs ${mutedClass}`}>
                    <span>Owner: <strong className="font-semibold text-[var(--text-primary)]">{quiz.owner_name}</strong></span>
                    {quiz.owner_email && <span>{quiz.owner_email}</span>}
                    <span>Created {formatDate(quiz.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
