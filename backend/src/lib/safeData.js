/**
 * Defensive data helpers shared across repositories and controllers.
 *
 * Every consumer of repository output must be able to rely on a stable shape:
 *   - collections are always arrays
 *   - objects are always plain objects
 *   - numeric fields are always numbers
 *
 * This prevents `Cannot read properties of undefined` crashes on the dashboard
 * when a brand-new user has zero data or a related document is missing.
 */

export function safeArray(value) {
  return Array.isArray(value) ? value : []
}

export function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

export function safeNumber(value, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function safeString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

/**
 * Run a promise and never let it reject the caller. On failure it returns
 * `fallback` and logs the failure with a full stack trace for later debugging.
 *
 * Unlike a bare try/catch, this surfaces the original error to the logger so
 * future failures include the complete stack rather than being silently swallowed.
 */
export async function safePromise(promise, fallback, context = 'safePromise') {
  try {
    const result = await promise
    // A repository returning `undefined`/`null` is treated as "no data".
    if (result === undefined || result === null) return fallback
    return result
  } catch (error) {
    if (typeof console !== 'undefined' && console.error) {
      console.error(`[${context}] safePromise caught error:`, error?.stack || error?.message || error)
    }
    return fallback
  }
}

/**
 * Resolve every entry of `tasks` (array of [key, promise]) independently so a
 * single widget failure never rejects the whole dashboard render. Each entry
 * falls back to `defaults[key]` so the response shape stays identical.
 */
export async function resolveWidgets(tasks, defaults = {}, context = 'resolveWidgets') {
  const entries = await Promise.allSettled(
    tasks.map(async ([key, promise]) => {
      try {
        const value = await promise
        return [key, value === undefined || value === null ? defaults[key] : value]
      } catch (error) {
        if (typeof console !== 'undefined' && console.error) {
          console.error(`[${context}] widget "${key}" failed:`, error?.stack || error?.message || error)
        }
        return [key, defaults[key]]
      }
    }),
  )
  
  return Object.fromEntries(
    entries.map((entry) => {
      if (entry.status === 'fulfilled') {
        return entry.value
      }
      // If the promise itself rejected (shouldn't happen with try-catch, but safety net)
      const [key] = tasks[entries.indexOf(entry)] || ['unknown', Promise.resolve()]
      if (typeof console !== 'undefined' && console.error) {
        console.error(`[${context}] widget "${key}" promise rejected:`, entry.reason)
      }
      return [key, defaults[key]]
    })
  )
}
