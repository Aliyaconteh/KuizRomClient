import { useEffect, useRef, useState } from "react";
import { Home, DoorOpen, Plus, Trophy, Sun, Moon, BookOpen, LogIn } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UserMenu from "./UserMenu";

const hostDesktopLinks = [
  { to: "/",            label: "Home",         icon: Home },
  { to: "/join-room",   label: "Join",         icon: DoorOpen },
  { to: "/quizzes",     label: "Quizzes",      icon: BookOpen },
  { to: "/quizzes/create", label: "Create Quiz", icon: Plus },
  { to: "/leaderboard", label: "Scores",       icon: Trophy },
];

const hostMobileLinks = [
  { to: "/",            label: "Home",       icon: Home },
  { to: "/quizzes",     label: "Quizzes",    icon: BookOpen },
  { to: "/join-room",   label: "Join",       icon: DoorOpen },
  { to: "/leaderboard", label: "Scores",     icon: Trophy },
];

const guestMainLinks = [
  { to: "/",            label: "Home",       icon: Home },
  { to: "/quizzes",     label: "Quizzes",    icon: BookOpen },
  { to: "/join-room",   label: "Join",       icon: DoorOpen },
  { to: "/leaderboard", label: "Scores",     icon: Trophy },
];

const guestAuthLink = { to: "/signin", label: "Sign In", icon: LogIn };
const hostFabLink = { to: "/quizzes/create", label: "Create Quiz" };

function MobileNavButton({ to, label, Icon, isActive }) {
  const [showLabel, setShowLabel] = useState(false);

  return (
    <NavLink
      to={to}
      title={label}
      aria-label={label}
      onPointerDown={() => setShowLabel(true)}
      onPointerUp={() => setShowLabel(false)}
      onPointerLeave={() => setShowLabel(false)}
      onPointerCancel={() => setShowLabel(false)}
      onTouchStart={() => setShowLabel(true)}
      onTouchEnd={() => setShowLabel(false)}
      className={({ isActive: active }) =>
        `group relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] shadow-sm transition-all duration-200 ${
          active || isActive
            ? "border-[var(--brand-primary)] bg-[color:rgba(247,166,43,0.12)] text-[var(--brand-primary)] shadow-[0_0_0_1px_rgba(247,166,43,0.2)]"
            : "hover:border-[var(--brand-primary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
        }`
      }
    >
      <Icon size={18} className="shrink-0" aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <span
        className={`pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--bg-card)] px-2 py-1 text-[10px] font-medium text-[var(--text-primary)] shadow-lg transition-all duration-150 ${
          showLabel ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
      >
        {label}
      </span>
    </NavLink>
  );
}

export default function Navbar() {
  const { isAuthenticated, theme, setTheme } = useAuth();
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/signin" || pathname === "/signup";
  const links = isAuthenticated ? hostDesktopLinks : guestMainLinks;
  const mobileLinks = isAuthenticated ? hostMobileLinks : guestMainLinks;
  const authLink = isAuthenticated ? null : guestAuthLink;

  // --- Hide/show the mobile bottom nav based on scroll direction ---
  const [showMobileNav, setShowMobileNav] = useState(true);
  const lastScrollY = useRef(0);
  const idleTimer = useRef(null);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY <= 24) {
        setShowMobileNav(true);
      } else if (delta > 4) {
        setShowMobileNav(false);
      } else if (delta < -4) {
        setShowMobileNav(true);
      }

      lastScrollY.current = currentY;

      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setShowMobileNav(true), 600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--border-color)] bg-[var(--bg-nav)] backdrop-blur-xl">
        <nav className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex items-center h-15 justify-between gap-2 py-2 lg:py-0">

            <NavLink
              to="/"
              className="flex items-center gap-2 group shrink-0"
              aria-label="KuizRoom Home"
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] group-hover:shadow-md group-hover:shadow-purple-500/25 transition-shadow duration-300">
                <img src="/logo.png" alt="KuizRoom logo" className="h-full w-full object-contain p-0.5" />
              </div>
              <span className="hidden sm:inline text-base font-extrabold tracking-tight text-[var(--app-text)]">
                <span className="text-[var(--brand-primary)]">Kuiz</span>
                <span className="text-[var(--brand-secondary)]">Room</span>
              </span>
            </NavLink>

            <div className="flex-1 hidden lg:flex items-center gap-2 justify-center">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "text-[var(--brand-primary)] border-[var(--brand-primary)] bg-[color:rgba(247,166,43,0.08)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--brand-primary)]"
                    }`
                  }
                >
                  <Icon size={16} className="shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-all duration-200 hover:border-[var(--brand-primary)] hover:text-[var(--text-primary)]"
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
              </button>

              {authLink ? (
                <NavLink
                  to={authLink.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-2 text-sm font-semibold transition-all duration-200 hover:border-[var(--brand-primary)] hover:text-[var(--text-primary)] ${
                      isActive ? "text-[var(--brand-primary)]" : "text-[var(--text-secondary)]"
                    }`
                  }
                >
                  <authLink.icon size={16} aria-hidden="true" />
                  <span className="hidden sm:inline">{authLink.label}</span>
                  <span className="sr-only">Sign In</span>
                </NavLink>
              ) : (
                <UserMenu />
              )}
            </div>
          </div>
        </nav>
      </header>

      {!isAuthPage && <nav
        className={`lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border-color)] bg-[var(--bg-nav)] backdrop-blur-xl transition-transform duration-300 ease-out ${
          showMobileNav ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:gap-5 sm:px-5 ${
            isAuthenticated ? "justify-between" : "justify-center"
          }`}
        >
          {/* First half of links */}
          {mobileLinks.slice(0, Math.ceil(mobileLinks.length / 2)).map(({ to, label, icon: Icon }) => (
            <MobileNavButton key={to} to={to} label={label} Icon={Icon} isActive={false} />
          ))}

          {/* Big centered "Host a Quiz" FAB */}
          {isAuthenticated && (
            <NavLink
              to={hostFabLink.to}
              title={hostFabLink.label}
              aria-label={hostFabLink.label}
              className="group relative -mt-5 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white shadow-lg shadow-[color:rgba(247,166,43,0.25)] ring-4 ring-[var(--bg-nav)] transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              <Plus size={24} strokeWidth={2.5} aria-hidden="true" />
              <span className="sr-only">{hostFabLink.label}</span>
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--bg-card)] px-2 py-1 text-[10px] font-medium text-[var(--text-primary)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-active:opacity-100">
                {hostFabLink.label}
              </span>
            </NavLink>
          )}

          {/* Second half of links */}
          {mobileLinks.slice(Math.ceil(mobileLinks.length / 2)).map(({ to, label, icon: Icon }) => (
            <MobileNavButton key={to} to={to} label={label} Icon={Icon} isActive={false} />
          ))}
        </div>
      </nav>}
    </>
  );
}