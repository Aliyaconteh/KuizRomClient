import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { apiUrl } from "../../../config/api";
import { readJsonResponse } from "../../../services/api/apiClient";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const started = useRef(false);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token.");
      return;
    }

    const verify = async () => {
      try {
        const response = await readJsonResponse(await fetch(apiUrl("/auth/verify-email"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        }), "Email verification");

        setStatus("success");
        setMessage(response.data?.message || "Email verified. You can now sign in.");
      } catch (err) {
        setStatus("error");
        setMessage(err.message);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="auth-page min-h-[100dvh] w-full flex flex-col relative">
      <div className="auth-panel mx-auto">
        <div className="auth-brand">KuizRoom</div>
        <div className="auth-panel-inner text-center">
          <MailCheck size={42} className={`mx-auto mb-4 ${status === "error" ? "text-red-500" : "text-[var(--brand-secondary)]"}`} />
          <h1 className="auth-title">
            {status === "loading" ? "Verifying email" : status === "success" ? "Email verified" : "Verification failed"}
          </h1>
          <p className="text-sm text-slate-400 mt-3">{message}</p>
          {status !== "loading" && (
            <Link
              to="/signin"
              className="auth-submit block w-full mt-6 py-3 rounded-lg font-semibold"
            >
              Go to sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
