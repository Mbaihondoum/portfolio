/**
 * Minimal structured JSON logger (one line per event, parsable by Vercel / any
 * log drain). No dependency needed for this scope.
 */
type Level = 'debug' | 'info' | 'warn' | 'error'
type Fields = Record<string, unknown>

const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 }
const minLevel: Level =
  (process.env.LOG_LEVEL as Level | undefined) ??
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

function serializeError(err: unknown) {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack }
  }
  return { message: String(err) }
}

function write(level: Level, msg: string, fields: Fields = {}) {
  if (process.env.NODE_ENV === 'test' && !process.env.LOG_IN_TESTS) return
  if (LEVELS[level] < LEVELS[minLevel]) return
  const { err, ...rest } = fields
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg,
    ...rest,
    ...(err !== undefined ? { err: serializeError(err) } : {}),
  })
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export const logger = {
  debug: (msg: string, f?: Fields) => write('debug', msg, f),
  info: (msg: string, f?: Fields) => write('info', msg, f),
  warn: (msg: string, f?: Fields) => write('warn', msg, f),
  error: (msg: string, f?: Fields) => write('error', msg, f),
  child(base: Fields) {
    return {
      debug: (msg: string, f?: Fields) => write('debug', msg, { ...base, ...f }),
      info: (msg: string, f?: Fields) => write('info', msg, { ...base, ...f }),
      warn: (msg: string, f?: Fields) => write('warn', msg, { ...base, ...f }),
      error: (msg: string, f?: Fields) => write('error', msg, { ...base, ...f }),
    }
  },
}
