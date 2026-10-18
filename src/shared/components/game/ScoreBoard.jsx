import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { ArrowDown, ArrowUp, Flame, Minus, Sparkles, Trophy } from "lucide-react";

const rankStyles = [
  { bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-400", label: "1st" },
  { bg: "bg-slate-400/15", border: "border-slate-400/30", text: "text-slate-300", label: "2nd" },
  { bg: "bg-orange-600/15", border: "border-orange-600/30", text: "text-orange-400", label: "3rd" },
];

function AnimatedScore({ score }) {
  const prefersReducedMotion = useReducedMotion();
  const scoreValue = useMotionValue(Number(score || 0));
  const displayedScore = useTransform(scoreValue, (value) => Math.round(value).toLocaleString());

  useEffect(() => {
    const controls = animate(scoreValue, Number(score || 0), {
      duration: prefersReducedMotion ? 0 : 0.8,
      ease: "easeOut"
    });
    return controls.stop;
  }, [prefersReducedMotion, score, scoreValue]);

  return <motion.span>{displayedScore}</motion.span>;
}

export default function ScoreBoard({
  players,
  rankChanges = {},
  currentPlayerName,
  questionNumber,
  leaderChange,
  previousPlayers = []
}) {
  const prefersReducedMotion = useReducedMotion();
  const [displayPlayers, setDisplayPlayers] = useState(
    previousPlayers.length ? previousPlayers : players || []
  );

  useEffect(() => {
    if (prefersReducedMotion || !previousPlayers.length) {
      setDisplayPlayers(players || []);
      return undefined;
    }

    const frame = requestAnimationFrame(() => setDisplayPlayers(players || []));
    return () => cancelAnimationFrame(frame);
  }, [players, prefersReducedMotion, previousPlayers]);

  const sorted = [...displayPlayers].sort((a, b) => {
    const rankDifference = Number(a.rank || 0) - Number(b.rank || 0);
    if (a.rank && b.rank && rankDifference !== 0) return rankDifference;
    return Number(b.score || 0) - Number(a.score || 0);
  });
  const currentPlayerChange = sorted
    .filter((player) => player.username === currentPlayerName)
    .map((player) => rankChanges[player.id || player.playerId || player.username])
    .find((change) => change?.movement > 0);

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Trophy size={18} className="text-amber-400" />
        <div>
          <h2 className="text-xl font-extrabold">Live Leaderboard</h2>
          {questionNumber > 0 && (
            <p className="text-xs text-slate-400 mt-1">
              After question {questionNumber} · cumulative scores
            </p>
          )}
        </div>
      </div>

      {leaderChange && (
        <div
          aria-live="polite"
          className="mb-4 flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-200"
        >
          <Flame size={17} className="shrink-0 text-orange-400" />
          <span>{leaderChange.username} takes the lead!</span>
        </div>
      )}

      {currentPlayerChange && (
        <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-300">
          You moved up {currentPlayerChange.movement}{" "}
          {currentPlayerChange.movement === 1 ? "place" : "places"} this round!
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((player, index) => {
          const rank = rankStyles[index];
          const playerKey = player.id || player.playerId || player.username;
          const change = rankChanges[playerKey];
          const isCurrentPlayer = player.username === currentPlayerName;
          const isNewLeader = leaderChange?.id === playerKey;
          const movementIcon = change?.movement > 0
            ? ArrowUp
            : change?.movement < 0
              ? ArrowDown
              : Minus;
          const MovementIcon = movementIcon;
          return (
            <motion.div
              key={playerKey}
              layout="position"
              initial={false}
              animate={{
                opacity: 1,
                ...(isNewLeader
                  ? { backgroundColor: "rgba(245, 158, 11, 0.16)" }
                  : change?.movement > 0
                    ? { backgroundColor: "rgba(16, 185, 129, 0.11)" }
                    : change?.movement < 0
                      ? { backgroundColor: "rgba(244, 63, 94, 0.08)" }
                      : {})
              }}
              transition={prefersReducedMotion
                ? { duration: 0 }
                : {
                    layout: { type: "spring", stiffness: 360, damping: 32 },
                    backgroundColor: { duration: 0.45 },
                    opacity: { duration: 0.2 }
                  }}
              className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                rank
                  ? `${rank.bg} ${rank.border}`
                  : "bg-slate-800/60 border-slate-700/50"
              } ${isNewLeader ? "ring-1 ring-amber-300/50 shadow-[0_0_24px_rgba(245,158,11,0.18)]" : ""} ${
                change?.movement > 0 ? "border-emerald-400/50" : ""
              } ${change?.movement < 0 ? "border-rose-400/40" : ""}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                {rank ? (
                  <span className={`text-xs font-bold ${rank.text} w-6 text-center`}>{rank.label}</span>
                ) : (
                  <span className="text-xs font-bold text-slate-500 w-6 text-center">{index + 1}</span>
                )}
                <span className="min-w-0 truncate font-semibold text-slate-100">
                  {player.username || player.playerId || "Player"}
                </span>
                {isCurrentPlayer && (
                  <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-300">
                    You
                  </span>
                )}
                {isNewLeader && <Sparkles size={15} className="text-amber-300" aria-label="New leader" />}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {change && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${
                      change.movement > 0
                        ? "bg-emerald-500/15 text-emerald-300"
                        : change.movement < 0
                          ? "bg-rose-500/15 text-rose-300"
                          : "bg-slate-700/70 text-slate-300"
                    }`}
                    title={change.movement
                      ? `${change.movement > 0 ? "Moved up" : "Moved down"} ${Math.abs(change.movement)} ${Math.abs(change.movement) === 1 ? "place" : "places"} this round`
                      : "Rank unchanged this round"}
                  >
                    <MovementIcon size={13} />
                    {change.movement !== 0
                      ? `${change.movement > 0 ? "+" : "-"}${Math.abs(change.movement)}`
                      : "—"}
                    {change.scoreDelta > 0 && (
                      <span className="ml-1 text-[10px] opacity-80">+{change.scoreDelta} pts</span>
                    )}
                  </span>
                )}
                <span className={`font-black tabular-nums ${rank ? rank.text : "text-emerald-400"}`}>
                  <AnimatedScore score={player.score} />
                </span>
              </div>
            </motion.div>
          );
        })}

        {!sorted.length && (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500">Scores will appear after players join.</p>
          </div>
        )}
      </div>
    </div>
  );
}
