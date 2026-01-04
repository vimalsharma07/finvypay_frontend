// lib/api.ts
// Advanced, clean, reusable API client for Next.js
// No generics required at call sites ✅

// --------------------------------------------------
// ENV CONFIG
// --------------------------------------------------

const isServer = typeof window === "undefined";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/+$/, "");

const NEXT_BASE_PATH = (
  process.env.NEXT_PUBLIC_BASE_PATH || ""
).replace(/\/+$/, "");

// --------------------------------------------------
// GLOBAL API DEFAULTS (CHANGE ONCE, AFFECTS ALL APIS)
// --------------------------------------------------

const DEFAULT_CONFIG = {
  auth: true,          // attach Authorization header by default
  retries: 1,          // retry once on network / 5xx
  timeoutMs: 15_000,   // 15 seconds timeout
  json: true,          // send / expect JSON
};

// --------------------------------------------------
// ERROR TYPE
// --------------------------------------------------

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestOptions = Omit<RequestInit, "method" | "body" | "signal"> & {
  auth?: boolean;
  json?: boolean;
  body?: any;
  query?: Record<string, string | number | boolean | null | undefined>;
  retries?: number;
  timeoutMs?: number;
};

// --------------------------------------------------
// TOKEN HANDLING (CLIENT ONLY)
// --------------------------------------------------

// In-memory access token (rehydrated from localStorage on first access)
let inMemoryAccessToken: string | null = null;
let tokenRehydrated = false;

const getToken = (): string | null => {
  if (isServer) return null;
  
  // Rehydrate from sessionStorage on first access (for app reload)
  if (!tokenRehydrated && typeof window !== 'undefined') {
    const stored = sessionStorage.getItem("access_token");
    if (stored) {
      inMemoryAccessToken = stored;
    }
    tokenRehydrated = true;
  }
  
  return inMemoryAccessToken;
};

// Export setter for login/refresh
export function setAccessToken(token: string | null): void {
  if (isServer) return;
  inMemoryAccessToken = token;
  if (token && typeof window !== 'undefined') {
    sessionStorage.setItem("access_token", token);
  } else if (typeof window !== 'undefined') {
    sessionStorage.removeItem("access_token");
  }
}

// --------------------------------------------------
// URL HELPERS
// --------------------------------------------------

const isAbsoluteUrl = (url: string) =>
  url.startsWith("http://") || url.startsWith("https://");

// Internal Next.js API routes are simple paths like /api/hello, /api/users
// External backend APIs use versioned paths like /api/v1/..., /api/v2/...
const isInternalApi = (endpoint: string) => {
  if (!endpoint.startsWith("/api/")) return false;
  // Versioned API paths (/api/v1/, /api/v2/, etc.) are external backend APIs
  if (/^\/api\/v\d+\//.test(endpoint)) return false;
  // All other /api/ paths are treated as internal Next.js API routes
  return true;
};

const buildUrl = (endpoint: string): string => {
  if (isAbsoluteUrl(endpoint)) return endpoint;

  // Internal Next.js API routes (e.g., /api/hello, /api/users)
  // Excludes versioned APIs like /api/v1/... which are external backend APIs
  if (isInternalApi(endpoint)) {
    return `${NEXT_BASE_PATH}${endpoint}`;
  }

  // External API routes (everything else like /auth/login, /users, etc.)
  // These MUST go to the external backend API
  if (!API_BASE_URL) {
    const errorMsg = "NEXT_PUBLIC_API_URL environment variable is not defined. Please create a .env.local file with NEXT_PUBLIC_API_URL=your_api_url";
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error('API Configuration Error:', errorMsg);
      console.error('Endpoint requested:', endpoint);
    }
    throw new Error(errorMsg);
  }

  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = `${API_BASE_URL}${path}`;
  
  // Log URL in development for debugging
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🔗 API Request:', {
      endpoint,
      fullUrl,
      apiBaseUrl: API_BASE_URL,
      isInternal: false,
    });
  }
  
  return fullUrl;
};

