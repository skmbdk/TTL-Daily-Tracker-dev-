import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { notificationService } from '../../services/notificationService';
import { connectSocket } from '../../services/socket';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
  const { isLight } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const shellRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({ left: 16, top: 72, width: 352 });

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [items, count] = await Promise.all([
        notificationService.getNotifications({ limit: 20 }),
        notificationService.getUnreadNotificationCount()
      ]);
      setNotifications(items);
      setUnreadCount(count);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDropdownPosition = useCallback(() => {
    const trigger = shellRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const width = Math.min(352, window.innerWidth - 32);
    const left = Math.min(Math.max(16, rect.right - width), window.innerWidth - width - 16);

    setDropdownStyle({
      left,
      top: rect.bottom + 12,
      width
    });
  }, []);

  useEffect(() => {
    loadNotifications().catch(() => setLoading(false));
  }, [loadNotifications]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      const clickedTrigger = shellRef.current?.contains(event.target);
      const clickedDropdown = dropdownRef.current?.contains(event.target);

      if (!clickedTrigger && !clickedDropdown) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);

    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [open, updateDropdownPosition]);

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return undefined;

    const handleNewNotification = (notification) => {
      setNotifications((current) => {
        if (current.some((item) => item.notification_id === notification.notification_id)) {
          return current;
        }

        if (!notification.is_read) {
          setUnreadCount((count) => count + 1);
        }

        return [notification, ...current].slice(0, 20);
      });

      toast(notification.title);
    };

    socket.on('notification:new', handleNewNotification);
    return () => socket.off('notification:new', handleNewNotification);
  }, []);

  const markRead = async (notification) => {
    if (notification.is_read) return;
    const updated = await notificationService.markNotificationRead(notification.notification_id);
    setNotifications((current) =>
      current.map((item) => (item.notification_id === updated.notification_id ? updated : item))
    );
    setUnreadCount((count) => Math.max(count - 1, 0));
  };

  const markAllRead = async () => {
    if (!unreadCount) return;
    await notificationService.markAllNotificationsRead();
    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
    setUnreadCount(0);
  };

  const openNotification = async (notification) => {
    if (!notification.is_read) {
      await markRead(notification);
    }
    setOpen(false);
    if (notification.related_task_id) {
      navigate(`/tasks?taskId=${notification.related_task_id}`);
    }
  };

  return (
    <div className="relative" ref={shellRef}>
      <button
        aria-label="Notifications"
        aria-expanded={open}
        className="top-navbar-action relative"
        onClick={() => {
          updateDropdownPosition();
          setOpen((value) => !value);
        }}
        title="Notifications"
        type="button"
      >
        <Bell size={17} />
        {unreadCount ? (
          <span className="absolute -right-1 -top-1 grid min-h-[17px] min-w-[17px] place-items-center rounded-full border border-white/70 bg-cyan-400 px-1 text-[10px] font-black leading-none text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.75)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {createPortal(
        <AnimatePresence>
          {open ? (
            <NotificationDropdown
              dropdownRef={dropdownRef}
              isLight={isLight}
              loading={loading}
              notifications={notifications}
              onMarkAllRead={markAllRead}
              onMarkRead={markRead}
              onOpenNotification={openNotification}
              style={dropdownStyle}
              unreadCount={unreadCount}
            />
          ) : null}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default NotificationBell;
