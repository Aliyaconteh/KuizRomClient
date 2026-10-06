import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { WifiOff } from "lucide-react";
import Navbar from "../components/ui/Navbar";

export default function MainLayout({ children }) {
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/signin" || pathname === "/signup" || pathname === "/verify-email";
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  return (
    <div className={`min-h-screen bg-[var(--app-surface)] text-[var(--app-text)] transition-colors duration-300 ${isAuthPage ? "" : "pb-24 lg:pb-0"}`}>
      {/* Offline banner */}
      {isOffline && (
        <div className="bg-red-600 text-white text-center px-4 py-2 text-sm font-semibold flex items-center justify-center gap-2 z-50 relative">
          <WifiOff size={15} />
          <span>You’re offline — some features may not work</span>
        </div>
      )}
      {!isAuthPage && <Navbar />}
      {children}
    </div>
  );
}
