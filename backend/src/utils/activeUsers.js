const ACTIVE_WINDOW_MS = Number(process.env.ACTIVE_USER_WINDOW_MS || 3 * 60 * 1000);
const sessions = new Map();

export const markActive = (user, sessionId) => {
  if (!user?.user_id || !sessionId) return;

  sessions.set(sessionId, {
    session_id: sessionId,
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    role_name: user.role_name,
    session_mode: user.session_mode || 'standard',
    last_seen: new Date().toISOString()
  });
};

export const markInactive = (sessionId) => {
  if (sessionId) {
    sessions.delete(sessionId);
  }
};

export const getActiveUsers = () => {
  cleanupExpiredSessions();

  return Array.from(
    Array.from(sessions.values()).reduce((users, session) => {
      const existing = users.get(session.user_id);
      if (!existing) {
        users.set(session.user_id, {
          user_id: session.user_id,
          full_name: session.full_name,
          email: session.email,
          role_name: session.role_name,
          session_mode: session.session_mode,
          initials: getInitials(session.full_name),
          active_sessions: 1,
          last_seen: session.last_seen
        });
        return users;
      }

      existing.active_sessions += 1;
      if (new Date(session.last_seen) > new Date(existing.last_seen)) {
        existing.last_seen = session.last_seen;
        existing.session_mode = session.session_mode;
      }

      return users;
    }, new Map()).values()
  )
    .sort((a, b) => new Date(b.last_seen) - new Date(a.last_seen));
};

const cleanupExpiredSessions = () => {
  const expiresBefore = Date.now() - ACTIVE_WINDOW_MS;

  sessions.forEach((session, sessionId) => {
    if (new Date(session.last_seen).getTime() < expiresBefore) {
      sessions.delete(sessionId);
    }
  });
};

const getInitials = (name = '') =>
  name
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
