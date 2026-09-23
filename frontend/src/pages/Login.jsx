import { useState } from 'react';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Moon, ShieldCheck, Sun, UserRound } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getErrorMessage } from '../services/api';
import RunwayLoader from '../components/ui/runway-loader';

const TATA_LOGO_URL = 'https://myigetit.com/wp-content/uploads/2024/05/Tata-Group-logo.png';
const TATA_WORDMARK_PATH =
  'M0,0.242 L13.055,0.242 L13.055,4.182 L9.306,4.182 L9.306,13.758 L3.868,13.758 L3.868,4.182 L0,4.182 z M19.643,5.697 L16.862,13.758 L11.664,13.758 L16.803,0.242 L22.484,0.242 L27.742,13.759 L22.424,13.759 L19.644,5.697 z M26.472,0.242 L39.527,0.242 L39.527,4.182 L35.779,4.182 L35.779,13.758 L30.339,13.758 L30.339,4.182 L26.472,4.182 z M46.114,5.697 L43.395,13.758 L38.136,13.758 L43.274,0.242 L48.955,0.242 L54.213,13.759 L48.894,13.759 L46.115,5.697 z M150.189,14 L150.189,12 C152.607,12 153.936,9.819 153.936,6.97 C153.936,4.424 152.666,2 150.189,2 L150.189,0 L150.308,0 C154.238,0 156.596,2.97 156.596,6.849 C156.596,11.394 153.875,13.939 150.189,13.999 z M169.891,6.303 L165.117,6.303 L165.117,8.243 L167.474,8.243 L167.474,11.636 C167.172,11.758 166.506,11.879 165.6,11.879 C162.821,11.879 160.887,10.06 160.887,6.969 C160.887,3.879 162.94,2.121 165.842,2.121 C167.232,2.121 168.138,2.364 168.924,2.727 L169.468,0.727 C168.804,0.424 167.534,0.061 165.842,0.061 C161.369,0.061 158.408,2.849 158.408,7.152 C158.348,9.152 159.072,10.97 160.221,12.12 C161.49,13.332 163.243,13.939 165.54,13.939 C167.293,13.939 168.984,13.454 169.891,13.152 z M172.369,13.758 L174.848,13.758 L174.848,0.243 L172.369,0.243 z M184.82,5.758 L179.743,5.758 L179.743,2.243 L185.123,2.243 L185.123,0.243 L177.264,0.243 L177.264,13.758 L185.423,13.758 L185.423,11.758 L179.743,11.758 L179.743,7.758 L184.82,7.758 z M187.237,13.152 C187.964,13.575 189.473,14 190.863,14 C194.369,14 196,12.12 196,9.94 C196,7.94 194.852,6.788 192.556,5.879 C190.742,5.212 189.956,4.728 189.956,3.637 C189.956,2.849 190.621,2.061 192.193,2.061 C193.462,2.061 194.369,2.424 194.852,2.666 L195.456,0.666 C194.731,0.303 193.704,0 192.193,0 C189.292,0 187.418,1.697 187.418,3.879 C187.418,5.819 188.869,7.031 191.105,7.818 C192.797,8.486 193.522,9.091 193.522,10.06 C193.522,11.213 192.617,11.94 191.045,11.94 C189.776,11.94 188.567,11.515 187.781,11.091 L187.237,13.151 z M150.189,0 L150.189,2 C147.711,2 146.441,4.364 146.441,7.03 C146.441,9.757 147.832,12 150.189,12 L150.189,14 L150.067,14 C146.261,14 143.842,11.091 143.842,7.091 C143.842,2.971 146.441,0.061 150.189,0.001 z M127.162,14 L127.162,12 C129.579,12 130.908,9.819 130.908,6.97 C130.908,4.424 129.64,2 127.162,2 L127.162,0 L127.282,0 C131.211,0 133.506,2.97 133.506,6.849 C133.506,11.394 130.85,13.939 127.162,13.999 z M135.623,13.758 L143.661,13.758 L143.661,11.697 L138.1,11.697 L138.1,0.242 L135.623,0.242 L135.623,13.76 z M64.851,13.758 L67.328,13.758 L67.328,2.304 L71.196,2.304 L71.196,0.242 L60.982,0.242 L60.982,2.304 L64.851,2.304 z M127.162,0 L127.162,2 C124.683,2 123.415,4.364 123.415,7.03 C123.415,9.757 124.804,12 127.162,12 L127.162,14 L127.042,14 C123.233,14 120.817,11.091 120.817,7.091 C120.817,2.971 123.415,0.061 127.162,0.001 z M80.746,5.758 L75.608,5.758 L75.608,2.243 L81.048,2.243 L81.048,0.243 L73.191,0.243 L73.191,13.758 L81.35,13.758 L81.35,11.758 L75.609,11.758 L75.609,7.758 L80.745,7.758 L80.745,5.758 z M92.772,11.394 C92.168,11.697 91.079,11.939 90.113,11.939 C87.152,11.939 85.399,10 85.399,7.031 C85.399,3.758 87.394,2.061 90.113,2.061 C91.261,2.061 92.168,2.303 92.772,2.606 L93.316,0.606 C92.833,0.365 91.684,0 90.053,0 C85.883,0 82.8,2.727 82.8,7.152 C82.8,11.272 85.399,14 89.691,14 C91.322,14 92.591,13.697 93.196,13.394 L92.773,11.394 z M95.311,0.242 L95.311,13.76 L97.789,13.76 L97.789,7.817 L103.469,7.817 L103.469,13.757 L105.948,13.757 L105.948,0.242 L103.469,0.242 L103.469,5.637 L97.789,5.637 L97.789,0.242 z M110.481,13.758 L110.481,8.91 C110.481,6.729 110.42,4.91 110.301,3.153 L110.36,3.153 C111.024,4.668 111.932,6.304 112.838,7.819 L116.344,13.759 L118.882,13.759 L118.882,0.242 L116.585,0.242 L116.585,4.97 C116.585,7.03 116.645,8.787 116.827,10.545 L116.766,10.606 C116.135,9.027 115.367,7.506 114.471,6.061 L110.964,0.242 L108.184,0.242 L108.184,13.758 z';

