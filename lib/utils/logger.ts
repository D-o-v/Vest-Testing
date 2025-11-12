// Lightweight logger that centralizes logging and sanitizes inputs.
// Avoids scattered `console.*` calls across the codebase and makes it
// easier to suppress logs in production. The functions always coerce
// values to strings to reduce the risk of log injection.
function toSafeString(...parts: any[]) {
  try {
    return parts.map(p => (typeof p === 'string' ? p : JSON.stringify(p))).join(' ')
  } catch {
    return parts.map(p => String(p)).join(' ')
  }
}

export const logger = {
  error: (...parts: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(toSafeString(...parts))
    }
  },
  warn: (...parts: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(toSafeString(...parts))
    }
  },
  info: (...parts: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(toSafeString(...parts))
    }
  },
}

export default logger
