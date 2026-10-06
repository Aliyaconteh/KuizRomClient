import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Crown, Play, Wifi } from "lucide-react";
import { socket } from "../../../services/socket/socket";
import { useRoom } from "../../../context/RoomContext";
import { apiUrl } from "../../../config/api";
import { useToast } from "../../../components/ui/ToastContext";
import { useAuth } from "../../../context/AuthContext";

const avatarGradients = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-cyan-600",
];

function getAvatarGradient(index) {
  return avatarGradients[index % avatarGradients.length];
}

export default function WaitingRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { room, setRoom } = useRoom();

  const { addToast } = useToast();
  const { authFetch, user } = useAuth();
  const isRoomCreator = Boolean(user?.id && room?.hostId && user.id === room.hostId);

  const [loading, setLoading] = useState(!room || !room.players);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetch(apiUrl(`/api/rooms/${roomCode}`))
      .then((res) => {
        if (!res.ok) throw new Error("Room not found");
        return res.json();
      })
      .then((response) => {
        if (response.success) {
          const roomData = response.data.room;
          const dbPlayers = response.data.players || [];
          const mappedPlayers = dbPlayers.map((p) => ({
            id: p.id,
            userId: p.user_id,
            username: p.username,
            isHost: p.user_id === roomData.host_id,
            score: p.score || 0
          }));

          setRoom({
            id: roomData.id,
            roomCode: roomData.room_code,
            roomName: roomData.room_name,
            quizId: roomData.quiz_id,
            syncMode: roomData.sync_mode,
            delayLevel: roomData.delay_level,
            delayMs: roomData.delay_ms,
            players: mappedPlayers,
            hostId: roomData.host_id,
            isHost: Boolean(user?.id && user.id === roomData.host_id)
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading waiting room:", err);
        setError(err.message);
        setLoading(false);
      });

    const handleRoomUpdate = (updatedRoom) => {
      const hostId = updatedRoom.hostId || updatedRoom.host_id;
      setRoom((prev) => {
        const resolvedHostId = hostId || prev?.hostId;
        const isHost = Boolean(user?.id && resolvedHostId && user.id === resolvedHostId);
        return {
          ...prev,
          ...updatedRoom,
          hostId: resolvedHostId,
          isHost
        };
      });
    };

    const handleRoomStarted = () => {
      socket.emit("game:join", {
        roomCode,
        username: localStorage.getItem("username") || "Guest",
        playerId: localStorage.getItem("playerId") || socket.id || `player_${Date.now()}`
      });
      navigate(`/game/${roomCode}`);
    };

    socket.on("room:update", handleRoomUpdate);
    socket.on("room:started", handleRoomStarted);

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("join-room", {
      roomCode,
      player: {
        id: localStorage.getItem("playerId") || socket.id || `player_${Date.now()}`,
        username: localStorage.getItem("username") || "Guest"
      }
    });

    return () => {
      socket.off("room:update", handleRoomUpdate);
      socket.off("room:started", handleRoomStarted);
    };
  }, [navigate, roomCode, setRoom, user?.id]);

  const handleStartQuiz = async () => {
    setStarting(true);
    try {
      const res = await authFetch("/api/rooms/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode })
      });
      const result = res;
      if (result.success) {
        socket.emit("start-game", { roomCode, quizId: room?.quizId });
      } else {
        addToast(result.message || "Failed to start quiz", { type: "error" });
      }
    } catch (err) {
      addToast("Error starting quiz: " + err.message, { type: "error" });
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060a0f] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading waiting room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#060a0f] flex items-center justify-center text-white p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-md" style={{ animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          <p className="text-xl font-bold text-red-300 mb-2" >Error</p>
          <p className="text-red-200/80 mb-6 text-sm">{error}</p>
          <button onClick={() => navigate("/")} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition font-semibold">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#060a0f] text-white p-6 md:p-12 flex flex-col justify-between relative overflow-hidden transition-opacity duration-700 lg:h-screen lg:min-h-0 ${mounted ? "opacity-100" : "opacity-0"}`}
      
    >
      {/* Ambient blobs */}
      <div className="absolute w-[520px] h-[520px] rounded-full bg-indigo-500/8 blur-[90px] -top-32 -right-36 pointer-events-none" />
      <div className="absolute w-[380px] h-[380px] rounded-full bg-violet-500/8 blur-[80px] -bottom-20 -left-16 pointer-events-none" />

      <div className="max-w-3xl mx-auto w-full relative h-full flex flex-col lg:min-h-0">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 mb-8 gap-4 lg:mb-6">
          <div>
            <span className="text-indigo-400 font-semibold tracking-[0.12em] uppercase text-xs">Waiting Lobby</span>
            <h1
              className="text-3xl md:text-5xl font-extrabold mt-1"
              
            >
              {room?.roomName || "Quiz Lobby"}
            </h1>
          </div>
          <div className="bg-[#0d131c]/80 border border-slate-800 rounded-2xl px-6 py-4 flex items-center gap-4">
            <div>
              <p className="text-slate-500 text-xs uppercase font-semibold tracking-wide">Room Code</p>
              <p className="text-3xl font-mono font-bold text-emerald-400 tracking-wider mt-0.5">{roomCode}</p>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#0d131c]/80 border border-slate-800 rounded-2xl p-5 transition-all duration-300 hover:border-slate-700">
            <span className="text-slate-500 text-xs uppercase font-semibold tracking-wide block mb-1">Sync Strategy</span>
            <span className="text-lg font-bold text-blue-400">{room?.syncMode === "server" ? "Server-Authoritative" : "Optimistic (Fast-First)"}</span>
          </div>
          <div className="bg-[#0d131c]/80 border border-slate-800 rounded-2xl p-5 transition-all duration-300 hover:border-slate-700">
            <span className="text-slate-500 text-xs uppercase font-semibold tracking-wide block mb-1">Simulated Delay</span>
            <span className="text-lg font-bold text-amber-400">{room?.delayLevel === "custom" ? `${room?.delayMs} ms` : room?.delayLevel || "None"}</span>
          </div>
          <div className="bg-[#0d131c]/80 border border-slate-800 rounded-2xl p-5 transition-all duration-300 hover:border-slate-700">
            <span className="text-slate-500 text-xs uppercase font-semibold tracking-wide block mb-1">Players Connected</span>
            <span className="text-lg font-bold text-emerald-400">{room?.players?.length || 0}</span>
          </div>
        </div>

        {/* PLAYERS LIST */}
        <div className="bg-[#0d131c]/80 border border-slate-800 rounded-3xl p-6 md:p-8 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold" >Connected Players</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" style={{ animation: "pulseRing 2s infinite" }} />
              <span className="text-xs text-slate-400 font-medium">Waiting for host...</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
            {room?.players && room.players.length > 0 ? (
              room.players.map((player, index) => (
                <div
                  key={player.id}
                  className="bg-slate-800/40 border border-slate-800 rounded-2xl px-5 py-4 flex justify-between items-center hover:border-slate-700 transition-all duration-300 hover:-translate-y-0.5"
                  style={{ animation: "staggerFade 0.4s ease both", animationDelay: `${index * 0.08}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarGradient(index)} flex items-center justify-center font-bold text-sm text-white shadow-lg`}>
                      {player.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100">{player.username}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                        {player.isHost ? <><Crown size={10} className="text-amber-400" /> Host</> : "Player"}
                      </p>
                    </div>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" style={{ animation: "pulseRing 2s infinite" }} />
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Wifi size={24} className="text-slate-600" />
                </div>
                <p className="text-slate-500 font-medium">No players connected yet</p>
                <p className="text-slate-600 text-sm mt-1">Share the room code to invite players</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER HOST ACTIONS */}
      <div className="max-w-3xl mx-auto w-full mt-8 border-t border-slate-800 pt-6 relative lg:mt-4 lg:pt-4">
        {isRoomCreator ? (
          <button
            onClick={handleStartQuiz}
            disabled={starting || !room?.players || room.players.length === 0}
            className="btn-shimmer w-full bg-gradient-to-br from-indigo-600 to-violet-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 font-bold py-4 rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(99,102,241,0.4)] disabled:hover:translate-y-0 disabled:shadow-none text-base sm:text-lg flex items-center justify-center gap-2"
            
          >
            {starting ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting...
              </span>
            ) : (
              <>
                <Play size={18} />
                Start Quiz Session
              </>
            )}
          </button>
        ) : (
          <div className="text-center bg-[#0d131c]/80 border border-slate-800 rounded-2xl py-4 text-slate-400 text-sm flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Please wait. The host will start the quiz shortly...
          </div>
        )}
      </div>
    </div>
  );
}
