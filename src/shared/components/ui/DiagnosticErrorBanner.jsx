import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, ShieldAlert, WifiOff, HelpCircle } from "lucide-react";

/**
 * DiagnosticErrorBanner
 * Renders a standardized, user-friendly error banner with error category,
 * clear origin attribution, remediation hints, and expandable technical details.
 */
export default function DiagnosticErrorBanner({ error, onDismiss, className = "" }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!error) return null;

  const errorObj = typeof error === "string" 
    ? { userMessage: error, category: "ERROR", source: "Application" }
    : error.details || error;

  const message = errorObj.userMessage || errorObj.message || error.message || "An unexpected error occurred.";
  const category = errorObj.category || "ERROR";
  const source = errorObj.source || "System";
  const status = errorObj.status || 0;
  const hint = errorObj.hint || error.hint;
  const targetUrl = errorObj.targetUrl;
  const technicalMessage = errorObj.technicalMessage;

  const isNetwork = category === "NETWORK_ERROR" || status === 0;
  const isAuth = category === "AUTH_ERROR" || status === 401 || status === 403;

  const Icon = isNetwork ? WifiOff : isAuth ? ShieldAlert : AlertCircle;
  const borderColors = isNetwork
    ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
    : isAuth
    ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
    : "border-red-500/40 bg-red-500/10 text-red-200";

  const badgeColor = isNetwork
    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
    : isAuth
    ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
    : "bg-red-500/20 text-red-300 border-red-500/30";

  return (
    <div className={`w-full rounded-2xl border p-4 mb-4 transition-all duration-300 shadow-lg backdrop-blur-md ${borderColors} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-black/20 shrink-0 mt-0.5">
          <Icon size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <span className="font-bold text-sm tracking-wide">
              {isNetwork ? "Connection Failed" : isAuth ? "Authentication Error" : "Request Error"}
            </span>
            <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border font-mono font-medium ${badgeColor}`}>
              {source}
            </span>
          </div>

          <p className="text-xs sm:text-[13px] leading-relaxed opacity-95 break-words">
            {message}
          </p>

          {hint && (
            <div className="mt-2 text-[11px] sm:text-xs flex items-center gap-1.5 opacity-90 font-medium">
              <HelpCircle size={13} className="shrink-0" />
              <span>{hint}</span>
            </div>
          )}

          {/* Toggle details */}
          {(targetUrl || technicalMessage || status > 0) && (
            <div className="mt-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-[11px] flex items-center gap-1 opacity-75 hover:opacity-100 transition-opacity font-mono underline"
              >
                <span>{showDetails ? "Hide diagnostic details" : "Show diagnostic details"}</span>
                {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {showDetails && (
                <div className="mt-2 p-2.5 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono space-y-1">
                  {targetUrl && (
                    <div>
                      <span className="text-slate-400">Endpoint: </span>
                      <span className="text-indigo-300 break-all">{targetUrl}</span>
                    </div>
                  )}
                  {status > 0 && (
                    <div>
                      <span className="text-slate-400">HTTP Status: </span>
                      <span className="text-amber-300">{status}</span>
                    </div>
                  )}
                  {technicalMessage && (
                    <div>
                      <span className="text-slate-400">Error: </span>
                      <span className="text-slate-200">{technicalMessage}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400">Logged At: </span>
                    <span className="text-slate-300">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-white/60 hover:text-white transition-colors p-1"
            aria-label="Dismiss"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
