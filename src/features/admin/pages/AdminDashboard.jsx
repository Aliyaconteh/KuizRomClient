import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Activity, BookOpen, Clock3, Loader2, Radio, RefreshCw, StopCircle, Users } from "lucide-react";
import { useAuth } from "../../../app/contexts/AuthContext";

const cardClass = "rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]";

const statCards = [
  { key: "users", label: "Registered users", icon: Users },
  { key: "quizzes", label: "Quizzes", icon: BookOpen },
  { key: "activeRooms", label: "Active rooms", icon: Radio },
  { key: "waitingRooms", label: "Waiting rooms", icon: Clock3 },
  { key: "finishedRooms", label: "Finished rooms", icon: Clock3 },
  { key: "synchronizationEvents", label: "Sync events", icon: Activity }
];

function formatDate(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
}

export default function AdminDashboard() {
  const { authFetch } = useAuth();
  const [overview, setOverview] = useState(null);
  const [activeRooms, setActiveRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [terminatingCode, setTerminatingCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refreshDashboard = useCallback(async (showInitialLoading = false) => {
    if (showInitialLoading) setLoading(true);
    else setRefreshing(true);
    setError("");

    try {
      const [overviewResponse, roomsResponse] = await Promise.all([
        authFetch("/api/admin/overview"),
        authFetch("/api/admin/rooms/active")
      ]);
      if (!overviewResponse.success) throw new Error(overviewResponse.message || "Unable to load system statistics");
      if (!roomsResponse.success) throw new Error(roomsResponse.message || "Unable to load active rooms");
      setOverview(overviewResponse.data);
      setActiveRooms(roomsResponse.data || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authFetch]);

  const stopRoom = async (room) => {
    const roomName = room.room_name || `Room ${room.room_code}`;
    if (!window.confirm(`Stop "${roomName}" now? Current scores will be saved, players can view the results, and the host will be told that an administrator stopped the quiz.`)) return;

    setTerminatingCode(room.room_code);
    setError("");
    setNotice("");
    try {
      const response = await authFetch(`/api/admin/rooms/${encodeURIComponent(room.room_code)}/terminate`, { method: "POST" });
      if (!response.success) throw new Error(response.message || "Unable to stop this room");
      setNotice(`${roomName} was stopped. The saved results are available to the host and players.`);
      await refreshDashboard();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setTerminatingCode("");
    }
  };

  useEffect(() => {
    refreshDashboard(true);
    const timer = window.setInterval(() => refreshDashboard(), 30000);
    return () => window.clearInterval(timer);
  }, [refreshDashboard]);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-8 text-[var(--text-primary)] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">Admin dashboard</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">System health snapshot and administration workspaces.</p>
          </div>
          <button
            type="button"
            onClick={() => refreshDashboard()}
            disabled={refreshing}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold transition hover:border-indigo-400 disabled:opacity-60 sm:w-auto"
          >
            {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh
          </button>
        </header>

        {error && <div role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>}
        {notice && <div role="status" className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

        <section className="mt-8 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-6" aria-label="System statistics">
          {statCards.map(({ key, label, icon: Icon }) => (
            <div key={key} className={`${cardClass} p-3 sm:p-4`}>
              <div className="flex items-center gap-2 text-[11px] font-semibold leading-4 text-[var(--text-muted)] sm:text-xs">
                <Icon size={15} className="text-indigo-400" aria-hidden="true" /> {label}
              </div>
              <p className="mt-2 text-xl font-extrabold sm:mt-3 sm:text-2xl">
                {loading ? <Loader2 size={20} className="animate-spin" aria-label="Loading" /> : overview?.[key] ?? 0}
              </p>
            </div>
          ))}
        </section>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Link
            to="/admin/users"
            className={`${cardClass} group p-6 transition hover:border-indigo-400`}
          >
            <Users size={24} className="text-indigo-400" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold">Users</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Search for users by Gmail, review account details, and manage access.
            </p>
          </Link>
          <Link
            to="/admin/quizzes"
            className={`${cardClass} group p-6 transition hover:border-indigo-400`}
          >
            <BookOpen size={24} className="text-indigo-400" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold">Quizzes</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Browse platform quizzes and identify the Gmail address of each host.
            </p>
          </Link>
        </div>

        <section className={`${cardClass} mt-8 overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-color)] px-5 py-4">
            <div>
              <h2 className="text-lg font-bold">Active rooms</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Automatically refreshed every 30 seconds.</p>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
              {activeRooms.length} active
            </span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-[var(--text-muted)]" role="status">
              <Loader2 size={17} className="animate-spin" /> Loading active rooms...
            </div>
          ) : activeRooms.length === 0 ? (
            <p className="p-8 text-center text-sm text-[var(--text-muted)]">There are no active rooms right now.</p>
          ) : (
            <ul className="divide-y divide-[var(--border-color)]">
              {activeRooms.map((room) => (
                <li key={room.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">{room.room_name || `Room ${room.room_code}`}</p>
                    <p className="mt-1 break-all text-xs text-[var(--text-muted)]">
                      Code: {room.room_code} · Host: {room.host_name} ({room.host_email || "email unavailable"})
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                      <span>{room.player_count} players</span>
                      <span>{room.sync_mode || "server"} sync</span>
                      <span>{Number(room.delay_ms || 0)} ms delay</span>
                      <span>{formatDate(room.created_at)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => stopRoom(room)}
                    disabled={Boolean(terminatingCode)}
                    className="inline-flex min-h-[44px] w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/30 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:self-center"
                    aria-label={`Stop active room ${room.room_code}`}
                  >
                    {terminatingCode === room.room_code
                      ? <Loader2 size={15} className="animate-spin" />
                      : <StopCircle size={15} />}
                    {terminatingCode === room.room_code ? "Stopping..." : "Stop room"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link
          to="/admin/synchronization"
          className={`${cardClass} mt-5 flex items-center gap-4 p-5 transition hover:border-indigo-400`}
        >
          <Activity size={22} className="text-indigo-400" aria-hidden="true" />
          <div>
            <h2 className="font-bold">Synchronization logs and reports</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Inspect recent event records or open the full analysis and export tools.</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
