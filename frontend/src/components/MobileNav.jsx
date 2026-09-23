import { Boxes, ClipboardList, FolderKanban, History, LayoutDashboard, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const MobileNav = () => {
  const { isAdmin } = useAuth();
  const links = [
    {
      label: 'Dashboard',
      to: isAdmin ? '/admin/dashboard' : '/dashboard',
      icon: LayoutDashboard
    },
    { label: 'Kanban', to: '/kanban', icon: FolderKanban },
    { label: 'Tasks', to: '/tasks', icon: ClipboardList },
    ...(isAdmin
      ? [
          { label: 'Activity', to: '/admin/activity', icon: History },
          { label: 'Users', to: '/admin/users', icon: Users },
          { label: 'Projects', to: '/admin/projects', icon: Boxes }
        ]
      : [])
  ];

  return (
    <nav className="mobile-nav fixed inset-x-0 bottom-0 z-40 border-t px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-lg grid-flow-col auto-cols-[minmax(4rem,1fr)] gap-1 overflow-x-auto">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'mobile-nav-item flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[11px] font-semibold transition',
                isActive ? 'mobile-nav-item-active' : 'mobile-nav-item-idle'
              )
            }
          >
            <item.icon size={18} className="shrink-0" />
            <span className="w-full truncate text-center">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
