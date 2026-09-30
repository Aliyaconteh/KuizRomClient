import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { apiUrl } from "../../../config/api";
import { readJsonResponse } from "../../../services/api/apiClient";
import { supabase } from "../../../services/supabase/supabaseClient";
import { useToast } from "../../../components/ui/ToastContext";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

export default function SignIn() {
  const navigate = useNavigate();
  const { login, setError, theme } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const finishGoogleRedirect = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const oauthError = searchParams.get("error_description") || hashParams.get("error_description");
      const hasOAuthResponse = searchParams.has("code") || hashParams.has("access_token") || Boolean(oauthError);

      if (!hasOAuthResponse) return;

      setGoogleLoading(true);
      setError(null);

      try {
        if (oauthError) {
          throw new Error(oauthError.replace(/\+/g, " "));
        }

        const code = searchParams.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const accessToken = sessionData?.session?.access_token;
        if (!accessToken) {
          throw new Error("Google sign-in did not return a session");
        }

        const response = await readJsonResponse(await fetch(apiUrl("/auth/google"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken })
        }), "Google sign-in");

        if (!response.success) {
          throw new Error(response.message || "Google sign-in failed");
        }

        login(response.data.user, response.data.token);
        addToast("Signed in with Google!", { type: "success" });
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate("/quizzes");
      } catch (err) {
        window.history.replaceState({}, document.title, window.location.pathname);
        setError(err.message);
        addToast(err.message, { type: "error" });
      } finally {
        setGoogleLoading(false);
      }
    };

    finishGoogleRedirect();
  }, [addToast, login, navigate, setError]);

  const continueWithGoogle = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/signin`,
          queryParams: { prompt: "select_account" }
        }
      });

      if (signInError) throw signInError;
    } catch (err) {
      setError(err.message);
      addToast(err.message, { type: "error" });
    } finally {
      setGoogleLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const signIn = async () => {
    if (loading || googleLoading) return;
    if (!validate()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await readJsonResponse(await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      }), "Sign-in");

      if (!response.success) {
        throw new Error(response.message || "Sign in failed");
      }

      login(response.data.user, response.data.token);
      addToast("Welcome back!", { type: "success" });
      navigate("/quizzes");
    } catch (err) {
      setError(err.message);
      addToast(err.message, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-[100dvh] w-full flex flex-col relative transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"} bg-[var(--app-bg)]`}
    >
      {/* Sign-in artwork */}
      <div className="relative flex h-[190px] w-full shrink-0 items-center justify-center overflow-hidden bg-[var(--brand-secondary)] sm:h-[240px]">
        <img src="/SignIn.jpeg" alt="A learner working through a question at her desk" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(16,39,68,0.72) 0%, rgba(16,39,68,0.38) 52%, rgba(16,39,68,0.08) 100%)" }} />
        <div className="relative flex items-center gap-4 text-white">
          <img src="/logo.png" alt="KuizRoom logo" className="h-16 w-16 rounded-lg bg-white/95 p-1 object-contain shadow-xl sm:h-20 sm:w-20" />
          <div>
            <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">KuizRoom</p>
            <p className="mt-1 text-sm font-medium text-white/80">Your next great quiz starts here</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-6">
        <div
          className={`w-full max-w-[420px] border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl transition-all duration-500 sm:p-8 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
        >
          {/* Heading */}
          <h1 className="text-center text-[1.7rem] font-extrabold leading-tight text-[var(--app-text)]">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-400 text-center mt-1.5 mb-6">
            Sign in to manage your quizzes and rooms
          </p>

          {/* Google button */}
          <button
            type="button"
            onClick={continueWithGoogle}
            disabled={googleLoading || loading}
            className={`w-full mb-5 py-3.5 rounded-lg font-semibold text-[0.9rem] border shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 ${theme === "dark" ? "bg-slate-900/90 border-slate-700 text-slate-200 hover:border-[var(--brand-primary)]/60" : "bg-white border-slate-200 text-[#16213E] hover:border-slate-300 hover:shadow-md"}`}
          >
            {googleLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className={`w-4 h-4 border-2 rounded-full animate-spin ${theme === "dark" ? "border-slate-600 border-t-slate-200" : "border-slate-300 border-t-[#16213E]"}`} />
                Connecting...
              </span>
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>

          <div className="flex items-center gap-2.5 text-[0.7rem] tracking-wide text-slate-400 mb-5">
            <span className={`flex-1 h-px ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`} />
            or sign in with email
            <span className={`flex-1 h-px ${theme === "dark" ? "bg-slate-800" : "bg-slate-200"}`} />
          </div>

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <div className={`flex items-center gap-2.5 border rounded-lg px-4 py-3 transition-all duration-150 ${theme === "dark" ? "bg-slate-900/80 focus-within:border-[var(--brand-primary)] focus-within:bg-[var(--brand-primary)]/[0.06]" : "bg-[#F7F8FC] focus-within:border-[var(--brand-secondary)] focus-within:bg-[var(--brand-secondary)]/[0.04]"} ${errors.email ? "border-red-400" : theme === "dark" ? "border-slate-800" : "border-transparent"}`}>
                <Mail size={16} className="text-slate-400 shrink-0" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  onKeyDown={(e) => e.key === "Enter" && signIn()}
                  className={`w-full bg-transparent text-[0.9375rem] outline-none placeholder:text-slate-400 ${theme === "dark" ? "text-slate-100" : "text-[#16213E]"}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className={`flex items-center gap-2.5 border rounded-lg px-4 py-3 transition-all duration-150 ${theme === "dark" ? "bg-slate-900/80 focus-within:border-[var(--brand-primary)] focus-within:bg-[var(--brand-primary)]/[0.06]" : "bg-[#F7F8FC] focus-within:border-[var(--brand-secondary)] focus-within:bg-[var(--brand-secondary)]/[0.04]"} ${errors.password ? "border-red-400" : theme === "dark" ? "border-slate-800" : "border-transparent"}`}>
                <Lock size={16} className="text-slate-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  onKeyDown={(e) => e.key === "Enter" && signIn()}
                  className={`w-full bg-transparent text-[0.9375rem] outline-none placeholder:text-slate-400 ${theme === "dark" ? "text-slate-100" : "text-[#16213E]"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-slate-400 hover:text-slate-300 transition-colors shrink-0"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              onClick={signIn}
              disabled={loading || googleLoading}
              className="w-full mt-1 py-3.5 rounded-lg font-bold text-[0.9375rem] tracking-wide text-[#17283a] bg-[var(--brand-primary)] shadow-lg shadow-[rgba(247,166,43,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ffc15b] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  <LogIn size={16} />
                  Login
                </>
              )}
            </button>

           
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-[var(--brand-secondary)] font-semibold hover:text-[var(--brand-primary)] transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
