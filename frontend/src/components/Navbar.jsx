import { LogOut, Moon, Sun, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  const { user, logout, isAdmin } = useAuth();
  const { isLight, toggleTheme } = useTheme();

  return (
    <header className="top-navbar sticky top-0 z-20 border-b px-4 py-3 backdrop-blur-xl sm:px-6">
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
          <div className="top-navbar-user flex items-center gap-2.5 rounded-xl px-3 py-2">
            <span className="top-navbar-user-icon">
              {isAdmin ? <AdminVerifiedBadge /> : <UserRound size={17} />}
            </span>
            <div className="min-w-0">
              <p className="top-navbar-user-name text-sm font-semibold">{user?.full_name}</p>
              <p className="top-navbar-user-role text-xs capitalize">{user?.role_name}</p>
            </div>
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
