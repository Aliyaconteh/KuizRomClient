import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Check, ChevronDown, Copy, Link2, LogIn, PlusCircle, Wifi, WifiOff } from "lucide-react";
import { socket } from "../../../services/socket/socket";
import { useRoom } from "../../../context/RoomContext";
import { useToast } from "../../../components/ui/ToastContext";
import Skeleton from "../../../components/ui/Skeleton";
import { useAuth } from "../../../context/AuthContext";

// ── dot-grid SVG background (matches JoinRoom) ───────────────────────────────
function BackgroundGrid() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none">
      <defs>
        <pattern id="cr-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="#6366f1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cr-dots)" />
    </svg>
  );
}

// ── copy button with transient ✓ feedback ─────────────────────────────────────
function CopyButton({ text, label, variant = "secondary" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const base = "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200";
  const styles = {
    primary: "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(99,102,241,0.4)]",
    secondary: "bg-[#0f1520] border border-slate-700/50 text-slate-300 hover:border-indigo-500/40 hover:text-white hover:bg-indigo-500/[0.07]",
  };

  return (
    <button onClick={handleCopy} className={`${base} ${styles[variant]}`} >
      {copied ? <Check size={15} className="text-emerald-400" /> : variant === "primary" ? <Copy size={15} /> : <Link2 size={15} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

// ── Custom dark-themed quiz dropdown ──────────────────────────────────────────
function QuizSelect({ quizzes, value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = quizzes.find(q => q.id === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={`w-full bg-[#0f1720] border-[1.5px] rounded-xl px-4 py-3 outline-none transition-all duration-150 cursor-pointer flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed ${
          open ? "border-indigo-500 bg-indigo-500/[0.05] ring-2 ring-indigo-500/10" : "border-slate-700/50"
        }`}
      >
        <span className={selected ? "text-slate-100 truncate pr-2" : "text-slate-600 truncate pr-2"}>
          {selected ? selected.title : "Select a quiz"}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && quizzes.length > 0 && (
        <div className="absolute z-30 left-0 right-0 mt-1.5 bg-[#0f1720] border border-slate-700/60 rounded-xl shadow-xl shadow-black/50 overflow-hidden max-h-60 overflow-y-auto animate-fade-in">
          {quizzes.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                onChange(q.id);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-100 ${
                value === q.id
                  ? "bg-indigo-500/15 text-indigo-300 font-semibold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {q.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
export default function CreateRoom() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedQuizId = searchParams.get("quizId");
  const { setRoom }    = useRoom();
  const { addToast }   = useToast();
  const { authFetch, user, isAuthenticated, loading: authLoading } = useAuth();

  const [roomName,       setRoomName]       = useState("");
  const [quizId,         setQuizId]         = useState("");
  const [quizzes,        setQuizzes]        = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [connected,      setConnected]      = useState(socket.connected);
  const [roomCreated,    setRoomCreated]    = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState("");
  const [mounted,        setMounted]        = useState(false);
  const [syncMode,       setSyncMode]       = useState("server");
  const [delayLevel,     setDelayLevel]     = useState("low");
  const [customDelayMs,  setCustomDelayMs]  = useState(200);

  const joinUrl = createdRoomCode
    ? `${window.location.origin}/join-room?roomCode=${encodeURIComponent(createdRoomCode)}`
    : "";

  // entrance animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  // auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(`/signin?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isAuthenticated, authLoading, navigate]);

  // load quizzes
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    authFetch("/api/quizzes")
      .then(response => {
        const arr = response?.data || response || [];
        setQuizzes(arr);
        if (arr.length > 0) {
          const requested = arr.find(q => q.id === requestedQuizId);
          setQuizId(requested?.id || arr[0].id);
        }
        setLoadingQuizzes(false);
      })
      .catch(() => {
        const msg = "Failed to load quizzes. Create a quiz first, then come back.";
        setError(msg);
        addToast(msg, { type: "error" });
        setLoadingQuizzes(false);
      });
  }, [requestedQuizId, authFetch, authLoading, isAuthenticated, addToast]);

  // socket connection status
  useEffect(() => {
    const onConnect    = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (!socket.connected) socket.connect();
    return () => { socket.off("connect", onConnect); socket.off("disconnect", onDisconnect); };
  }, []);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) { const m = "Room name is required"; setError(m); addToast(m, { type: "error" }); return; }
    if (!quizId)          { const m = "Select a quiz";         setError(m); addToast(m, { type: "error" }); return; }
    if (!connected)       { const m = "Not connected to server"; setError(m); addToast(m, { type: "error" }); return; }

    setLoading(true);
    setError("");
    const hostUsername = roomName.trim();
    localStorage.setItem("username", hostUsername);
    localStorage.setItem("playerId", user.id);

    try {
      const res = await authFetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostId: user.id, username: hostUsername, quizId,
          roomName: roomName.trim(),
          syncMode,
          delayLevel,
          delayMs: delayLevel === "custom" ? Number(customDelayMs) : null,
        }),
      });
      const result = res;

      if (result.success) {
        const room = result.data;
        const roomCode = room.room_code;
        setCreatedRoomCode(roomCode);
        setRoomCreated(true);
        socket.emit("join-room", { roomCode, player: { id: user.id, username: hostUsername } });
        setRoom({ id: room.id, code: roomCode, roomCode, name: roomName, roomName, quizId, isHost: true, hostId: user.id, syncMode: room.sync_mode, delayLevel: room.delay_level, delayMs: room.delay_ms });
      } else {
        const m = result.message || "Room creation failed";
        setError(m);
        addToast(m, { type: "error" });
      }
    } catch (err) {
      const m = "Network error: " + err.message;
      setError(m);
      addToast(m, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ── loading skeleton ────────────────────────────────────────────────────────
  if (loadingQuizzes) {
    return (
      <div className="min-h-screen bg-[#060a0f] flex items-center justify-center p-6">
        <div className="w-full max-w-[440px]">
              <Skeleton count={3} size="lg" />
        </div>
      </div>
    );
  }

  // ── success / share view ────────────────────────────────────────────────────
  if (roomCreated) {
    return (
      <>
        <style>{`
          
          @keyframes cr-pop { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
          @keyframes cr-shimmer { 0% { left:-60%; } 100% { left:160%; } }
          .cr-btn-shine { position: relative; overflow: hidden; }
          .cr-btn-shine::after {
            content: ''; position: absolute; inset-block: 0; left: -60%; width: 40%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.13), transparent);
            transform: skewX(-15deg); animation: cr-shimmer 2.8s infinite;
          }
        `}</style>
        <div className="min-h-screen bg-[#060a0f] flex items-center justify-center p-6 relative overflow-hidden" >
          <BackgroundGrid />
          {/* blobs */}
          <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] -top-40 -right-32 pointer-events-none" />
          <div className="absolute w-[360px] h-[360px] rounded-full bg-violet-500/10 blur-[80px] -bottom-20 -left-20 pointer-events-none" />

          <div className="relative w-full max-w-[420px] bg-[#0d131c]/90 border border-indigo-500/[0.15] rounded-3xl px-8 py-10 shadow-2xl"
               style={{ animation: "cr-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}>
            {/* top shimmer line */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent rounded-full" />

            {/* success badge */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <Check size={15} className="text-emerald-400" />
              </div>
              <span className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-emerald-400">
                Room Ready
              </span>
            </div>

            <h1 className="text-[1.85rem] font-extrabold text-slate-100 mb-1 leading-tight">
              Share &amp;{" "}
              <em className="not-italic bg-gradient-to-br from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Invite
              </em>
            </h1>
            <p className="text-sm text-slate-500 mb-7">Players can join using the code or QR scan</p>

            {/* room code display */}
            <div className="bg-[#0a0f1a] border border-indigo-500/20 rounded-2xl p-5 mb-4 text-center">
              <p className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-slate-600 mb-2">Room Code</p>
              <p className="text-4xl sm:text-5xl font-extrabold tracking-[0.18em] text-indigo-300">
                {createdRoomCode}
              </p>
            </div>

            {/* QR code */}
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-2xl shadow-[0_0_32px_rgba(99,102,241,0.15)]">
                <QRCodeCanvas value={joinUrl} size={160} level="H" includeMargin={false} className="w-36 h-36 sm:w-[180px] sm:h-[180px]" />
              </div>
            </div>

            <p className="text-center text-[0.75rem] text-slate-600 mb-5">
              Scan to open the join page with the code pre-filled
            </p>

            {/* copy actions */}
            <div className="flex flex-col gap-2.5 mb-5">
              <CopyButton text={createdRoomCode} label="Copy Room Code" variant="primary" />
              <CopyButton text={joinUrl} label="Copy Join Link" variant="secondary" />
            </div>

            {/* enter waiting room */}
            <button
              onClick={() => navigate(`/waiting-room/${createdRoomCode}`)}
              className="cr-btn-shine w-full py-3.5 rounded-2xl font-bold text-[0.9375rem] text-white bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.28)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(16,185,129,0.4)] active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
              
            >
              <LogIn size={16} />
              Enter Waiting Room
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── create form ─────────────────────────────────────────────────────────────
  const canSubmit = !loading && !!quizzes.length && !!roomName.trim();

  return (
    <>
      <style>{`
        
        @keyframes cr-shimmer { 0% { left:-60%; } 100% { left:160%; } }
        .cr-btn-shine { position: relative; overflow: hidden; }
        .cr-btn-shine::after {
          content: ''; position: absolute; inset-block: 0; left: -60%; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.13), transparent);
          transform: skewX(-15deg); animation: cr-shimmer 2.8s infinite;
        }
        /* custom select arrow */
        .cr-select { appearance: none; -webkit-appearance: none; }
      `}</style>

      <div
        className={`min-h-screen bg-[#060a0f] flex items-center justify-center p-6 relative overflow-hidden transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
        
      >
        <BackgroundGrid />
        {/* blobs */}
        <div className="absolute w-[520px] h-[520px] rounded-full bg-indigo-500/10 blur-[90px] -top-32 -right-36 pointer-events-none" />
        <div className="absolute w-[380px] h-[380px] rounded-full bg-violet-500/10 blur-[80px] -bottom-20 -left-16 pointer-events-none" />

        {/* card */}
        <div
          className={`relative w-full max-w-[440px] bg-[#0d131c]/90 border border-indigo-500/[0.14] rounded-3xl px-8 py-10 shadow-2xl transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
        >
          {/* top shimmer line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent rounded-full" />

          {/* badge row */}
          <div className="flex items-center justify-between mb-5">
            <div className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold tracking-[0.12em] uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1">
              <PlusCircle size={11} />
              New Room
            </div>
            {/* connection indicator */}
            <div className={`inline-flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.08em] uppercase rounded-full px-2.5 py-1 border ${connected ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
              {connected ? <Wifi size={10} /> : <WifiOff size={10} />}
              {connected ? "Live" : "Offline"}
            </div>
          </div>

          {/* heading */}
          <h1
            className="text-[2rem] font-extrabold text-slate-100 leading-tight mb-1.5"
            
          >
            Create a{" "}
            <em className="not-italic bg-gradient-to-br from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Room
            </em>
          </h1>
          <p className="text-sm text-slate-500 mb-8">Set up a quiz room and invite your players</p>

          {/* error banner */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-5">
            {/* room name */}
            <div>
              <div className="text-[0.68rem] font-semibold tracking-[0.08em] uppercase text-slate-500 mb-2">
                Room Name
              </div>
              <input
                type="text"
                placeholder="e.g. Friday Night Trivia"
                value={roomName}
                onChange={e => { setRoomName(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && canSubmit && handleCreateRoom()}
                maxLength={40}
                className="w-full bg-[#0f1720] border-[1.5px] border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 text-[0.9375rem] outline-none placeholder:text-slate-700 transition-all duration-150 focus:border-indigo-500 focus:bg-indigo-500/[0.05] focus:ring-2 focus:ring-indigo-500/10"
                
              />
            </div>

            {/* quiz selector */}
            <div>
              <div className="text-[0.68rem] font-semibold tracking-[0.08em] uppercase text-slate-500 mb-2">
                Quiz
              </div>
              <QuizSelect
                quizzes={quizzes}
                value={quizId}
                onChange={setQuizId}
                disabled={!quizzes.length}
              />

              {/* no quizzes empty state */}
              {!quizzes.length && (
                <div className="mt-3 bg-amber-500/[0.07] border border-amber-500/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-amber-400/80">You don't have any quizzes yet.</p>
                  <button
                    onClick={() => navigate("/quizzes/create")}
                    className="text-xs font-semibold text-amber-400 whitespace-nowrap hover:text-amber-300 transition-colors"
                  >
                    Create one →
                  </button>
                </div>
              )}
            </div>

            {/* research configuration */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[0.68rem] font-semibold tracking-[0.08em] uppercase text-slate-500 mb-2">
                  Sync Strategy
                </div>
                <select
                  value={syncMode}
                  onChange={(e) => setSyncMode(e.target.value)}
                  className="w-full bg-[#0f1720] border-[1.5px] border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 text-[0.9375rem] outline-none transition-all duration-150 focus:border-indigo-500 focus:bg-indigo-500/[0.05] focus:ring-2 focus:ring-indigo-500/10"
                >
                  <option value="server">Server-Authoritative</option>
                  <option value="optimistic">Optimistic</option>
                </select>
              </div>
              <div>
                <div className="text-[0.68rem] font-semibold tracking-[0.08em] uppercase text-slate-500 mb-2">
                  Network Delay
                </div>
                <select
                  value={delayLevel}
                  onChange={(e) => setDelayLevel(e.target.value)}
                  className="w-full bg-[#0f1720] border-[1.5px] border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 text-[0.9375rem] outline-none transition-all duration-150 focus:border-indigo-500 focus:bg-indigo-500/[0.05] focus:ring-2 focus:ring-indigo-500/10"
                >
                  <option value="low">0 ms</option>
                  <option value="medium">200 ms</option>
                  <option value="high">600 ms</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            {delayLevel === "custom" && (
              <div>
                <div className="text-[0.68rem] font-semibold tracking-[0.08em] uppercase text-slate-500 mb-2">
                  Custom Delay (ms)
                </div>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={customDelayMs}
                  onChange={(e) => setCustomDelayMs(e.target.value)}
                  className="w-full bg-[#0f1720] border-[1.5px] border-slate-700/50 rounded-xl px-4 py-3 text-slate-100 text-[0.9375rem] outline-none transition-all duration-150 focus:border-indigo-500 focus:bg-indigo-500/[0.05] focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
            )}

            {/* submit */}
            <button
              onClick={handleCreateRoom}
              disabled={!canSubmit}
              aria-busy={loading}
              className={[
                "cr-btn-shine w-full mt-1 py-3.5 rounded-2xl font-bold text-[0.9375rem] tracking-wide text-white",
                "bg-gradient-to-br from-indigo-600 to-violet-600",
                "shadow-[0_4px_20px_rgba(99,102,241,0.28),0_1px_3px_rgba(0,0,0,0.3)]",
                "transition-all duration-200",
                canSubmit
                  ? "hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(99,102,241,0.4)] active:translate-y-0 cursor-pointer"
                  : "opacity-40 cursor-not-allowed",
              ].join(" ")}
              
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating…
                </span>
              ) : (
                "Create Room →"
              )}
            </button>
          </div>

          {/* footer hint */}
          <div className="flex items-center gap-2.5 text-[0.7rem] tracking-wide text-slate-700 mt-6">
            <span className="flex-1 h-px bg-slate-800" />
            a QR code &amp; shareable link will be generated
            <span className="flex-1 h-px bg-slate-800" />
          </div>
        </div>
      </div>
    </>
  );
}
