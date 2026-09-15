import { apiUrl } from "../../config/api";
import { logger, parseApiError } from "../../utils/apiLogger";

/**
 * Standardized HTTP Request Wrapper for KuizRoom
 * Automatically manages headers, error parsing, and logging.
 */
export async function apiRequest(path, options = {}) {
  const targetUrl = apiUrl(path);
  const actionName = options.action || options.method || "API_REQUEST";
  const startTime = Date.now();

  logger.info(actionName, `Sending ${options.method || "GET"} request to ${targetUrl}`);

  try {
    const headers = {
      ...(options.headers || {})
    };

    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(targetUrl, {
      ...options,
      headers
    });

    const elapsed = Date.now() - startTime;

    let payload = null;
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        payload = await response.json();
      } catch (jsonErr) {
        logger.warn(actionName, "Failed to parse JSON response payload", { rawError: jsonErr.message });
      }
    } else {
      payload = await response.text();
    }

    if (!response.ok || (payload && payload.success === false)) {
      const err = new Error(payload?.message || payload?.error || `Request failed with status ${response.status}`);
      err.status = response.status;
      err.responsePayload = payload;
      throw err;
    }

    logger.info(actionName, `[${response.status} OK] Completed in ${elapsed}ms`, { targetUrl });
    return payload;
  } catch (error) {
    const parsedError = parseApiError(error, {
      endpoint: path,
      action: actionName,
      targetUrl
    });

    const standardError = new Error(parsedError.userMessage);
    standardError.details = parsedError;
    standardError.source = parsedError.source;
    standardError.category = parsedError.category;
    standardError.status = parsedError.status;
    standardError.hint = parsedError.hint;
    throw standardError;
  }
}

export const api = {
  get: (path, options = {}) => apiRequest(path, { ...options, method: "GET" }),
  post: (path, body, options = {}) =>
    apiRequest(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),
  put: (path, body, options = {}) =>
    apiRequest(path, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),
  delete: (path, options = {}) => apiRequest(path, { ...options, method: "DELETE" })
};
