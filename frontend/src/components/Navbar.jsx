import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Edit2, Loader2, LogOut, Moon, Sun, UserRound } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { getErrorMessage } from '../services/api';
import NotificationBell from './notifications/NotificationBell';

const AdminVerifiedBadge = () => (
  <svg
    aria-label="Admin verified"
    className="h-[25px] w-[25px] shrink-0"
    role="img"
    viewBox="0 0 22 22"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
      fill="#1d9bf0"
    />
  </svg>
);

const PurposeBrandMark = () => (
  <svg
    aria-hidden="true"
    className="top-navbar-brand-mark"
    focusable="false"
    preserveAspectRatio="xMidYMid meet"
    viewBox="0 0 33 30"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="purpose-gradient-green" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5fec70" stopOpacity="1" />
        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.85" />
      </linearGradient>
      <linearGradient id="purpose-gradient-cyan" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#42e3e6" stopOpacity="1" />
        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="purpose-gradient-orange" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ff9c00" stopOpacity="1" />
        <stop offset="100%" stopColor="#fb7185" stopOpacity="0.88" />
      </linearGradient>

      <clipPath id="purpose-stripe-green">
        <path d="M6.6 4H9.2L2.9 26H0.3L6.6 4Z" />
      </clipPath>
      <clipPath id="purpose-stripe-cyan">
        <path d="M17.2 4H19.8L13.5 26H10.9L17.2 4Z" />
      </clipPath>
      <clipPath id="purpose-stripe-orange">
        <path d="M27.8 4H30.4L24.1 26H21.5L27.8 4Z" />
      </clipPath>
    </defs>

    <g clipPath="url(#purpose-stripe-green)">
      <path
        className="top-navbar-brand-stripe top-navbar-brand-stripe-green"
        d="M6.6 4H9.2L2.9 26H0.3L6.6 4Z"
        fill="url(#purpose-gradient-green)"
      />
      <path className="top-navbar-brand-stripe-reveal top-navbar-brand-stripe-reveal-green" d="M6.6 4H9.2L2.9 26H0.3L6.6 4Z" />
    </g>

    <g clipPath="url(#purpose-stripe-cyan)">
      <path
        className="top-navbar-brand-stripe top-navbar-brand-stripe-cyan"
        d="M17.2 4H19.8L13.5 26H10.9L17.2 4Z"
        fill="url(#purpose-gradient-cyan)"
      />
      <path className="top-navbar-brand-stripe-reveal top-navbar-brand-stripe-reveal-cyan" d="M17.2 4H19.8L13.5 26H10.9L17.2 4Z" />
    </g>

    <g clipPath="url(#purpose-stripe-orange)">
      <path
        className="top-navbar-brand-stripe top-navbar-brand-stripe-orange"
        d="M27.8 4H30.4L24.1 26H21.5L27.8 4Z"
        fill="url(#purpose-gradient-orange)"
      />
      <path className="top-navbar-brand-stripe-reveal top-navbar-brand-stripe-reveal-orange" d="M27.8 4H30.4L24.1 26H21.5L27.8 4Z" />
    </g>
  </svg>
);

