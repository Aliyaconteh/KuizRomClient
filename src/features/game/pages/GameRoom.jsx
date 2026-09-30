import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, Flag, Zap, Server, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { socket } from "../../../services/socket/socket";
import ScoreBoard from "../../../components/game/ScoreBoard";
import { useGame } from "../../../context/GameContext";
import { useToast } from "../../../components/ui/ToastContext";
import { useRoom } from "../../../context/RoomContext";
import { useAuth } from "../../../context/AuthContext";

const LETTERS = ["A", "B", "C", "D"];

const getClientTimestamp = () => Date.now();

export default function GameRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const {
    leaderboard,
    setLeaderboard,
    currentQuestion,
    setCurrentQuestion,
    timeRemaining,
    setTimeRemaining,
    totalQuestions,
    setTotalQuestions,
    questionsAnswered,
    setQuestionsAnswered,
    setSyncModel,
    metrics,
    setMetrics,
    setClientPredictedScore,
    setServerScore
  } = useGame();
  const { room } = useRoom();
  const { user } = useAuth();

  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answerStatus, setAnswerStatus] = useState("idle");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);
  const [leaderboardPhase, setLeaderboardPhase] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [reconciliationAlert, setReconciliationAlert] = useState(null);
  const [roomSyncMode, setRoomSyncMode] = useState("optimistic");
  const [roomDelayMs, setRoomDelayMs] = useState(0);
  const [reconciliationCount, setReconciliationCount] = useState(0);
  const clientTimestampRef = useRef(null);
  const { addToast } = useToast();

  const username = useMemo(() => localStorage.getItem("username") || "Guest", []);
  const playerId = useMemo(() => localStorage.getItem("playerId") || socket.id, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.emit("game:join", { roomCode, username, playerId });

    const handleQuestion = (data) => {
      setLeaderboardPhase(false);
      setCurrentQuestion(data.question);
      setQuestionNumber(data.questionNumber || 1);
      setTotalQuestions(data.totalQuestions || 0);
      setSelectedAnswer("");
      setAnswerStatus("idle");
      setError("");
      setReconciliationAlert(null);
      setQuestionKey((k) => k + 1);

      if (data.syncMode) {
        setRoomSyncMode(data.syncMode);
        setSyncModel(data.syncMode);
      }
      if (data.delayMs !== undefined) {
        setRoomDelayMs(Number(data.delayMs));
      }
    };

    const handleTimer = (data) => setTimeRemaining(data.time);
    const handleLeaderboard = (data) => setLeaderboard(data.players || data.leaderboard || []);
    const handleAnswerResult = (data) => {
      if (data && data.revealedCorrectAnswer) {
        // Option to display revealed correct answer if broadcasted
      }
    };
    const handleQuestionEnded = (data) => { 
      setLeaderboard(data.leaderboard || []); 
      setLeaderboardPhase(true); 
    };

    const handleConfirmed = (data) => {
      setAnswerStatus("submitted");
      const latency = Date.now() - clientTimestampRef.current;
      setMetrics((prev) => ({
        ...prev,
        perceivedLatency: latency,
        serverLatency: latency,
        scoreMismatch: data.reconciliationRequired || false
      }));

      if (data.serverScore !== undefined) {
        setServerScore(data.serverScore);
      }

      if (data.reconciliationRequired) {
        setReconciliationCount((c) => c + 1);
        setReconciliationAlert({
          message: `Score reconciled with server authoritative state (diff: ${data.scoreDifference > 0 ? "+" : ""}${data.scoreDifference} pts)`,
          type: "warning"
        });
      }

      setQuestionsAnswered((count) => count + 1);
    };

    const handleReconciled = (data) => {
      setReconciliationCount((c) => c + 1);
      setReconciliationAlert({
        message: `Optimistic reconciliation: predicted ${data.predictedScore} pts, confirmed ${data.serverScore} pts.`,
        type: "info"
      });
    };

    const handleRejected = (data) => {
      setAnswerStatus("rejected");
      setError(data.reason || "Answer could not be submitted.");
    };

    const handleFinished = (data) => {
      setLeaderboard(data.leaderboard || data.scores || []);
      navigate(`/results/${roomCode}`);
    };

    const handleError = (data) => {
      const msg = data.message || "Something went wrong in the game room.";
      setError(msg);
      addToast(msg, { type: "error" });
      setAnswerStatus("idle");
    };

    socket.on("game:question", handleQuestion);
    socket.on("game:timer", handleTimer);
    socket.on("game:leaderboard", handleLeaderboard);
    socket.on("leaderboardUpdated", handleLeaderboard);
    socket.on("answerResult", handleAnswerResult);
    socket.on("questionEnded", handleQuestionEnded);
    socket.on("leaderboard-update", handleLeaderboard);
    socket.on("answer_confirmed", handleConfirmed);
    socket.on("score_reconciled", handleReconciled);
    socket.on("sync-reconciliation", handleReconciled);
    socket.on("submission_rejected", handleRejected);
    socket.on("game:finished", handleFinished);
    socket.on("error", handleError);

    return () => {
      socket.off("game:question", handleQuestion);
      socket.off("game:timer", handleTimer);
      socket.off("game:leaderboard", handleLeaderboard);
      socket.off("leaderboardUpdated", handleLeaderboard);
      socket.off("answerResult", handleAnswerResult);
      socket.off("questionEnded", handleQuestionEnded);
      socket.off("leaderboard-update", handleLeaderboard);
      socket.off("answer_confirmed", handleConfirmed);
      socket.off("score_reconciled", handleReconciled);
      socket.off("sync-reconciliation", handleReconciled);
      socket.off("submission_rejected", handleRejected);
      socket.off("game:finished", handleFinished);
      socket.off("error", handleError);
    };
  }, [navigate, playerId, roomCode, setCurrentQuestion, setLeaderboard, setQuestionsAnswered, setTimeRemaining, setTotalQuestions, username, addToast, setMetrics, setServerScore, setSyncModel]);

  const submitAnswer = (answer) => {
    if (!currentQuestion || answerStatus === "pending" || Number(timeRemaining || 0) <= 0) return;

    clientTimestampRef.current = getClientTimestamp();
    const isOptimistic = roomSyncMode.toLowerCase().includes("optimistic");

    // Compute optimistic score prediction
    const timeLimit = currentQuestion.timeLimit || 15;
    const remainingRatio = Math.max(0, timeRemaining / timeLimit);
    const predictedPoints = Math.round(1000 * remainingRatio);

    const currentPlayerScore = Number(
      leaderboard.find((p) => p.username === username || p.id === playerId)?.score || 0
    );
    const predictedTotalScore = currentPlayerScore + predictedPoints;

    setSelectedAnswer(answer);
    setAnswerStatus("pending");

    if (isOptimistic) {
      setClientPredictedScore(predictedTotalScore);
      // Optimistically update local leaderboard display immediately
      setLeaderboard((prev) =>
        prev.map((p) =>
          p.username === username || p.id === playerId
            ? { ...p, score: predictedTotalScore }
            : p
        )
      );
    }

    socket.emit("game:answer", {
      roomCode,
      questionId: currentQuestion.id,
      selectedOption: answer,
      username,
      playerId,
      clientTimestamp: clientTimestampRef.current,
      clientPredictedScore: isOptimistic ? predictedTotalScore : 0,
      syncModel: isOptimistic ? "optimistic" : "server"
    });
  };

  const timerValue = Math.max(0, timeRemaining || 0);
  const timerColor = timerValue > 5 ? "text-[var(--brand-primary)]" : "text-red-400";
  const timerBg = timerValue > 5 ? "bg-[color:rgba(247,166,43,0.1)] border-[color:rgba(247,166,43,0.3)]" : "bg-red-500/10 border-red-500/30";
  const progressPct = totalQuestions > 0 ? (questionNumber / totalQuestions) * 100 : 0;

  const isOptimistic = roomSyncMode.toLowerCase().includes("optimistic");
  const isHost = Boolean(user?.id && room?.hostId && user.id === room.hostId);

  return (
    <div
      className={`min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] px-4 py-6 md:px-10 relative overflow-hidden transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-6 relative">
        {/* Research Sync & Telemetry HUD */}
        <div className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg p-4 shadow-xl">
          <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setShowTelemetry(!showTelemetry)}>
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${isOptimistic ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-[color:rgba(27,95,156,0.18)] text-[var(--brand-accent-2)] border border-[color:rgba(27,95,156,0.35)]"}`}>
                {isOptimistic ? <Zap size={16} /> : <Server size={16} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sync Architecture:</span>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${isOptimistic ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-[color:rgba(27,95,156,0.2)] text-[var(--brand-accent-2)] border border-[color:rgba(27,95,156,0.35)]"}`}>
                    {isOptimistic ? "Optimistic (Client-Predicted)" : "Server-Authoritative"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-400">
                <span>Latency: <strong className="text-white">{metrics?.perceivedLatency ? `${metrics.perceivedLatency}ms` : (isOptimistic ? "~10ms" : "~120ms")}</strong></span>
                <span>Simulated Delay: <strong className="text-sky-400">{roomDelayMs}ms</strong></span>
                <span>Reconciliations: <strong className="text-amber-400">{reconciliationCount}</strong></span>
              </div>
              <button type="button" className="text-slate-400 hover:text-white transition">
                {showTelemetry ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>

          {showTelemetry && (
            <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Perceived Latency</p>
                <p className="text-lg font-black text-sky-400">{metrics?.perceivedLatency !== null && metrics?.perceivedLatency !== undefined ? `${metrics.perceivedLatency}ms` : "--"}</p>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Network Simulation</p>
                <p className="text-lg font-black text-amber-400">{roomDelayMs}ms</p>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Reconciliations</p>
                <p className="text-lg font-black text-violet-400">{reconciliationCount}</p>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Status</p>
                <p className={`text-sm font-black mt-1 ${isOptimistic ? "text-emerald-400" : "text-indigo-400"}`}>
                  {isOptimistic ? "Fast Predicted" : "Authoritative"}
                </p>
              </div>
            </div>
          )}
        </div>

        {reconciliationAlert && (
          <div className="bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-2xl px-4 py-3 flex items-center gap-3 text-sm animate-pulse">
            <RefreshCw size={18} className="shrink-0" />
            <span>{reconciliationAlert.message}</span>
          </div>
        )}

        <main className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg p-5 md:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Room {roomCode}</p>
              <h1 className="text-3xl font-extrabold mt-1">Live Quiz</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-lg bg-[var(--app-surface-2)] border border-[var(--app-border)]">
                <span className="text-slate-400 text-sm">Question </span>
                <span className="font-bold">{questionNumber || 0}/{totalQuestions || 0}</span>
              </div>
              <div className={`px-4 py-2 rounded-xl font-black flex items-center gap-1.5 border ${timerBg}`}>
                <Clock size={14} className={timerColor} />
                <span className={timerColor}>{timerValue}s</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {totalQuestions > 0 && (
            <div className="mb-6">
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {leaderboardPhase ? (
            <div className="py-12">
              <ScoreBoard players={leaderboard || []} />
            </div>
          ) : currentQuestion ? (
            <div key={questionKey} style={{ animation: "slideUp 0.4s ease both" }}>
              <div className="mb-8">
                <p className="text-slate-500 text-sm mb-2 font-medium">Answered: {questionsAnswered}</p>
                <h2 className="text-2xl md:text-4xl font-extrabold leading-tight">
                  {currentQuestion.text}
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isDisabled = Number(timeRemaining || 0) <= 0 || ["pending", "submitted"].includes(answerStatus);
                  const showCorrect = false;
                  const showWrong = false;

                  let optionStyle = "bg-[var(--app-surface-2)] border-[var(--app-border)] hover:border-[var(--brand-secondary)] hover:bg-[var(--bg-card-hover)]";
                  if (isSelected && answerStatus === "pending") optionStyle = "bg-[color:rgba(247,166,43,0.1)] border-[var(--brand-primary)]";
                  if (showCorrect) optionStyle = "bg-emerald-500/15 border-emerald-500/50";
                  if (showWrong) optionStyle = "bg-red-500/15 border-red-500/50";

                  return (
                    <button
                      key={option}
                      onClick={() => submitAnswer(option)}
                      disabled={isDisabled}
                      className={`text-left rounded-lg border px-5 py-4 transition-all duration-200 font-semibold flex items-center gap-3 ${optionStyle} disabled:cursor-not-allowed disabled:opacity-80`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        showCorrect ? "bg-emerald-500/20 text-emerald-400" :
                        showWrong ? "bg-red-500/20 text-red-400" :
                        isSelected ? "bg-[color:rgba(247,166,43,0.2)] text-[var(--brand-primary)]" :
                        "bg-[var(--app-bg)] text-[var(--text-muted)]"
                      }`}>
                        {LETTERS[idx]}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {isHost && (
                <div className="flex flex-wrap gap-3 mt-8">
                  <button
                    onClick={() => socket.emit("quiz-end", { roomCode })}
                    className="px-5 py-3 rounded-lg bg-[var(--brand-secondary)] hover:bg-[#2476b7] text-white font-bold flex items-center gap-2 transition-all duration-200"
                  >
                    <Flag size={14} />
                    Finish Quiz
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-lg bg-[color:rgba(247,166,43,0.1)] border border-[color:rgba(247,166,43,0.2)] flex items-center justify-center mx-auto mb-5 animate-float">
                <Clock size={28} className="text-[var(--brand-primary)]" />
              </div>
              <p className="text-slate-300 font-semibold text-lg">Waiting for the first question...</p>
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-bounce" style={{ animationDelay: "0s" }} />
                <span className="w-2 h-2 rounded-full bg-[var(--brand-secondary)] animate-bounce" style={{ animationDelay: "0.2s" }} />
                <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}



