/**
 * Normalize API error payloads to a user-facing string.
 * Handles { message }, { error: string }, and { error: { code, message, details } }.
 */
export function getApiErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;

  const payload = data as Record<string, unknown>;

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  const error = payload.error;
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    if (typeof errorObj.message === 'string' && errorObj.message.trim()) {
      return errorObj.message;
    }
    if (typeof errorObj.code === 'string' && errorObj.code.trim()) {
      return errorObj.code;
    }
  }

  return fallback;
}
