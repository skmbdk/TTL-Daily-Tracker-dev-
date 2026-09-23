import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);
const HEARTBEAT_INTERVAL_MS = 120 * 1000;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem('zira_token'));
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('zira_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      sessionStorage.removeItem('zira_user');
      sessionStorage.removeItem('zira_token');
      return null;
    }
  });
  const [loading, setLoading] = useState(() => Boolean(token && !user));

  useEffect(() => {
    const syncMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await authService.me();
        setUser(data.user);
        sessionStorage.setItem('zira_user', JSON.stringify(data.user));
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    syncMe();
  }, [token]);

  useEffect(() => {
    const handleLogout = () => clearSession();
    window.addEventListener('zira:logout', handleLogout);
    return () => window.removeEventListener('zira:logout', handleLogout);
  }, []);

  useEffect(() => {
    if (!token || !user) return undefined;

    const heartbeat = () => {
      if (document.visibilityState !== 'visible') return;
      authService.heartbeat().catch(() => {});
    };

    heartbeat();
    const intervalId = window.setInterval(heartbeat, HEARTBEAT_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        heartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, user]);

  useEffect(() => {
    if (!token || !user) {
      disconnectSocket();
      return undefined;
    }

    connectSocket();
    return undefined;
  }, [token, user]);

  const login = async (payload) => {
    const data = await authService.login(payload);
    sessionStorage.setItem('zira_token', data.token);
    sessionStorage.setItem('zira_user', JSON.stringify(data.user));
    localStorage.removeItem('zira_token');
    localStorage.removeItem('zira_user');
    localStorage.setItem('zira_theme', 'light');
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const clearSession = () => {
    disconnectSocket();
    sessionStorage.removeItem('zira_token');
    sessionStorage.removeItem('zira_user');
    localStorage.removeItem('zira_token');
    localStorage.removeItem('zira_user');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role_name === 'admin',
      isPresenter: user?.role_name === 'presenter' || user?.session_mode === 'presenter',
      isReadOnly: Boolean(user?.read_only || user?.role_name === 'presenter' || user?.session_mode === 'presenter'),
      login,
      logout
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