const Login = () => {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const { isLight, toggleTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      if (setTheme) setTheme('light');
      localStorage.setItem('zira_theme', 'light');
      toast.success(`Welcome, ${user.full_name}`);
      navigate(user.role_name === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative grid min-h-screen place-items-center overflow-hidden px-4 py-10 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#09090b] text-zinc-100'}`}>
      {/* Subtle Background Grid */}
      <div className={`absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] ${isLight ? 'opacity-70' : 'opacity-20'}`} />

      {/* Ambient Radial Gradient Accent */}
      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full blur-[140px] pointer-events-none ${isLight ? 'bg-blue-100/40' : 'bg-blue-600/10'}`} />

      {/* Theme Toggle */}
      <button
        className={`fixed right-4 top-4 z-20 rounded-full border p-2.5 backdrop-blur-md transition-all duration-200 ${
          isLight
            ? 'border-slate-200 bg-white/80 text-slate-600 hover:bg-white hover:shadow-md'
            : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white'
        }`}
        onClick={toggleTheme}
        title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
        type="button"
      >
        {isLight ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`relative z-10 w-full max-w-md overflow-hidden rounded-2xl border backdrop-blur-xl ${isLight
          ? 'border-slate-200/80 bg-white/90 shadow-xl'
          : 'border-zinc-800/90 bg-zinc-900/80 shadow-2xl shadow-black/60'
          }`}
      >
        <div className="relative p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-3">
              <div className={`grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border p-1 leading-none shadow-sm ${
                isLight
                  ? 'border-slate-200 bg-white'
                  : 'border-zinc-700/50 bg-white/80'
              }`}>
                <img
                  className="h-full w-full object-contain"
                  src={TATA_LOGO_URL}
                  srcSet={`${TATA_LOGO_URL} 1x, ${TATA_LOGO_URL} 2x`}
                  alt="Tata Group logo"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <svg
                className={`w-36 ${isLight ? 'text-[#0052d0]' : 'text-white'}`}
                viewBox="0 0 196 14"
                aria-label="Tata Technologies"
                role="img"
              >
                <path d={TATA_WORDMARK_PATH} fill="currentColor" />
              </svg>
            </div>

            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${isLight
              ? 'border-slate-200 bg-slate-100 text-slate-700'
              : 'border-zinc-800 bg-zinc-800/60 text-zinc-300'
              }`}>
              <ShieldCheck size={13} className={isLight ? 'text-slate-600' : 'text-zinc-400'} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">TTL Daily Tracker</span>
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-5" onSubmit={submit} autoComplete="off">
            {/* Email Input */}
            <div className="relative group">
              <div className={`relative rounded-xl border transition-all duration-200 ${isLight
                ? focusedField === 'email' ? 'border-blue-500 bg-white shadow-[0_0_0_3px_rgba(59,130,246,0.15)]' : 'border-slate-200 bg-slate-50/60'
                : focusedField === 'email' ? 'border-blue-500 bg-zinc-950 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]' : 'border-zinc-800 bg-zinc-950/50'
                }`}>
                <UserRound className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'email' ? 'text-blue-500' : 'text-slate-400'}`} size={18} />
                <input
                  className={`block w-full rounded-xl border-0 bg-transparent py-3.5 pl-11 pr-4 text-sm outline-none transition-all duration-200 ${isLight ? 'text-slate-900 placeholder-slate-400' : 'text-zinc-100 placeholder-zinc-500'}`}
                  type="text"
                  placeholder=" "
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
                <label className={`absolute pointer-events-none transition-all duration-200 ${focusedField || form.email
                  ? '-top-2.5 left-3 text-[10px] font-semibold px-1 rounded-md'
                  : 'top-1/2 -translate-y-1/2 left-11 text-sm'
                  } ${focusedField || form.email
                    ? (isLight ? 'text-blue-600 bg-white' : 'text-blue-400 bg-zinc-900')
                    : (isLight ? 'text-slate-400' : 'text-zinc-500')
                  }`}>
                  Name or email
                </label>
              </div>
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className={`relative rounded-xl border transition-all duration-200 ${isLight
                ? focusedField === 'password' ? 'border-blue-500 bg-white shadow-[0_0_0_3px_rgba(59,130,246,0.15)]' : 'border-slate-200 bg-slate-50/60'
                : focusedField === 'password' ? 'border-blue-500 bg-zinc-950 shadow-[0_0_0_3px_rgba(59,130,246,0.2)]' : 'border-zinc-800 bg-zinc-950/50'
                }`}>
                <LockKeyhole className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'password' ? 'text-blue-500' : 'text-slate-400'}`} size={18} />
                <input
                  className={`block w-full rounded-xl border-0 bg-transparent py-3.5 pl-11 pr-11 text-sm outline-none transition-all duration-200 ${isLight ? 'text-slate-900 placeholder-slate-400' : 'text-zinc-100 placeholder-zinc-500'}`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder=" "
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <label className={`absolute pointer-events-none transition-all duration-200 ${focusedField || form.password
                  ? '-top-2.5 left-3 text-[10px] font-semibold px-1 rounded-md'
                  : 'top-1/2 -translate-y-1/2 left-11 text-sm'
                  } ${focusedField || form.password
                    ? (isLight ? 'text-blue-600 bg-white' : 'text-blue-400 bg-zinc-900')
                    : (isLight ? 'text-slate-400' : 'text-zinc-500')
                  }`}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 transition-all duration-200 hover:opacity-80 focus:outline-none ${focusedField === 'password' ? 'text-blue-500' : 'text-slate-400'}`}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Clean Submit Button */}
            <button
              className={`relative w-full rounded-xl py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.99] ${loading ? 'pointer-events-none opacity-80' : ''} ${isLight
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30'
                }`}
              disabled={loading}
            >
              <span className="inline-flex items-center justify-center gap-2 !text-white text-white font-semibold">
                {loading ? <LoaderCircle className="animate-spin !text-white text-white" size={18} /> : null}
                <span className="!text-white text-white">{loading ? 'Signing in...' : 'Sign in'}</span>
              </span>
            </button>
          </form>
        </div>
      </motion.div>

      {/* Footer */}
      <div className={`absolute bottom-6 left-0 w-full text-center ${isLight ? 'text-slate-400 opacity-60' : 'text-slate-500 opacity-50'}`}>
        <motion.div
          className="inline-flex items-center gap-2 text-xs font-medium tracking-wide transition-all duration-300 hover:opacity-100"
          whileHover={{ scale: 1.02 }}
        >
          <span>Built with</span>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-rose-500"
          >
            ♥
          </motion.span>
          <span>by Subham Mohanty</span>
        </motion.div>
      </div>

      {/* Transparent Loading Overlay with RunwayLoader */}
      {loading ? (
        <motion.div
          onClick={() => setLoading(false)}
          className={`fixed inset-0 z-50 grid place-items-center px-4 backdrop-blur-lg transition-all duration-300 cursor-pointer ${
            isLight ? 'bg-slate-900/30' : 'bg-black/60'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          title="Click to close preview"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-transparent"
          >
            <RunwayLoader />
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  );
};

export default Login;