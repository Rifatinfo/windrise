import { DEFAULT_PREFS, type EditorPrefs } from "./Cheatsheet"

const STORAGE_KEY = "realo.editor.prefs"

/**
 * Editor options live outside React so `useSyncExternalStore` can read them.
 * That keeps the server render on defaults and lets hydration pick up the
 * stored values without a second render pass or a setState-in-effect.
 */
let cached: EditorPrefs | null = null
const listeners = new Set<() => void>()

export function getPrefs(): EditorPrefs {
  if (cached) return cached

  let next: EditorPrefs = DEFAULT_PREFS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) next = { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {
    // Private browsing, blocked storage, or malformed JSON.
  }

  cached = next
  return next
}

export function getServerPrefs(): EditorPrefs {
  return DEFAULT_PREFS
}

export function setPrefs(next: EditorPrefs): void {
  cached = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Preferences are a convenience; the editor works without persistence.
  }
  listeners.forEach((listener) => listener())
}

export function subscribePrefs(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
