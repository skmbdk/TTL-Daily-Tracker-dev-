import { useState } from 'react';
import {
  BriefcaseBusiness,
  Gauge,
  History,
  KanbanSquare,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  RadioTower,
  Activity,
  UserRoundCog
} from 'lucide-react';
import { NavLink } from 'react-router-dom'; 
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import { Dock, DockIcon, DockItem, DockLabel } from './ui/dock';

const TATA_LOGO_URL = 'https://myigetit.com/wp-content/uploads/2024/05/Tata-Group-logo.png';
const TATA_WORDMARK_PATH =
  'M0,0.242 L13.055,0.242 L13.055,4.182 L9.306,4.182 L9.306,13.758 L3.868,13.758 L3.868,4.182 L0,4.182 z M19.643,5.697 L16.862,13.758 L11.664,13.758 L16.803,0.242 L22.484,0.242 L27.742,13.759 L22.424,13.759 L19.644,5.697 z M26.472,0.242 L39.527,0.242 L39.527,4.182 L35.779,4.182 L35.779,13.758 L30.339,13.758 L30.339,4.182 L26.472,4.182 z M46.114,5.697 L43.395,13.758 L38.136,13.758 L43.274,0.242 L48.955,0.242 L54.213,13.759 L48.894,13.759 L46.115,5.697 z M150.189,14 L150.189,12 C152.607,12 153.936,9.819 153.936,6.97 C153.936,4.424 152.666,2 150.189,2 L150.189,0 L150.308,0 C154.238,0 156.596,2.97 156.596,6.849 C156.596,11.394 153.875,13.939 150.189,13.999 z M169.891,6.303 L165.117,6.303 L165.117,8.243 L167.474,8.243 L167.474,11.636 C167.172,11.758 166.506,11.879 165.6,11.879 C162.821,11.879 160.887,10.06 160.887,6.969 C160.887,3.879 162.94,2.121 165.842,2.121 C167.232,2.121 168.138,2.364 168.924,2.727 L169.468,0.727 C168.804,0.424 167.534,0.061 165.842,0.061 C161.369,0.061 158.408,2.849 158.408,7.152 C158.348,9.152 159.072,10.97 160.221,12.12 C161.49,13.332 163.243,13.939 165.54,13.939 C167.293,13.939 168.984,13.454 169.891,13.152 z M172.369,13.758 L174.848,13.758 L174.848,0.243 L172.369,0.243 z M184.82,5.758 L179.743,5.758 L179.743,2.243 L185.123,2.243 L185.123,0.243 L177.264,0.243 L177.264,13.758 L185.423,13.758 L185.423,11.758 L179.743,11.758 L179.743,7.758 L184.82,7.758 z M187.237,13.152 C187.964,13.575 189.473,14 190.863,14 C194.369,14 196,12.12 196,9.94 C196,7.94 194.852,6.788 192.556,5.879 C190.742,5.212 189.956,4.728 189.956,3.637 C189.956,2.849 190.621,2.061 192.193,2.061 C193.462,2.061 194.369,2.424 194.852,2.666 L195.456,0.666 C194.731,0.303 193.704,0 192.193,0 C189.292,0 187.418,1.697 187.418,3.879 C187.418,5.819 188.869,7.031 191.105,7.818 C192.797,8.486 193.522,9.091 193.522,10.06 C193.522,11.213 192.617,11.94 191.045,11.94 C189.776,11.94 188.567,11.515 187.781,11.091 L187.237,13.151 z M150.189,0 L150.189,2 C147.711,2 146.441,4.364 146.441,7.03 C146.441,9.757 147.832,12 150.189,12 L150.189,14 L150.067,14 C146.261,14 143.842,11.091 143.842,7.091 C143.842,2.971 146.441,0.061 150.189,0.001 z M127.162,14 L127.162,12 C129.579,12 130.908,9.819 130.908,6.97 C130.908,4.424 129.64,2 127.162,2 L127.162,0 L127.282,0 C131.211,0 133.506,2.97 133.506,6.849 C133.506,11.394 130.85,13.939 127.162,13.999 z M135.623,13.758 L143.661,13.758 L143.661,11.697 L138.1,11.697 L138.1,0.242 L135.623,0.242 L135.623,13.76 z M64.851,13.758 L67.328,13.758 L67.328,2.304 L71.196,2.304 L71.196,0.242 L60.982,0.242 L60.982,2.304 L64.851,2.304 z M127.162,0 L127.162,2 C124.683,2 123.415,4.364 123.415,7.03 C123.415,9.757 124.804,12 127.162,12 L127.162,14 L127.042,14 C123.233,14 120.817,11.091 120.817,7.091 C120.817,2.971 123.415,0.061 127.162,0.001 z M80.746,5.758 L75.608,5.758 L75.608,2.243 L81.048,2.243 L81.048,0.243 L73.191,0.243 L73.191,13.758 L81.35,13.758 L81.35,11.758 L75.609,11.758 L75.609,7.758 L80.745,7.758 L80.745,5.758 z M92.772,11.394 C92.168,11.697 91.079,11.939 90.113,11.939 C87.152,11.939 85.399,10 85.399,7.031 C85.399,3.758 87.394,2.061 90.113,2.061 C91.261,2.061 92.168,2.303 92.772,2.606 L93.316,0.606 C92.833,0.365 91.684,0 90.053,0 C85.883,0 82.8,2.727 82.8,7.152 C82.8,11.272 85.399,14 89.691,14 C91.322,14 92.591,13.697 93.196,13.394 L92.773,11.394 z M95.311,0.242 L95.311,13.76 L97.789,13.76 L97.789,7.817 L103.469,7.817 L103.469,13.757 L105.948,13.757 L105.948,0.242 L103.469,0.242 L103.469,5.637 L97.789,5.637 L97.789,0.242 z M110.481,13.758 L110.481,8.91 C110.481,6.729 110.42,4.91 110.301,3.153 L110.36,3.153 C111.024,4.668 111.932,6.304 112.838,7.819 L116.344,13.759 L118.882,13.759 L118.882,0.242 L116.585,0.242 L116.585,4.97 C116.585,7.03 116.645,8.787 116.827,10.545 L116.766,10.606 C116.135,9.027 115.367,7.506 114.471,6.061 L110.964,0.242 L108.184,0.242 L108.184,13.758 z';

