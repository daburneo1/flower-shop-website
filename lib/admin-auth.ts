type AdminSession = {
  floristId: string
  email: string
}

const STORAGE_KEY = "admin_session_v1"

export function setAdminSession(session: AdminSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // ignore storage errors
  }
}

export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AdminSession
  } catch {
    return null
  }
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore storage errors
  }
}
