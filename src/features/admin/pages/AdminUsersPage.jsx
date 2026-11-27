import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  CircleUserRound,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  UserRoundMinus,
  Users,
  X,
  BookOpen
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

export default function AdminUsersPage() {
  const { authFetch, user: signedInUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedAccountDetails, setSelectedAccountDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [userForm, setUserForm] = useState({ username: "", email: "", password: "" });
  const [researcherEmail, setResearcherEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingResearcher, setSavingResearcher] = useState(false);
  const [busyUserId, setBusyUserId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadUsers = useCallback(async () => {
    const response = await authFetch("/api/admin/users");
    if (!response.success) throw new Error(response.message || "Unable to load user accounts");
    setUsers(response.data || []);
  }, [authFetch]);

  useEffect(() => {
    let active = true;
    loadUsers()
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadUsers]);

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
      await loadUsers();
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
      await loadUsers();
      setResearcherEmail("");
      setNotice(`Researcher access granted to ${response.data.email}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingResearcher(false);
    }
  };

  const removeResearcher = async (account) => {
    if (!window.confirm(`Remove researcher access from ${account.email}? The account will remain active as a host.`)) return;
    setBusyUserId(account.id);
    setError("");
    setNotice("");
    try {
      const response = await authFetch(`/api/admin/researchers/${encodeURIComponent(account.id)}`, { method: "DELETE" });
      if (!response.success) throw new Error(response.message || "Unable to remove researcher access");
      setUsers((current) => current.map((user) => user.id === account.id ? response.data : user));
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
      setUsers((current) => current.map((user) => user.id === account.id ? response.data : user));
      setNotice(`${account.email} has been ${nextSuspended ? "suspended" : "reactivated"}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyUserId("");
    }
  };

  const deleteUser = async (account) => {
    if (!window.confirm(`Delete ${account.email}'s account? This cannot be undone.`)) return;
    setBusyUserId(account.id);
    setError("");
    setNotice("");
    try {
      const response = await authFetch(`/api/admin/users/${encodeURIComponent(account.id)}`, { method: "DELETE" });
      if (!response.success) throw new Error(response.message || "Unable to delete user account");
      setUsers((current) => current.filter((user) => user.id !== account.id));
      if (selectedUserId === account.id) setSelectedUserId("");
      setNotice(`Account ${account.email} was deleted.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyUserId("");
    }
  };

  const openAccountDetails = async (account) => {
    setSelectedUserId(account.id);
    setSelectedAccountDetails(null);
    setDetailsError("");
    setDetailsLoading(true);

    try {
      const response = await authFetch(`/api/admin/users/${encodeURIComponent(account.id)}`);
      if (!response.success) throw new Error(response.message || "Unable to load user details");
      setSelectedAccountDetails(response.data);
    } catch (requestError) {
      setDetailsError(requestError.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeAccountDetails = () => {
    setSelectedUserId("");
    setSelectedAccountDetails(null);
    setDetailsError("");
  };

  useEffect(() => {
    if (!selectedUserId) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedUserId("");
        setSelectedAccountDetails(null);
        setDetailsError("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedUserId]);

  const normalizedSearch = userSearch.trim().toLowerCase();
  const filteredUsers = users.filter((account) => (account.email || "").toLowerCase().includes(normalizedSearch));

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-8 text-[var(--text-primary)] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-400">
              <ShieldCheck size={15} /> Admin · Users
            </p>
            <h1 className="text-3xl font-extrabold sm:text-4xl">User management</h1>
            <p className={`mt-2 text-sm ${mutedClass}`}>Search by Gmail to review and manage user accounts.</p>
          </div>
          <div className={`${cardClass} inline-flex items-center gap-2 px-4 py-3 text-sm`}>
            <Users size={17} className="text-indigo-400" /> {users.length} accounts
          </div>
        </header>

        {error && <div role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>}
        {notice && <div role="status" className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <section className={`${cardClass} p-5 sm:p-6`}>
            <h2 className="text-lg font-bold">Create host account</h2>
            <p className={`mt-1 text-sm ${mutedClass}`}>Create a verified account and securely share its initial password.</p>
            <form onSubmit={addUser} className="mt-4 grid gap-3">
              <label className="sr-only" htmlFor="new-user-name">User name</label>
              <input id="new-user-name" required maxLength={32} value={userForm.username} onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))} placeholder="Full name" autoComplete="name" className="rounded-xl border border-[var(--border-color)] bg-[var(--app-input-bg)] px-4 py-3 text-sm outline-none focus:border-indigo-400" />
              <label className="sr-only" htmlFor="new-user-email">User email</label>
              <input id="new-user-email" required type="email" maxLength={254} value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email address" autoComplete="email" className="rounded-xl border border-[var(--border-color)] bg-[var(--app-input-bg)] px-4 py-3 text-sm outline-none focus:border-indigo-400" />
              <label className="sr-only" htmlFor="new-user-password">Initial password</label>
              <input id="new-user-password" required type="password" minLength={8} maxLength={72} value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} placeholder="Initial password (at least 8 characters)" autoComplete="new-password" className="rounded-xl border border-[var(--border-color)] bg-[var(--app-input-bg)] px-4 py-3 text-sm outline-none focus:border-indigo-400" />
              <button type="submit" disabled={savingUser} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:opacity-60">
                {savingUser ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} />} Create host account
              </button>
            </form>
          </section>
          <section className={`${cardClass} p-5 sm:p-6`}>
            <h2 className="text-lg font-bold">Grant researcher access</h2>
            <p className={`mt-1 text-sm ${mutedClass}`}>The researcher must already have a KuizRoom account.</p>
            <form onSubmit={addResearcher} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="researcher-email" className="sr-only">Researcher email address</label>
              <input id="researcher-email" type="email" autoComplete="email" required value={researcherEmail} onChange={(event) => setResearcherEmail(event.target.value)} placeholder="researcher@example.com" className="min-w-0 flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--app-input-bg)] px-4 py-3 text-sm outline-none focus:border-indigo-400" />
              <button type="submit" disabled={savingResearcher} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:opacity-60">
                {savingResearcher ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} />} Add researcher
              </button>
            </form>
          </section>
        </div>

        <section className={`${cardClass} overflow-hidden`}>
          <div className="border-b border-[var(--border-color)] px-5 py-4 sm:px-6">
            <h2 className="text-lg font-bold">User accounts</h2>
            <p className={`mt-1 text-sm ${mutedClass}`}>Search using a full or partial Gmail address.</p>
            <label htmlFor="admin-user-search" className="sr-only">Search users by Gmail</label>
            <div className="relative mt-4 max-w-xl">
              <Search size={17} aria-hidden="true" className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${mutedClass}`} />
              <input id="admin-user-search" type="search" autoComplete="email" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search users by Gmail address" className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--app-input-bg)] py-3 pl-10 pr-4 text-sm outline-none focus:border-[var(--brand-primary)]" />
            </div>
          </div>
          {loading ? (
            <div className={`flex items-center justify-center gap-2 p-10 text-sm ${mutedClass}`} role="status"><Loader2 size={18} className="animate-spin" /> Loading accounts...</div>
          ) : filteredUsers.length === 0 ? (
            <p className={`p-8 text-center text-sm ${mutedClass}`}>{users.length === 0 ? "No user accounts found." : "No users match that Gmail address."}</p>
          ) : (
            <ul className="divide-y divide-[var(--border-color)]">
              {filteredUsers.map((account) => {
                const isProtected = account.role === "super_admin" || account.id === signedInUser?.id;
                return (
                  <li key={account.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate font-semibold">{account.username || "Unnamed user"}</p>
                        <span className="shrink-0 rounded-full border border-[var(--brand-primary)] bg-[var(--brand-primary)] px-3 py-1 text-xs font-bold text-[var(--app-bg)]">
                          {roleLabel(account.role)}
                        </span>
                      </div>
                      <p className={`mt-1 flex items-center gap-1.5 truncate text-sm ${mutedClass}`}><Mail size={14} aria-hidden="true" />{account.email || "No email address"}</p>
                      <p className={`mt-1 text-xs ${mutedClass}`}>Joined {formatDate(account.created_at)}</p>
                      <button type="button" onClick={() => openAccountDetails(account)} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-secondary)] underline-offset-2 transition hover:text-[var(--brand-primary)] hover:underline">
                        <CircleUserRound size={14} aria-hidden="true" /> View account details
                      </button>
                    </div>
                    {(!isProtected || account.is_suspended) && (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                      {account.is_suspended && (
                        <span className="w-fit rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-xs font-semibold text-red-500">
                          Suspended
                        </span>
                      )}
                      {!isProtected && (
                        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex">
                          {account.role === "researcher" && (
                            <button type="button" onClick={() => removeResearcher(account)} disabled={busyUserId === account.id} className="col-span-2 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-amber-500/30 px-3 py-2 text-xs font-semibold text-amber-600 transition hover:bg-amber-500/10 disabled:opacity-60 sm:col-span-1 sm:w-auto">
                              {busyUserId === account.id ? <Loader2 size={14} className="animate-spin" /> : <UserRoundMinus size={14} />} Remove research role
                            </button>
                          )}
                          <button type="button" onClick={() => toggleSuspension(account)} disabled={busyUserId === account.id} className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[var(--border-color)] px-3 py-2 text-xs font-semibold transition hover:bg-[var(--bg-secondary)] disabled:opacity-60 sm:w-auto">
                            {busyUserId === account.id ? <Loader2 size={14} className="animate-spin" /> : account.is_suspended ? <UserCheck size={14} /> : <UserRoundMinus size={14} />} {account.is_suspended ? "Reactivate" : "Suspend"}
                          </button>
                          <button type="button" onClick={() => deleteUser(account)} disabled={busyUserId === account.id} aria-label={`Delete account for ${account.email}`} className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-500/10 disabled:opacity-60 sm:w-auto">
                            {busyUserId === account.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
                          </button>
                        </div>
                      )}
                    </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {selectedUserId && (
        <div
          className="admin-account-dialog-backdrop fixed inset-0 z-[60] flex items-center justify-center p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAccountDetails();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-account-dialog-title"
            className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--border-color)] border-t-2 border-t-[var(--brand-primary)] bg-[var(--bg-card)] shadow-2xl shadow-black/30"
          >
            <header className="flex items-start justify-between gap-4 border-b border-[var(--border-color)] px-5 py-5 sm:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-secondary)] text-[var(--brand-primary)]">
                  <CircleUserRound size={22} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-primary)]">Account profile</p>
                  <h2 id="admin-account-dialog-title" className="mt-1 truncate text-xl font-extrabold">
                    {selectedAccountDetails?.username || "User details"}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={closeAccountDetails}
                aria-label="Close account details"
                className="rounded-xl border border-[var(--border-color)] p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
              >
                <X size={18} />
              </button>
            </header>

            <div className="admin-account-dialog-content min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              {detailsLoading ? (
                <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-[var(--text-muted)]" role="status">
                  <Loader2 size={20} className="animate-spin text-indigo-500" /> Loading account and quiz details...
                </div>
              ) : detailsError ? (
                <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">{detailsError}</div>
              ) : selectedAccountDetails ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className={`${cardClass} p-4`}>
                      <p className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>Gmail address</p>
                      <p className="mt-2 break-all font-semibold">{selectedAccountDetails.email || "Unavailable"}</p>
                    </div>
                    <div className={`${cardClass} p-4`}>
                      <p className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>Account role</p>
                      <p className="mt-2 font-semibold">{roleLabel(selectedAccountDetails.role)}</p>
                    </div>
                    <div className={`${cardClass} p-4`}>
                      <p className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>Account status</p>
                      <p className={`mt-2 inline-flex items-center gap-2 font-semibold ${selectedAccountDetails.is_suspended ? "text-red-500" : "text-emerald-600"}`}>
                        <CheckCircle size={16} aria-hidden="true" />
                        {selectedAccountDetails.is_suspended ? "Suspended" : "Active"}
                      </p>
                    </div>
                    <div className={`${cardClass} p-4`}>
                      <p className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>Email verification</p>
                      <p className="mt-2 font-semibold">{selectedAccountDetails.email_verified ? "Verified" : "Not verified"}</p>
                    </div>
                    <div className={`${cardClass} p-4`}>
                      <p className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>Password sign-in</p>
                      <p className="mt-2 font-semibold">{selectedAccountDetails.has_password ? "Enabled" : "Google sign-in only"}</p>
                    </div>
                    <div className={`${cardClass} p-4`}>
                      <p className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>Joined KuizRoom</p>
                      <p className="mt-2 font-semibold">{formatDate(selectedAccountDetails.created_at)}</p>
                    </div>
                  </div>

                  <section className="mt-7">
                    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold">Quizzes created</h3>
                        <p className={`mt-1 text-sm ${mutedClass}`}>All quizzes associated with this account.</p>
                      </div>
                      <span className="rounded-full border border-[var(--brand-primary)] bg-[var(--brand-primary)] px-3 py-1 text-xs font-bold text-[var(--app-bg)]">
                        {selectedAccountDetails.quizzes?.length || 0} total
                      </span>
                    </div>
                    {selectedAccountDetails.quizzes?.length ? (
                      <ul className="space-y-3">
                        {selectedAccountDetails.quizzes.map((quiz) => (
                          <li key={quiz.id} className={`${cardClass} p-4`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="break-words font-bold">{quiz.title}</h4>
                                {quiz.description && <p className={`mt-1 whitespace-pre-wrap text-sm ${mutedClass}`}>{quiz.description}</p>}
                              </div>
                              <span className="shrink-0 rounded-full bg-[var(--brand-secondary)] px-2.5 py-1 text-xs font-semibold text-white">
                                {quiz.question_count} {quiz.question_count === 1 ? "question" : "questions"}
                              </span>
                            </div>
                            <p className={`mt-3 text-xs ${mutedClass}`}>Created {formatDate(quiz.created_at)}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className={`${cardClass} px-4 py-8 text-center`}>
                        <BookOpen size={22} className="mx-auto text-[var(--text-muted)]" aria-hidden="true" />
                        <p className="mt-2 text-sm font-semibold">No quizzes created</p>
                        <p className={`mt-1 text-xs ${mutedClass}`}>This account does not own any quizzes yet.</p>
                      </div>
                    )}
                  </section>
                </>
              ) : null}
            </div>

            <footer className="flex justify-end border-t border-[var(--border-color)] px-5 py-4 sm:px-7">
              <button type="button" onClick={closeAccountDetails} className="rounded-xl bg-[var(--brand-secondary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary)] hover:text-[var(--app-bg)]">
                Close
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
