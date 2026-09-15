/**
 * Standardized Logger Utility for KuizRoom
 * Provides consistent, structured console logs and error formatting
 * to clearly identify the source of API, Network, Database, and Auth events.
 */

const LOG_PREFIX = "[KuizRoom]";

export const LogSource = {
  CLIENT_NETWORK: "Network / Connection",
  SERVER_AUTH: "Server Auth Service",
  SERVER_API: "Server REST API",
  DATABASE: "Database / Supabase",
  SOCKET: "Socket.IO Real-time",
  VALIDATION: "Form Validation"
};

export const LogLevel = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  DEBUG: "DEBUG"
};

class ApiLogger {
  log(action, message, details = {}, level = LogLevel.INFO) {
    const timestamp = new Date().toLocaleTimeString();
    const formattedPrefix = `${LOG_PREFIX} [${timestamp}] [${level}] [${action}]`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedPrefix, message, details);
        break;
      case LogLevel.WARN:
        console.warn(formattedPrefix, message, details);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedPrefix, message, details);
        break;
      default:
        console.log(formattedPrefix, message, details);
        break;
    }
  }

  info(action, message, details) {
    this.log(action, message, details, LogLevel.INFO);
  }

  warn(action, message, details) {
    this.log(action, message, details, LogLevel.WARN);
  }

  error(action, message, details) {
    this.log(action, message, details, LogLevel.ERROR);
  }
}

export const logger = new ApiLogger();

/**
 * Standardized API Error Parser
 * Converts raw fetch/network/HTTP errors into clear, descriptive user errors
 * and diagnostics with error origin, category, and remediation hints.
 */
export function parseApiError(error, context = {}) {
  const { endpoint = "", action = "API_REQUEST", targetUrl = "" } = context;

  // 1. Browser Network / Connection failure ("Failed to fetch", offline, connection refused)
  const isNetworkFailure =
    error instanceof TypeError &&
    (error.message?.includes("fetch") ||
      error.message?.includes("NetworkError") ||
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("Network request failed") ||
      error.message?.includes("Load failed"));

  if (isNetworkFailure || error.name === "AbortError" || !navigator.onLine) {
    const isOffline = !navigator.onLine;
    const userMessage = isOffline
      ? "You appear to be offline. Please check your internet connection."
      : `Cannot connect to backend server at ${targetUrl || "API server"}. Please ensure the server is running and accessible.`;

    const errorObj = {
      source: LogSource.CLIENT_NETWORK,
      category: "NETWORK_ERROR",
      status: 0,
      userMessage,
      technicalMessage: error.message || "Failed to fetch",
      targetUrl,
      endpoint,
      timestamp: new Date().toISOString(),
      hint: "Make sure the Node.js backend server is running (e.g. 'cd Server && npm run dev' on port 5000)."
    };

    logger.error(action, `[NETWORK FAILURE] ${userMessage}`, errorObj);
    return errorObj;
  }

  // 2. Parsed HTTP API Error with response payload
  if (error.responsePayload || error.status) {
    const status = error.status || 500;
    const payload = error.responsePayload || {};
    const message = payload.message || payload.error || error.message || "Request failed";

    let source = LogSource.SERVER_API;
    let category = "SERVER_ERROR";
    let hint = "Please try again or check backend server logs.";

    if (status === 400) {
      source = LogSource.VALIDATION;
      category = "VALIDATION_ERROR";
      hint = "Please verify your input fields.";
    } else if (status === 401 || status === 403) {
      source = LogSource.SERVER_AUTH;
      category = "AUTH_ERROR";
      hint = "Please check your email and password.";
    } else if (status === 404) {
      category = "NOT_FOUND";
      hint = "The requested API endpoint was not found on the server.";
    } else if (status >= 500) {
      source = LogSource.DATABASE;
      category = "SERVER_INTERNAL_ERROR";
      hint = "The server or database encountered an unexpected error.";
    }

    const errorObj = {
      source,
      category,
      status,
      userMessage: message,
      technicalMessage: payload.cause || payload.details || error.message,
      targetUrl,
      endpoint,
      timestamp: new Date().toISOString(),
      hint
    };

    logger.error(action, `[HTTP ${status}] [${category}] ${message}`, errorObj);
    return errorObj;
  }

  // 3. Generic / Unknown Error
  const errorObj = {
    source: LogSource.SERVER_API,
    category: "UNKNOWN_ERROR",
    status: 500,
    userMessage: error.message || "An unexpected error occurred",
    technicalMessage: error.stack || error.toString(),
    targetUrl,
    endpoint,
    timestamp: new Date().toISOString(),
    hint: "Check browser developer console for more diagnostic details."
  };

  logger.error(action, `[UNKNOWN ERROR] ${errorObj.userMessage}`, errorObj);
  return errorObj;
}