const sidebarTransition = { type: 'spring', stiffness: 260, damping: 32, mass: 0.85 };
const labelMotion = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
  transition: { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }
};

const Sidebar = () => {
  const { isAdmin } = useAuth();
  const { isLight } = useTheme();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('zira_sidebar_collapsed') === 'true');
  const links = [
    {
      label: 'Dashboard',
      to: isAdmin ? '/admin/dashboard' : '/dashboard',
      icon: Gauge
    },
    { label: 'Kanban', to: '/kanban', icon: KanbanSquare },
    { label: 'Tasks', to: '/tasks', icon: ListChecks },
    ...(isAdmin
      ? [
          { label: 'Activity', to: '/admin/activity', icon: History },
          { label: 'Users', to: '/admin/users', icon: UserRoundCog },
          { label: 'Projects', to: '/admin/projects', icon: BriefcaseBusiness }
        ]
      : [])
  ];

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem('zira_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 88 : 288, paddingLeft: collapsed ? 12 : 16, paddingRight: collapsed ? 12 : 16 }}
      className="sidebar-shell hidden min-h-screen shrink-0 overflow-hidden border-r py-5 backdrop-blur-xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col"
      data-collapsed={collapsed}
      initial={false}
      transition={sidebarTransition}
    >
      <div
        className={clsx(
          'sidebar-header mb-4 flex',
          collapsed ? 'justify-center' : 'px-0'
        )}
      >
        <div
          className={clsx(
            'sidebar-brand-trigger flex min-w-0 items-center rounded-xl',
            collapsed ? 'h-11 justify-center' : 'h-11 w-full gap-2.5'
          )}
        >
          <div className="sidebar-logo grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl leading-none">
            <img
              className="h-full w-full object-cover block"
              src={TATA_LOGO_URL}
              srcSet={`${TATA_LOGO_URL} 1x, ${TATA_LOGO_URL} 2x`}
              alt="Tata Group logo"
              loading="eager"
              decoding="async"
            />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                {...labelMotion}
                className="sidebar-brand-copy min-w-0"
                key="sidebar-brand-copy"
              >
                <svg
                  className="sidebar-wordmark"
                  viewBox="0 0 196 14"
                  aria-label="Tata Technologies"
                  role="img"
                  style={isLight ? { color: '#0052d0' } : {}}
                >
                  <path d={TATA_WORDMARK_PATH} fill="currentColor" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button
        className={clsx(
          'sidebar-nav-item sidebar-nav-action smooth-action flex w-full items-center rounded-xl py-2.5 text-sm font-semibold',
          collapsed ? 'justify-center px-0' : 'gap-3 px-2.5'
        )}
        onClick={toggleCollapsed}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        type="button"
      >
        <span className="sidebar-icon-shell sidebar-icon-shell-muted">
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </span>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              {...labelMotion}
              className="truncate"
              key="sidebar-collapse-label"
            >
              Collapse
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Apple Dock Navigation Container */}
      <nav className="mt-3">
        <Dock orientation="vertical" magnification={52} distance={110} className="w-full gap-1 p-0">
          {links.map((item) => (
            <DockItem key={item.to} className="w-full justify-start">
              {collapsed && <DockLabel side="right">{item.label}</DockLabel>}
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'sidebar-nav-item smooth-action relative flex w-full items-center rounded-xl text-sm font-semibold transition-colors',
                    collapsed ? 'justify-center px-0 h-11' : 'gap-3 px-2.5 h-11',
                    isActive ? 'sidebar-nav-active' : 'sidebar-nav-idle'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <DockIcon>
                      <span className={clsx('sidebar-icon-shell', isActive && 'sidebar-icon-shell-active')}>
                        <item.icon size={18} />
                      </span>
                    </DockIcon>
                    <AnimatePresence initial={false}>
                      {!collapsed && (
                        <motion.span
                          {...labelMotion}
                          className="truncate"
                          key={`${item.to}-label`}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </NavLink>
            </DockItem>
          ))}
        </Dock>
      </nav>

      <div className="mt-auto pt-6">
        <AnimatePresence initial={false} mode="wait">
          {!collapsed ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="sidebar-card sidebar-insight-card rounded-xl p-3"
              exit={{ opacity: 0, y: 8 }}
              initial={{ opacity: 0, y: 8 }}
              key="sidebar-insight-wide"
              transition={labelMotion.transition}
            >
              <div className="sidebar-insight-title flex items-center gap-2 text-sm font-semibold">
                <span className="sidebar-icon-shell sidebar-icon-shell-active">
                  <Activity size={16} />
                </span>
                Workspace pulse
              </div>
              <div className="sidebar-insight-meter mt-3 flex items-center justify-between rounded-lg px-3 py-2 text-xs">
                <span className="sidebar-insight-state">Live</span>
                <RadioTower size={15} className="sidebar-insight-activity" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="sidebar-card sidebar-card-compact smooth-action grid h-11 w-full place-items-center rounded-xl"
              exit={{ opacity: 0, scale: 0.92 }}
              initial={{ opacity: 0, scale: 0.92 }}
              key="sidebar-insight-compact"
              title="Workspace pulse"
              transition={labelMotion.transition}
            >
              <RadioTower size={18} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
