import { useCallback, useEffect, useState } from "react";
import { Loader2, ShieldCheck, UserPlus, UserRoundMinus, Users } from "lucide-react";
import { useAuth } from "../../../app/contexts/AuthContext";

function roleLabel(role) {
  return role === "super_admin" ? "Super admin" : role === "researcher" ? "Researcher" : "Host";
}

export default function AdminDashboard() {
  const { authFetch } = useAuth();
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyUserId, setBusyUserId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadUsers = useCallback(async () => {
    setError("");
    const response = await authFetch("/api/admin/users");
    if (!response.success) throw new Error(response.message || "Unable to load users");
    setUsers(response.data || []);
  }, [authFetch]);

  useEffect(() => {
    let active = true;
    authFetch("/api/admin/users")
      .then((response) => {
        if (!response.success) throw new Error(response.message || "Unable to load users");
        if (active) setUsers(response.data || []);
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

  const addResearcher = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await authFetch("/api/admin/researchers", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      if (!response.success) throw new Error(response.message || "Unable to grant researcher access");
      await loadUsers();
      setEmail("");
      setNotice(`Researcher access granted to ${response.data.email}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeResearcher = async (user) => {
    if (!window.confirm(`Remove researcher access from ${user.email}? Their account will remain active as a host.`)) {
      return;
    }

    setBusyUserId(user.id);
    setError("");
    setNotice("");
    try {
      const response = await authFetch(`/api/admin/researchers/${encodeURIComponent(user.id)}`, {
        method: "DELETE"
      });
      if (!response.success) throw new Error(response.message || "Unable to remove researcher access");
      setUsers((currentUsers) => currentUsers.map((currentUser) =>
        currentUser.id === user.id ? response.data : currentUser
      ));
      setNotice(`Researcher access removed from ${user.email}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyUserId("");
    }
  };

  return (
    <main className="min-h-screen bg-[#060a0f] px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-300">
              <ShieldCheck size={15} />
              System administration
            </p>
            <h1 className="text-3xl font-extrabold sm:text-4xl">Super admin dashboard</h1>
            <p className="mt-2 text-sm text-slate-400">
              Manage platform users and researcher access. All quizzes are available from the Quizzes page.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-800 bg-[#0d131c] px-4 py-3 text-sm text-slate-300">
            <Users size={17} className="text-indigo-300" />
            {users.length} accounts
          </div>
        </header>

        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {notice}
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-[#0d131c]/90 p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold">Grant researcher access</h2>
            <p className="mt-1 text-sm text-slate-400">
              The researcher must register for a KuizRoom account before access can be granted.
            </p>
          </div>
          <form onSubmit={addResearcher} className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="researcher-email" className="sr-only">Researcher email address</label>
            <input
              id="researcher-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="researcher@example.com"
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400"
            />
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} />}
              Add researcher
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0d131c]/90">
          <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-bold">User accounts</h2>
            <p className="mt-1 text-sm text-slate-400">Researcher access can be removed without deleting the user's account.</p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-400" role="status">
              <Loader2 size={18} className="animate-spin" />
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-400">No user accounts found.</p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {users.map((user) => (
                <li key={user.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{user.username || "Unnamed user"}</p>
                    <p className="truncate text-sm text-slate-400">{user.email || "No email address"}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      user.role === "super_admin"
                        ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
                        : user.role === "researcher"
                          ? "border-indigo-400/30 bg-indigo-400/10 text-indigo-200"
                          : "border-slate-700 bg-slate-800 text-slate-300"
                    }`}>
                      {roleLabel(user.role)}
                    </span>
                    {user.role === "researcher" && (
                      <button
                        type="button"
                        onClick={() => removeResearcher(user)}
                        disabled={busyUserId === user.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/10 disabled:opacity-60"
                        aria-label={`Remove researcher access for ${user.email}`}
                      >
                        {busyUserId === user.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <UserRoundMinus size={14} />}
                        Remove access
                      </button>
                    )}
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
