import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "./ToastContext";
import { ChevronDown, LogOut, Plus, Activity, UserCircle, Sparkles } from "lucide-react";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const handleSignOut = () => {
    logout();
    addToast("Logout", { type: "info" });
    navigate("/");
    setOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-xl border border-slate-700/50 bg-slate-800/50 px-2 py-1.5 transition-all duration-200 hover:bg-slate-700/50 hover:border-slate-600"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white font-bold flex items-center justify-center text-xs shrink-0">
          {user.username?.charAt(0).toUpperCase() || "U"}
        </div>
        {/* Username — hidden on very small screens */}
        <span className="hidden sm:inline-block text-sm font-medium text-slate-200 max-w-[90px] truncate">
          {user.username}
        </span>
        <ChevronDown
          size={13}
          className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-xl shadow-black/50 z-50 overflow-hidden animate-fade-in">
          {/* User info */}
          <div className="px-4 py-3 border-b border-slate-700/50 bg-gradient-to-r from-[color:rgba(27,95,156,0.15)] to-[color:rgba(247,166,43,0.12)]">
            <p className="text-[0.68rem] text-slate-400 uppercase tracking-wide">Signed in as</p>
            <p className="text-sm font-semibold text-white truncate">{user.username}</p>
          </div>

          {/* Actions */}
          <div className="p-1.5 space-y-0.5 max-h-80 overflow-y-auto">
            
            <button
              onClick={() => { navigate("/profile"); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-150 text-sm"
            >
              <UserCircle size={15} />
              <span>Profile</span>
            </button>


            <button
              onClick={() => { navigate("/create-room"); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-150 text-sm"
            >
              <Plus size={15} />
              <span>Create Room</span>
            </button>

            <button
              onClick={() => { navigate("/sync-analysis"); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-150 text-sm"
            >
              <Activity size={15} />
              <span>Analysis</span>
            </button>

            <button
              onClick={() => { navigate("/ai-practice"); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-150 text-sm"
            >
              <Sparkles size={15} />
              <span>AI Tutor</span>
            </button>

            <div className="border-t border-slate-700/50 my-1" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150 text-sm font-medium"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