const Navbar = () => {
  const { user, logout, isAdmin, updateUser } = useAuth();
  const { isLight, toggleTheme, theme, setTheme } = useTheme();

  const effectiveName = user?.display_name || user?.full_name;

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(effectiveName || '');
  const [saving, setSaving] = useState(false);

  const popoverRef = useRef(null);

  useEffect(() => {
    setDisplayName(effectiveName || '');
  }, [effectiveName]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty.');
      return;
    }
    if (displayName.trim() === effectiveName) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      const data = await authService.updateProfile({ display_name: displayName.trim() });
      updateUser({ display_name: data.user.display_name });
      toast.success('Display name updated successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="top-navbar sticky top-0 z-50 border-b px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="top-navbar-inner flex flex-wrap items-center justify-between gap-3">
        <div className="top-navbar-brand min-w-0">
          <div className="top-navbar-brand-lockup">
            <PurposeBrandMark />
            <div className="min-w-0">
              <h1 className="top-navbar-title truncate font-semibold">Engineering a better world</h1>
            </div>
          </div>
        </div>
        <div className="top-navbar-right flex items-center gap-3">
          {/* User Profile Pill & Teams Dropdown */}
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className={`top-navbar-user flex items-center gap-2.5 rounded-xl px-3 py-2 transition duration-200 cursor-pointer ${
                isLight
                  ? 'hover:bg-slate-200/60 active:scale-[0.98]'
                  : 'hover:bg-white/10 active:scale-[0.98]'
              }`}
            >
              <span className="top-navbar-user-icon">
                {isAdmin ? <AdminVerifiedBadge /> : <UserRound size={17} />}
              </span>
              <div className="min-w-0 text-left">
                <p className="top-navbar-user-name text-sm font-semibold truncate max-w-[10rem]">
                  {effectiveName}
                </p>
                <p className="top-navbar-user-role text-xs capitalize opacity-80">{user?.role_name}</p>
              </div>
              <ChevronDown size={14} className={`transition-transform duration-200 opacity-70 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* MS Teams Style Popover Modal */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute right-0 mt-2 w-80 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl z-50 border ${
                    isLight
                      ? 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-900/10'
                      : theme === 'onyx'
                        ? 'bg-[#141418]/95 border-white/10 text-white shadow-black/60'
                        : 'bg-[#0f172a]/95 border-blue-500/25 text-white shadow-blue-950/50 ring-1 ring-blue-500/20'
                  }`}
                >
                  {/* Header / Avatar info */}
                  <div className="flex items-center gap-3 border-b pb-3.5 border-slate-200/60 dark:border-white/10">
                    <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold tracking-wider transition-colors border shadow-xs ${
                      isLight
                        ? 'border-slate-300 bg-slate-800 text-slate-100'
                        : theme === 'onyx'
                          ? 'border-zinc-700 bg-zinc-800 text-zinc-100'
                          : 'border-blue-500/35 bg-[#0d1630] text-cyan-300 shadow-blue-500/10'
                    }`}>
                      {getInitials(effectiveName)}
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#070d1e]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate">{effectiveName}</p>
                      <p className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {user?.email || 'user@organization.com'}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isAdmin
                            ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {user?.role_name || 'Member'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Display Name Section */}
                  <div className="py-3 border-b border-slate-200/60 dark:border-white/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        Display Name
                      </span>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className={`flex items-center gap-1 text-xs font-semibold hover:underline ${
                            isLight ? 'text-blue-600' : 'text-cyan-400'
                          }`}
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <form onSubmit={handleSaveName} className="mt-2 space-y-2">
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Enter display name"
                          autoFocus
                          className={`w-full rounded-xl px-3 py-2 text-sm outline-none transition border ${
                            isLight
                              ? 'border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                              : 'border-white/15 bg-white/5 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'
                          }`}
                        />
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              setDisplayName(effectiveName || '');
                            }}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                              isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/10 text-slate-300 hover:bg-white/15'
                            }`}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            Save
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className={`rounded-xl px-3 py-2 text-sm font-medium ${
                          isLight ? 'bg-slate-100/70 text-slate-900' : 'bg-white/[0.04] text-slate-200'
                        }`}>
                          {effectiveName}
                        </div>
                        {user?.full_name && user?.display_name && (
                          <p className={`mt-1.5 text-[11px] px-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            System Login ID: <span className="font-semibold">{user.full_name}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Appearance Theme Selector */}
                  <div className="pt-3 pb-1 border-b border-slate-200/60 dark:border-white/10">
                    <p className={`mb-2 text-[11px] font-bold uppercase tracking-wider ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      Appearance Theme
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTheme('onyx')}
                        className={`flex flex-col items-center gap-1 rounded-xl p-2 text-[11px] font-semibold transition border ${
                          theme === 'onyx'
                            ? 'border-zinc-500/60 bg-zinc-500/20 text-zinc-200 ring-1 ring-zinc-500/40 shadow-xs'
                            : isLight
                              ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                        title="Onyx Pure Black Theme"
                      >
                        <Moon size={13} className="text-zinc-400" />
                        <span>Onyx</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`flex flex-col items-center gap-1 rounded-xl p-2 text-[11px] font-semibold transition border ${
                          theme === 'light'
                            ? 'border-blue-500/60 bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/40 shadow-xs'
                            : isLight
                              ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                        title="Light Mode Theme"
                      >
                        <Sun size={13} className="text-amber-500" />
                        <span>Light</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTheme('blue')}
                        className={`flex flex-col items-center gap-1 rounded-xl p-2 text-[11px] font-semibold transition border ${
                          theme === 'blue' || theme === 'dark'
                            ? 'border-blue-500/60 bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/40 shadow-xs'
                            : isLight
                              ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                        title="Midnight Bluish Slate Dark Theme"
                      >
                        <span className="h-3 w-3 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-xs" />
                        <span>Midnight</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 transition hover:bg-rose-500/10"
                    >
                      <LogOut size={15} /> Log Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="top-navbar-actions flex items-center gap-3">
            <NotificationBell />
            <button
              aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
              aria-pressed={isLight}
              className={`top-navbar-action theme-toggle ${isLight ? 'is-light' : 'is-dark'}`}
              onClick={toggleTheme}
              title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
              type="button"
            >
              <span aria-hidden="true" className="theme-toggle-track">
                <span className="theme-toggle-ambient" />
                <span className="theme-toggle-star theme-toggle-star-one" />
                <span className="theme-toggle-star theme-toggle-star-two" />
                <span className="theme-toggle-star theme-toggle-star-three" />
                <span className="theme-toggle-thumb">
                  <Sun className="theme-toggle-symbol theme-toggle-symbol-sun" size={15} />
                  <Moon className="theme-toggle-symbol theme-toggle-symbol-moon" size={15} />
                </span>
              </span>
            </button>
            <button className="top-navbar-action" onClick={logout} title="Log out" type="button">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
