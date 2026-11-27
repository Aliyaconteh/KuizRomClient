import { useEffect, useMemo, useState } from "react";
import { Activity, Loader2, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../app/contexts/AuthContext";

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
}

export default function AdminSynchronizationPage() {
  const { authFetch } = useAuth();
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    authFetch("/api/admin/synchronization-logs?limit=200")
      .then((response) => {
        if (!response.success) throw new Error(response.message || "Unable to load synchronization logs");
        if (active) setLogs(response.data || []);
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

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return logs;
    return logs.filter((log) =>
      [log.room_code, log.room_name, log.sync_mode, log.event_type]
        .some((value) => value?.toLowerCase().includes(query))
    );
  }, [logs, search]);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-8 text-[var(--text-primary)] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-400">
              <ShieldCheck size={15} /> Admin · Synchronization
            </p>
            <h1 className="text-3xl font-extrabold sm:text-4xl">Synchronization logs</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Inspect the latest 200 synchronization events across all rooms.</p>
          </div>
          <Link to="/sync-analysis" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-500">
            <Activity size={16} /> Reports and exports
          </Link>
        </header>

        {error && <div role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>}

        <section className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
          <div className="flex flex-col gap-3 border-b border-[var(--border-color)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-bold">Recent events <span className="font-normal text-[var(--text-muted)]">({filteredLogs.length})</span></h2>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Newest records appear first.</p>
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <span className="sr-only">Filter logs by room, mode, or event</span>
              <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter by room, mode, or event" className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--app-input-bg)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400" />
            </label>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-[var(--text-muted)]" role="status"><Loader2 size={18} className="animate-spin" /> Loading synchronization logs...</div>
          ) : filteredLogs.length === 0 ? (
            <p className="p-8 text-center text-sm text-[var(--text-muted)]">{logs.length ? "No logs match your filter." : "No synchronization logs found."}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-[var(--bg-secondary)] text-xs uppercase text-[var(--text-muted)]">
                  <tr>
                    <th scope="col" className="px-4 py-3">Time</th>
                    <th scope="col" className="px-4 py-3">Room</th>
                    <th scope="col" className="px-4 py-3">Mode / event</th>
                    <th scope="col" className="px-4 py-3">Delay</th>
                    <th scope="col" className="px-4 py-3">Latency</th>
                    <th scope="col" className="px-4 py-3">Scores</th>
                    <th scope="col" className="px-4 py-3">Reconciled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="align-top">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--text-muted)]">{formatDate(log.created_at)}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{log.room_code}</p>
                        {log.room_name && <p className="mt-1 text-xs text-[var(--text-muted)]">{log.room_name}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{log.sync_mode || "Unknown"}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{log.event_type || "Unknown event"}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">{Number(log.artificial_delay_ms || 0)} ms</td>
                      <td className="whitespace-nowrap px-4 py-3">{log.latency == null ? "—" : `${log.latency} ms`}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--text-muted)]">
                        Predicted: {log.predicted_score ?? "—"}<br />
                        Server: {log.server_score ?? "—"}<br />
                        Difference: {log.score_difference ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        {log.reconciliation_required
                          ? <span className="font-semibold text-amber-600">Yes</span>
                          : <span className="text-emerald-600">No</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
