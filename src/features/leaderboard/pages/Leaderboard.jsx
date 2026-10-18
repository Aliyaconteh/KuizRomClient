import { useState, useEffect } from "react";
import { Trophy, Search, Crown, Medal, Hash } from "lucide-react";
import { apiUrl } from "../../../shared/config/api";
import { useToast } from "../../../shared/components/ui/ToastContext";
import Skeleton from "../../../shared/components/ui/Skeleton";

const rankStyles = [
  { bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-500/20", icon: Crown },
  { bg: "bg-slate-400/15", border: "border-slate-400/30", text: "text-slate-300", badge: "bg-slate-400/20", icon: Medal },
  { bg: "bg-orange-600/15", border: "border-orange-600/30", text: "text-orange-400", badge: "bg-orange-600/20", icon: Medal },
];

const avatarGradients = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-cyan-600",
];

export default function Leaderboard() {
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const loadLeaderboard = async () => {
    if (!roomCode.trim()) {
      const msg = "Enter a room code.";
      setError(msg);
      addToast(msg, { type: "error" });
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(apiUrl(`/api/leaderboard/${roomCode.trim().toUpperCase()}`)).then((res) => res.json());
      if (!response.success) throw new Error(response.message || "Leaderboard not found");
      setPlayers(response.data || []);
    } catch (err) {
      setError(err.message);
      addToast(err.message, { type: "error" });
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#060a0f] text-white px-4 py-10 relative overflow-hidden transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
      
    >
      {/* Ambient blobs */}
      <div className="absolute w-[520px] h-[520px] rounded-full bg-indigo-500/6 blur-[90px] -top-32 -right-36 pointer-events-none" />
      <div className="absolute w-[380px] h-[380px] rounded-full bg-violet-500/6 blur-[80px] -bottom-20 -left-16 pointer-events-none" />

      <div className="max-w-3xl mx-auto relative">
        {/* Header */}
        <div className="mb-8">
         
          <h1
            className="text-4xl font-extrabold mt-1"
          >
            Room Leaderboard
          </h1>
        </div>

        {/* Search card */}
        <div className="bg-[#0d131c]/80 border border-slate-800 rounded-2xl p-6 mb-6">
          <label className="text-[0.68rem] font-semibold tracking-[0.08em] uppercase text-slate-500 mb-2 block">Room Code</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && loadLeaderboard()}
                className="w-full bg-[#0f1720] border-[1.5px] border-slate-700/50 rounded-xl pl-9 pr-4 py-3 outline-none uppercase tracking-wider font-mono focus:border-indigo-500 focus:bg-indigo-500/[0.05] focus:ring-2 focus:ring-indigo-500/10 placeholder:text-slate-700 transition-all duration-150"
                placeholder="ABC123"
                
              />
            </div>
            <button
              onClick={loadLeaderboard}
              disabled={loading}
              className="btn-shimmer rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-3 font-bold shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search size={16} />
              )}
              {loading ? "Loading..." : "Load"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Results */}
        <div className="bg-[#0d131c]/80 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-2xl font-extrabold mb-5 flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            Players
          </h2>
          <div className="space-y-3">
            {loading ? (
              <Skeleton count={4} variant="row" size="sm" />
            ) : players.length ? (
              players.map((player, index) => {
                const rank = rankStyles[index];
                return (
                  <div
                    key={player.id || player.player_id}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-all duration-300 hover:-translate-y-0.5 ${
                      rank
                        ? `${rank.bg} ${rank.border}`
                        : "bg-slate-800/40 border-slate-700/50 hover:border-slate-600"
                    }`}
                    style={{ animation: "staggerFade 0.4s ease both", animationDelay: `${index * 0.06}s` }}
                  >
                    <div className="flex items-center gap-3">
                      {rank ? (
                        <div className={`w-7 h-7 rounded-lg ${rank.badge} flex items-center justify-center`}>
                          <rank.icon size={14} className={rank.text} />
                        </div>
                      ) : (
                        <span className="w-7 h-7 rounded-lg bg-slate-800/60 flex items-center justify-center text-xs font-bold text-slate-500">
                          {index + 1}
                        </span>
                      )}
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} flex items-center justify-center font-bold text-xs text-white`}>
                        {(player.username || "P").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-100">{player.username || player.player_id || "Player"}</span>
                    </div>
                    <span className={`font-black text-lg ${rank ? rank.text : "text-emerald-400"}`}>
                      {Number(player.score || 0)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-slate-600" />
                </div>
                <p className="text-slate-500 font-medium">Enter a room code to view scores</p>
                <p className="text-slate-600 text-sm mt-1">Results will appear here after a game session</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
