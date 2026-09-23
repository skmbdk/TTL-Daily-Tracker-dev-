import { Check, CheckCheck, LoaderCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const formatTimestamp = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
};

const NotificationDropdown = ({
  dropdownRef,
  isLight,
  loading,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onOpenNotification,
  style
}) => (
  <motion.div
    animate={{ opacity: 1, scale: 1, y: 0 }}
    className={`fixed z-[9999] overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${
      isLight
        ? 'border-slate-200/80 bg-white/95 shadow-slate-900/12'
        : 'border-white/10 bg-[#08111f]/95 shadow-black/40'
    }`}
    exit={{ opacity: 0, scale: 0.97, y: -8 }}
    initial={{ opacity: 0, scale: 0.97, y: -8 }}
    ref={dropdownRef}
    style={style}
    transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
  >
    <div className={`flex items-center justify-between border-b px-4 py-3 ${isLight ? 'border-slate-200/80' : 'border-white/10'}`}>
      <div>
        <p className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Notifications</p>
        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{unreadCount} unread</p>
      </div>
      <button
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
          unreadCount
            ? isLight
              ? 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
              : 'bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15'
            : isLight
              ? 'text-slate-400'
              : 'text-slate-500'
        }`}
        disabled={!unreadCount}
        onClick={onMarkAllRead}
        type="button"
      >
        <CheckCheck size={14} />
        Read all
      </button>
    </div>

    <div className="max-h-[24rem] overflow-y-auto p-2">
      {loading ? (
        <div className={`flex items-center justify-center gap-2 px-4 py-8 text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          <LoaderCircle className="animate-spin" size={16} />
          Loading notifications
        </div>
      ) : notifications.length ? (
        notifications.map((notification) => (
          <article
            className={`group w-full cursor-pointer rounded-xl border p-3 text-left transition ${
              notification.is_read
                ? isLight
                  ? 'border-transparent hover:bg-slate-50'
                  : 'border-transparent hover:bg-white/[0.04]'
                : isLight
                  ? 'border-cyan-100 bg-cyan-50/70'
                  : 'border-cyan-400/15 bg-cyan-400/[0.07]'
            }`}
            key={notification.notification_id}
            onClick={() => onOpenNotification(notification)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpenNotification(notification);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-start gap-3">
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.is_read ? 'bg-slate-400/40' : 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.75)]'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-sm font-semibold leading-5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{notification.title}</p>
                  {!notification.is_read ? (
                    <button
                      className={`rounded-lg p-1 transition ${
                        isLight ? 'text-slate-400 hover:bg-white hover:text-cyan-700' : 'text-slate-400 hover:bg-white/10 hover:text-cyan-200'
                      }`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onMarkRead(notification);
                      }}
                      title="Mark as read"
                      type="button"
                    >
                      <Check size={14} />
                    </button>
                  ) : null}
                </div>
                {notification.message ? (
                  <p className={`mt-1 line-clamp-2 text-xs leading-5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    {notification.message}
                  </p>
                ) : null}
                <p className={`mt-2 text-[11px] font-medium ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  {formatTimestamp(notification.created_at)}
                </p>
              </div>
            </div>
          </article>
        ))
      ) : (
        <div className={`px-4 py-8 text-center text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          No notifications yet.
        </div>
      )}
    </div>
  </motion.div>
);

export default NotificationDropdown;
