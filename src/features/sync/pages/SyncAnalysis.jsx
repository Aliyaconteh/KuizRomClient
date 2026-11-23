import { useEffect, useState, useCallback } from "react";
import { Server, Zap, Clock, RefreshCw, Activity, Download, BarChart2, CheckCircle, Search } from "lucide-react";
import { useAuth } from "../../../app/contexts/AuthContext";
import { useToast } from "../../../shared/components/ui/ToastContext";

const DELAY_BUCKETS = ["0ms", "50ms", "100ms", "200ms"];

export default function SyncAnalysis() {
  const { authFetch, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [roomFilter, setRoomFilter] = useState("");
  const [selectedRoomData, setSelectedRoomData] = useState(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { addToast } = useToast();
  const isResearcher = user?.role === "researcher" || user?.role === "super_admin";

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const overviewJson = await authFetch("/api/sync/overview");
      if (overviewJson.success && overviewJson.data) {
        setOverview(overviewJson.data);
      } else {
        throw new Error(overviewJson.message || "Unable to load synchronization analysis.");
      }
    } catch (err) {
      addToast(err.message || "Failed to load synchronization analysis.", { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [addToast, authFetch]);

  const handleSearchRoom = async (e) => {
    e?.preventDefault();
    if (!roomFilter.trim()) {
      setSelectedRoomData(null);
      return;
    }
    try {
      setRoomLoading(true);
      const json = await authFetch(`/api/sync/${roomFilter.trim().toUpperCase()}/summary`);
      if (json.success && json.data) {
        setSelectedRoomData(json.data);
        addToast(`Loaded empirical metrics for room ${roomFilter.trim().toUpperCase()}`, { type: "success" });
      } else {
        throw new Error(json.message || "No logs found for this room code.");
      }
    } catch (err) {
      addToast(err.message || "Failed to find room logs", { type: "error" });
    } finally {
      setRoomLoading(false);
    }
  };

  const handleExport = async (format = "csv") => {
    const code = roomFilter.trim().toUpperCase();
    const endpoint = code ? `/api/sync/export/${code}?format=${format}` : `/api/sync/export?format=${format}`;
    try {
      setExporting(true);
      const payload = await authFetch(endpoint);
      const content = format === "json" ? JSON.stringify(payload.data, null, 2) : payload;
      const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/csv" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `sync-analysis-${code || (isResearcher ? "all-games" : "my-games")}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      addToast("Synchronization records exported.", { type: "success" });
    } catch (err) {
      addToast(err.message || "Failed to export synchronization records.", { type: "error" });
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    fetchOverview();
    return () => clearTimeout(t);
  }, [fetchOverview]);

  const activeData = selectedRoomData || overview;
  const serverMetrics = activeData?.byMode?.server || { averageLatencyMs: null, reconciliations: 0, consistencyPct: null, count: 0 };
  const optMetrics = activeData?.byMode?.optimistic || { averageLatencyMs: null, reconciliations: 0, consistencyPct: null, count: 0 };
  const delayData = activeData?.byDelay || {};

  return (
    <div
      className={`min-h-screen bg-[#060a0f] text-white px-4 py-10 relative overflow-hidden transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
    >
      {/* Ambient blobs */}
      <div className="absolute w-[520px] h-[520px] rounded-full bg-indigo-500/6 blur-[90px] -top-32 -right-36 pointer-events-none" />
      <div className="absolute w-[380px] h-[380px] rounded-full bg-emerald-500/6 blur-[80px] -bottom-20 -left-16 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10" style={{ animation: "slideUp 0.5s ease both" }}>
          <div>
           
            <h1 className="text-3xl font-black tracking-tight text-white">
            Synchronization Analysis
            </h1>
            <p className="text-slate-400 mt-3 max-w-2xl text-sm leading-relaxed">
            {isResearcher
              ? "Inspect synchronization summaries and exported records across all games, comparing latency, score consistency, and reconciliation by strategy and delay condition."
              : "Inspect synchronization summaries and exported records for games you created, comparing latency, score consistency, and reconciliation by strategy and delay condition."}
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
            <button
              onClick={fetchOverview}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-700 sm:w-auto"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh Metrics
            </button>
            <button
              onClick={() => handleExport("csv")}
              disabled={exporting}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-600/20 px-4 py-2.5 text-xs font-bold text-indigo-300 transition hover:bg-indigo-600/30 sm:w-auto"
            >
              <Download size={14} />
              {exporting ? "Exporting..." : "Export CSV Dataset"}
            </button>
            <button
              onClick={() => handleExport("json")}
              disabled={exporting}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-600/20 px-4 py-2.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-600/30 sm:w-auto"
            >
              <Download size={14} />
              {exporting ? "Exporting..." : "Export JSON"}
            </button>
          </div>
        </div>

        {/* Room Filter Bar */}
        <div className="bg-[#0d131c]/80 border border-slate-800 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchRoom} className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                placeholder="Filter by room code..."
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={roomLoading}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs transition shrink-0"
            >
              {roomLoading ? "Loading..." : "Filter Room"}
            </button>
          </form>

          {selectedRoomData && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg font-medium">
                Showing Room: {roomFilter.toUpperCase()}
              </span>
              <button
                onClick={() => { setSelectedRoomData(null); setRoomFilter(""); }}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Clear Filter ({isResearcher ? "View All Games" : "View My Games"})
              </button>
            </div>
          )}
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0d131c]/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-2">
              <Activity size={14} className="text-sky-400" />
              Total Logged Events
            </div>
            <p className="text-3xl font-black text-white">{activeData?.totalEvents ?? "--"}</p>
            <p className="text-xs text-slate-500 mt-1">Empirical socket transmissions</p>
          </div>

          <div className="bg-[#0d131c]/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-2">
              <Clock size={14} className="text-indigo-400" />
              Avg Perceived Latency
            </div>
            <p className="text-3xl font-black text-indigo-400">{activeData?.totalEvents ? `${activeData.averageLatencyMs} ms` : "No data"}</p>
            <p className="text-xs text-slate-500 mt-1">Client interaction response time</p>
          </div>

          <div className="bg-[#0d131c]/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-2">
              <CheckCircle size={14} className="text-emerald-400" />
              Consistency Rate
            </div>
            <p className="text-3xl font-black text-emerald-400">{activeData?.totalEvents ? `${activeData.consistencyRatePct}%` : "No data"}</p>
            <p className="text-xs text-slate-500 mt-1">Score convergence between client & server</p>
          </div>

          <div className="bg-[#0d131c]/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-2">
              <RefreshCw size={14} className="text-amber-400" />
              Reconciliations
            </div>
            <p className="text-3xl font-black text-amber-400">{activeData?.totalEvents ? activeData.reconciliationCount : "No data"}</p>
            <p className="text-xs text-slate-500 mt-1">Optimistic predictions adjusted by server</p>
          </div>
        </div>

        {/* Strategy Comparison Cards */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          {/* Server-Authoritative */}
          <div className="bg-[#0d131c]/80 border border-slate-800 rounded-2xl p-4 sm:p-6 md:p-8 transition-all duration-300 hover:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 shrink-0 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Server size={22} className="text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-extrabold">Server-Authoritative</h2>
                  <span className="text-[0.65rem] sm:text-xs text-indigo-400 font-semibold uppercase tracking-wider">Strict Consistency</span>
                </div>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The server acts as the single source of truth. Every answer submission is validated server-side and points are calculated centrally before updating the client UI.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
              <div className="bg-slate-800/40 rounded-xl p-2.5 sm:p-3 text-center border border-slate-800">
                <p className="whitespace-nowrap text-base sm:text-lg font-black text-indigo-400">{serverMetrics.count ? `${serverMetrics.averageLatencyMs} ms` : "No data"}</p>
                <p className="text-[0.6rem] sm:text-[0.65rem] leading-tight text-slate-500 font-semibold uppercase tracking-wide mt-1">Avg Perceived Latency</p>
              </div>
              <div className="bg-slate-800/40 rounded-xl p-2.5 sm:p-3 text-center border border-slate-800">
                <p className="whitespace-nowrap text-base sm:text-lg font-black text-emerald-400">{serverMetrics.count ? serverMetrics.reconciliations : "No data"}</p>
                <p className="text-[0.6rem] sm:text-[0.65rem] leading-tight text-slate-500 font-semibold uppercase tracking-wide mt-1">Reconciliations</p>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-slate-800/40 rounded-xl p-2.5 sm:p-3 text-center border border-slate-800">
                <p className="whitespace-nowrap text-base sm:text-lg font-black text-emerald-400">{serverMetrics.count ? `${serverMetrics.consistencyPct}%` : "No data"}</p>
                <p className="text-[0.6rem] sm:text-[0.65rem] leading-tight text-slate-500 font-semibold uppercase tracking-wide mt-1">Consistency</p>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="rounded-lg bg-slate-800/30 p-3 text-xs text-slate-300 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <span>Predictive Rollback Risk</span>
                <span className="mt-1 block font-bold text-emerald-400 sm:mt-0 sm:text-right">{serverMetrics.count ? "No prediction rollback recorded" : "No data"}</span>
              </div>
              <div className="rounded-lg bg-slate-800/30 p-3 text-xs text-slate-300 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <span>Cheating Resistance</span>
                <span className="mt-1 block font-bold text-emerald-400 sm:mt-0 sm:text-right">Server validates submitted answers</span>
              </div>
              <div className="rounded-lg bg-slate-800/30 p-3 text-xs text-slate-300 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <span>Network Latency Impact</span>
                <span className="mt-1 block font-bold text-amber-400 sm:mt-0 sm:text-right">Directly perceived by player</span>
              </div>
            </div>
          </div>

          {/* Optimistic */}
          <div className="bg-[#0d131c]/80 border border-slate-800 rounded-2xl p-4 sm:p-6 md:p-8 transition-all duration-300 hover:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Zap size={22} className="text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-extrabold">Optimistic Updates</h2>
                  <span className="text-[0.65rem] sm:text-xs text-emerald-400 font-semibold uppercase tracking-wider">Client predicts before confirmation</span>
                </div>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The client predicts answer score immediately upon submission for fluid UI response, then reconciles asynchronously when the server broadcasts authoritative state.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
              <div className="bg-slate-800/40 rounded-xl p-2.5 sm:p-3 text-center border border-slate-800">
                <p className="whitespace-nowrap text-base sm:text-lg font-black text-emerald-400">{optMetrics.count ? `${optMetrics.averageLatencyMs} ms` : "No data"}</p>
                <p className="text-[0.6rem] sm:text-[0.65rem] leading-tight text-slate-500 font-semibold uppercase tracking-wide mt-1">Avg Perceived Latency</p>
              </div>
              <div className="bg-slate-800/40 rounded-xl p-2.5 sm:p-3 text-center border border-slate-800">
                <p className="whitespace-nowrap text-base sm:text-lg font-black text-amber-400">{optMetrics.count ? optMetrics.reconciliations : "No data"}</p>
                <p className="text-[0.6rem] sm:text-[0.65rem] leading-tight text-slate-500 font-semibold uppercase tracking-wide mt-1">Reconciliations</p>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-slate-800/40 rounded-xl p-2.5 sm:p-3 text-center border border-slate-800">
                <p className="whitespace-nowrap text-base sm:text-lg font-black text-sky-400">{optMetrics.count ? `${optMetrics.consistencyPct}%` : "No data"}</p>
                <p className="text-[0.6rem] sm:text-[0.65rem] leading-tight text-slate-500 font-semibold uppercase tracking-wide mt-1">Consistency</p>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="rounded-lg bg-slate-800/30 p-3 text-xs text-slate-300 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <span>UI Responsiveness</span>
                <span className="mt-1 block font-bold text-emerald-400 sm:mt-0 sm:text-right">Client updates before server confirmation</span>
              </div>
              <div className="rounded-lg bg-slate-800/30 p-3 text-xs text-slate-300 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <span>Reconciliation Overhead</span>
                <span className="mt-1 block font-bold text-amber-400 sm:mt-0 sm:text-right">Minimal (Event diff check)</span>
              </div>
              <div className="rounded-lg bg-slate-800/30 p-3 text-xs text-slate-300 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <span>Fault Tolerance on High Delay</span>
                <span className="mt-1 block font-bold text-emerald-400 sm:mt-0 sm:text-right">Smooth user experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Empirical Delay Benchmark Visualization */}
        <div className="bg-[#0d131c]/80 border border-slate-800 rounded-2xl p-4 sm:p-6 md:p-8 mb-10">
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
                <BarChart2 size={20} className="text-sky-400" />
                Latency Comparison by Simulated Delay
              </h2>
              <p className="text-slate-400 text-xs mt-1">Empirical response times across 0ms, 50ms, 100ms, and 200ms delay tiers.</p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-indigo-500" />
                <span className="text-slate-300">Server-Authoritative</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-300">Optimistic</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-5 sm:grid-cols-2">
            {DELAY_BUCKETS.map((tier) => {
              const data = delayData[tier] || { serverLatency: null, optimisticLatency: null, consistencyPct: null, sampleCount: 0 };
              const sLat = Number(data.serverLatency || 0);
              const oLat = Number(data.optimisticLatency || 0);
              const maxScale = 250;
              const sWidth = data.serverLatency === null ? 0 : Math.min(100, Math.max(5, (sLat / maxScale) * 100));
              const oWidth = data.optimisticLatency === null ? 0 : Math.min(100, Math.max(3, (oLat / maxScale) * 100));

              return (
                <div key={tier} className="min-w-0 bg-slate-900/60 rounded-xl p-3 sm:p-4 border border-slate-800/80">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-sm font-bold text-white">Delay: {tier}</span>
                    <span className="rounded-lg bg-slate-800/70 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                      {data.sampleCount == null ? "Samples unavailable" : data.sampleCount ? <>Consistency <strong className="ml-1 text-emerald-400">{data.consistencyPct}%</strong></> : "No observations"}
                    </span>
                  </div>

                  {/* Server Authoritative Bar */}
                  <div className="space-y-4">
                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-indigo-300">Server Model</span>
                        <span className="text-xs font-bold text-indigo-300">{data.serverLatency === null ? "--" : `${sLat} ms`}</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${sWidth}%` }}
                        />
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-indigo-500/10 bg-indigo-500/5 p-2.5 text-xs">
                          <p className="font-semibold text-indigo-300">Server-authoritative</p>
                          <p className="mt-1 text-slate-400">
                            Consistency: <strong className="text-emerald-300">{data.serverConsistencyPct == null ? "--" : `${data.serverConsistencyPct}%`}</strong>
                          </p>
                          <p className="mt-1 text-slate-400">
                            Reconciliations: <strong className="text-slate-200">{data.serverReconciliations ?? 0}</strong>
                          </p>
                        </div>
                        <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-2.5 text-xs">
                          <p className="font-semibold text-emerald-300">Optimistic</p>
                          <p className="mt-1 text-slate-400">
                            Consistency: <strong className="text-emerald-300">{data.optimisticConsistencyPct == null ? "--" : `${data.optimisticConsistencyPct}%`}</strong>
                          </p>
                          <p className="mt-1 text-slate-400">
                            Reconciliations: <strong className="text-slate-200">{data.optimisticReconciliations ?? 0}</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Optimistic Bar */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-emerald-300">Optimistic</span>
                        <span className="text-xs font-bold text-emerald-300">{data.optimisticLatency === null ? "--" : `${oLat} ms`}</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${oWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
