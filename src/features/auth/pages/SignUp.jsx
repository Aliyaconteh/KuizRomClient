import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff, User, Mail, Lock, ShieldCheck, MailCheck } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { apiUrl } from "../../../config/api";
import { readJsonResponse } from "../../../services/api/apiClient";
import { useToast } from "../../../components/ui/ToastContext";

export default function SignUp() {
  const navigate = useNavigate();
  const { setError, theme } = useAuth();
  const { addToast } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = "Username is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    if (password !== confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const signUp = async () => {
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await readJsonResponse(await fetch(apiUrl("/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username })
      }), "Sign-up");

      if (!response.success) {
        throw new Error(response.message || "Sign up failed");
      }

      setVerificationSent(true);
      addToast("Verification link sent. Check your email.", { type: "success" });
    } catch (err) {
      setError(err.message);
      addToast(err.message, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (resending) return;
    setResending(true);

    try {
      const response = await readJsonResponse(await fetch(apiUrl("/auth/resend-verification"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      }), "Resend verification email");

      addToast(response.message, { type: "success" });
    } catch (err) {
      addToast(err.message, { type: "error" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className={`auth-page min-h-[100dvh] w-full flex flex-col relative transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
    >
      {/* Sign-up artwork */}
      <div className="auth-hero">
        <img src="/Signup.jpeg" alt="A learner preparing for a study session" className="auth-hero-image" />
      </div>

      {/* Content */}
      <div className={`auth-panel transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
        <div className="auth-brand">KuizRoom</div>
        <div
          className="auth-panel-inner"
        >
          {/* Heading */}
          <h1 className="auth-title">
            {verificationSent ? "Check your email" : "Create account"}
          </h1>

          {verificationSent ? (
            <div className="flex flex-col gap-4 text-center">
              <MailCheck size={42} className="mx-auto text-[var(--brand-secondary)]" />
              <p className="text-sm text-slate-400">
                We sent a verification link to <strong className="text-[var(--app-text)]">{email}</strong>.
                Open it to verify your account before signing in. The link expires in 24 hours.
              </p>
              <button
                type="button"
                onClick={resendVerification}
                disabled={resending}
                className="auth-submit w-full py-3 rounded-lg font-semibold disabled:opacity-40"
              >
                {resending ? "Sending..." : "Resend verification link"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/signin")}
                className="text-[var(--brand-secondary)] font-semibold hover:text-[var(--brand-primary)] transition-colors"
              >
                Go to sign in
              </button>
            </div>
          ) : (
          <div className="flex flex-col gap-4">
            {/* Username */}
            <div>
              <div className={`auth-field flex items-center gap-2.5 ${errors.username ? "has-error" : ""}`}>
                <User size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setErrors((p) => ({ ...p, username: undefined })); }}
                  className={`w-full bg-transparent text-[0.9375rem] outline-none placeholder:text-slate-400 ${theme === "dark" ? "text-slate-100" : "text-[#16213E]"}`}
                />
              </div>
              {errors.username && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <div className={`auth-field flex items-center gap-2.5 ${errors.email ? "has-error" : ""}`}>
                <Mail size={16} className="text-slate-400 shrink-0" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  className={`w-full bg-transparent text-[0.9375rem] outline-none placeholder:text-slate-400 ${theme === "dark" ? "text-slate-100" : "text-[#16213E]"}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className={`auth-field flex items-center gap-2.5 ${errors.password ? "has-error" : ""}`}>
                <Lock size={16} className="text-slate-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
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

            {/* Confirm Password */}
            <div>
              <div className={`auth-field flex items-center gap-2.5 ${errors.confirm ? "has-error" : ""}`}>
                <ShieldCheck size={16} className="text-slate-400 shrink-0" />
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: undefined })); }}
                  onKeyDown={(e) => e.key === "Enter" && signUp()}
                  className={`w-full bg-transparent text-[0.9375rem] outline-none placeholder:text-slate-400 ${theme === "dark" ? "text-slate-100" : "text-[#16213E]"}`}
                />
              </div>
              {errors.confirm && <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.confirm}</p>}
            </div>

            {/* Submit */}
            <button
              onClick={signUp}
              disabled={loading}
              className="auth-submit w-full mt-1 py-3.5 rounded-lg font-bold text-[0.9375rem] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Account
                </>
              )}
            </button>
          </div>
          )}

          {!verificationSent && (
            <>
              <div className="auth-divider flex items-center gap-2.5 text-[0.7rem] tracking-wide mt-6">
                <span className="flex-1 h-px" />or<span className="flex-1 h-px" />
              </div>
              <p className="auth-footer text-center text-sm mt-4">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/signin")}
                  className="text-[var(--brand-secondary)] font-semibold hover:text-[var(--brand-primary)] transition-colors"
                >
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