const buildQuery = (query?: RequestOptions["query"]) => {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, val]) => {
    if (val !== null && val !== undefined) {
      params.append(key, String(val));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

// --------------------------------------------------
// UTILS
// --------------------------------------------------

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const shouldRetry = (status: number) => status >= 500 && status < 600;

// --------------------------------------------------
// FETCH WITH TIMEOUT + RETRY
// --------------------------------------------------

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries: number,
  timeoutMs: number
): Promise<Response> {
  let attempt = 0;
  let lastError: any;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!shouldRetry(res.status) || attempt === retries) {
        return res;
      }

      attempt++;
      await sleep(300 * attempt);
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err;

      if (attempt === retries) {
        throw err;
      }

      attempt++;
      await sleep(300 * attempt);
    }
  }

  throw lastError;
}

// --------------------------------------------------
// MAIN FETCH METHOD
// --------------------------------------------------

export async function apiFetch(
  endpoint: string,
  method: HttpMethod = "GET",
  options: RequestOptions = {}
): Promise<any> {
  const finalOptions = {
    ...DEFAULT_CONFIG,
    ...options,
  };

  const {
    auth,
    json,
    body,
    headers,
    query,
    retries,
    timeoutMs,
    ...rest
  } = finalOptions;

  let url = buildUrl(endpoint);
  url += buildQuery(query);

  const finalHeaders: HeadersInit = {
    ...(json && !(body instanceof FormData)
      ? {
          "Content-Type": "application/json",
          Accept: "application/json",
        }
      : {}),
    ...(headers || {}),
  };

  // Ensure Content-Type is set for POST/PUT/PATCH requests with body (but not for FormData)
  if (body !== undefined && method !== "GET" && !(body instanceof FormData)) {
    const headersObj = finalHeaders as Record<string, string>;
    if (!headersObj["Content-Type"]) {
      headersObj["Content-Type"] = "application/json";
    }
  }

  if (auth) {
    const token = getToken();
    if (token) {
      (finalHeaders as any).Authorization = `Bearer ${token}`;
    }
  }

  const init: RequestInit = {
    method,
    headers: finalHeaders,
    ...rest,
  };

  if (body !== undefined && method !== "GET") {
    init.body =
      json && typeof body !== "string" && !(body instanceof FormData)
        ? JSON.stringify(body)
        : body;
  }

  let response: Response;
  try {
    // Ensure we're not accidentally hitting internal routes for external API calls
    if (!isInternalApi(endpoint) && url.includes('/api/auth/')) {
      console.warn('⚠️ Warning: External API endpoint might be routing to internal route:', { endpoint, url });
    }

    // Log request details in development for debugging
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('📤 API Request Details:', {
        method,
        url,
        headers: finalHeaders,
        body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
      });
    }

    response = await fetchWithRetry(
      url,
      init,
      retries!,
      timeoutMs!
    );
  } catch (err: any) {
    // Provide more detailed error messages for common issues
    let errorMessage = "Network error";
    
    // Extract error message from various possible formats
    if (err?.message) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    } else if (err?.toString && err.toString() !== '[object Object]') {
      errorMessage = err.toString();
    }
    
    // Check for common fetch errors
    if (err?.name === "AbortError" || errorMessage.includes("aborted")) {
      errorMessage = "Request timeout. Please check your connection and try again.";
    } else if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError") || errorMessage.includes("Network request failed")) {
      // Network connectivity issue - could be backend not running, CORS, or network problem
      if (!API_BASE_URL) {
        errorMessage = "API URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.";
      } else {
        errorMessage = `Failed to connect to API at ${url}. Please check if the backend server is running and accessible.`;
      }
    }
    
    // Log detailed error for debugging (only in development)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error('❌ API Request Failed:', {
        endpoint,
        url,
        method,
        errorType: err?.constructor?.name || typeof err,
        errorName: err?.name,
        errorMessage: err?.message,
        errorString: err?.toString?.(),
        fullError: err,
        apiBaseUrl: API_BASE_URL,
        origin: typeof window !== 'undefined' ? window.location.origin : 'server',
        isInternal: isInternalApi(endpoint),
      });
    }
    
    throw new ApiError(errorMessage, 0, null);
  }

  const text = await response.text();
  let data: any = null;

  if (text) {
    try {
      data = json ? JSON.parse(text) : text;
    } catch {
      data = text;
    }
  }

  // Handle 401 Unauthorized - attempt refresh token
  if (response.status === 401 && auth && !(options as any)._retry) {
    // Mark request as retried to prevent loops
    const retryOptions = { ...options, _retry: true };
    
    // Lazy import to avoid circular dependencies
    const refreshHandler = await import('./api-refresh-handler');
    const newToken = await refreshHandler.handle401Refresh();
    
    if (newToken) {
      // Update in-memory token
      setAccessToken(newToken);
      
      // Clone original request config for retry
      const retryHeaders: HeadersInit = {
        ...finalHeaders,
        Authorization: `Bearer ${newToken}`,
      };
      
      const retryInit: RequestInit = {
        ...init,
        headers: retryHeaders,
      };
      
      // Retry the request
      const retryResponse = await fetchWithRetry(
        url,
        retryInit,
        retries!,
        timeoutMs!
      );
      
      const retryText = await retryResponse.text();
      let retryData: any = null;
      
      if (retryText) {
        try {
          retryData = json ? JSON.parse(retryText) : retryText;
        } catch {
          retryData = retryText;
        }
      }
      
      if (!retryResponse.ok) {
        // Handle standard error format
        const errorInfo = retryData?.error || {};
        const errorMessage = 
          errorInfo.message ||
          retryData?.message || 
          retryData?.error || 
          retryResponse.statusText ||
          'An error occurred';
        
        throw new ApiError(
          errorMessage,
          retryResponse.status,
          retryData
        );
      }
      
      return retryData;
    } else {
      // Refresh failed - clearAuthState already called in handler
      throw new ApiError(
        'Session expired. Please login again.',
        401,
        { refreshFailed: true }
      );
    }
  }

  // Handle 403 Forbidden - might be refresh token reuse
  if (response.status === 403) {
    if (data?.message?.toLowerCase().includes('refresh') || 
        data?.error?.toLowerCase().includes('reuse') ||
        data?.reuseDetected) {
      const refreshHandler = await import('./api-refresh-handler');
      refreshHandler.clearAuthState();
      throw new ApiError(
        'Session invalid — login again',
        403,
        { reuseDetected: true }
      );
    }
  }

  // Handle standard API response format
  // Check for error response: { success: false, error: { code, message, details } }
  if (data && typeof data === 'object' && 'success' in data && data.success === false) {
    const errorInfo = data.error || {};
    const errorMessage = 
      errorInfo.message || 
      data.message || 
      response.statusText ||
      'An error occurred';
    
    throw new ApiError(
      errorMessage,
      response.status,
      data
    );
  }

  if (!response.ok) {
    // Handle non-standard error responses (fallback)
    const errorMessage = 
      data?.error?.message ||
      data?.message || 
      data?.error || 
      response.statusText ||
      'An error occurred';
    
    throw new ApiError(
      errorMessage,
      response.status,
      data
    );
  }

  // For DELETE requests with 204 No Content, return a special indicator
  // This allows the caller to distinguish between 200 with data and 204 No Content
  if (method === "DELETE" && response.status === 204) {
    return { __status: 204, __noContent: true };
  }

  // Return the response data in standard format
  // Standard format: { success: true, data: <T>, meta?: <Object> }
  // For backward compatibility, also handle direct data responses
  if (data && typeof data === 'object' && 'success' in data && data.success === true) {
    // Return the standard format response
    // Components should access: response.data, response.meta, response.error
    return data;
  }

  // Fallback for non-standard responses (shouldn't happen with new backend)
  return data;
}

// --------------------------------------------------
// HTTP SHORTCUTS (CLEAN USAGE)
// --------------------------------------------------

export const http = {
  get: (endpoint: string, options?: RequestOptions) =>
    apiFetch(endpoint, "GET", options),

  post: (endpoint: string, body?: any, options?: RequestOptions) =>
    apiFetch(endpoint, "POST", { ...options, body }),

  put: (endpoint: string, body?: any, options?: RequestOptions) =>
    apiFetch(endpoint, "PUT", { ...options, body }),

  patch: (endpoint: string, body?: any, options?: RequestOptions) =>
    apiFetch(endpoint, "PATCH", { ...options, body }),

  delete: (endpoint: string, body?: any, options?: RequestOptions) =>
    apiFetch(endpoint, "DELETE", { ...options, body }),
};

