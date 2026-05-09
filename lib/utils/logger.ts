/**
 * Logger utility for consistent logging across the application
 * Automatically removes logs in production (handled by Next.js compiler)
 * but provides a centralized place for future error tracking integration
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, but use proper error tracking in production
    if (isDevelopment) {
      console.error(...args);
    } else {
      // TODO: Send to error tracking service (Sentry, etc.)
      // Example: Sentry.captureException(args[0]);
      // For now, still log in production for critical errors
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};

