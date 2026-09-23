import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldAlert,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck,
  UserX,
  UserPlus,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import { useTheme } from '../context/ThemeContext';
import { getErrorMessage } from '../services/api';
import clsx from 'clsx';

const LOGS_PER_PAGE = 10;

const getActionBadge = (actionType, isLight) => {
  switch (actionType) {
    case 'ROLE_CHANGE':
      return (
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
            isLight
              ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
              : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
          )}
        >
          <ShieldAlert size={13} />
          Role Change
        </span>
      );
    case 'STATUS_CHANGE':
      return (
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
            isLight
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
          )}
        >
          <UserCheck size={13} />
          Status Change
        </span>
      );
    case 'USER_CREATED':
      return (
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
            isLight
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          )}
        >
          <UserPlus size={13} />
          User Created
        </span>
      );
    case 'USER_DEACTIVATED':
      return (
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
            isLight
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
          )}
        >
          <UserX size={13} />
          Deactivated
        </span>
      );
    default:
      return (
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
            isLight
              ? 'border-slate-200 bg-slate-100 text-slate-700'
              : 'border-slate-500/30 bg-slate-500/10 text-slate-300'
          )}
        >
          <RefreshCw size={13} />
          {actionType || 'Update'}
        </span>
      );
  }
};

const formatRolePill = (role, isLight) => {
  const isAdm = role?.toLowerCase() === 'admin';
  return (
    <span
      className={clsx(
        'inline-block uppercase tracking-wider text-[10px] font-bold px-2 py-0.5 rounded border',
        isAdm
          ? isLight
            ? 'border-cyan-300 bg-cyan-50 text-cyan-700'
            : 'border-cyan-400/40 bg-cyan-400/15 text-cyan-300'
          : isLight
          ? 'border-slate-300 bg-slate-100 text-slate-700'
          : 'border-slate-600 bg-slate-800/80 text-slate-300'
      )}
    >
      {role || 'user'}
    </span>
  );
};

const formatDateTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const UserAuditLogModal = ({ open, onClose }) => {
  const { isLight } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const fetchLogs = async () => {
    if (!open) return;
    setLoading(true);
    try {
      const data = await userService.getAuditLogs({
        action_type: actionFilter,
        search: search.trim() || undefined,
        page,
        page_size: LOGS_PER_PAGE
      });
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.total_pages || 1);
      setTotalLogs(data.pagination?.total || 0);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load audit logs'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open, page, actionFilter]);

  useEffect(() => {
    setPage(1);
  }, [actionFilter, search]);

  if (!open) return null;

  return createPortal(
    <div
      className={clsx(
        'fixed inset-0 z-[60] overflow-y-auto p-4 sm:p-6 transition-all backdrop-blur-md',
        isLight ? 'bg-slate-900/40' : 'bg-black/80'
      )}
    >
      <div className="flex min-h-full items-center justify-center pb-12 pt-4">
        <section
          className={clsx(
            'w-full max-w-4xl overflow-hidden rounded-2xl border shadow-2xl transition-all duration-300',
            isLight
              ? 'border-slate-200 bg-white text-slate-900 shadow-slate-300/40'
              : 'border-white/[0.08] bg-[#18181b] text-zinc-100 shadow-black/60'
          )}
        >
          {/* Header */}
          <div
            className={clsx(
              'flex items-center justify-between border-b px-6 py-4',
              isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/[0.08] bg-[#141417]'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  'flex h-10 w-10 items-center justify-center rounded-xl border transition-colors',
                  isLight
                    ? 'border-cyan-200 bg-cyan-50 text-cyan-600'
                    : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                )}
              >
                <ShieldAlert size={20} />
              </div>
              <div>
                <p
                  className={clsx(
                    'text-xs font-bold uppercase tracking-[0.2em]',
                    isLight ? 'text-cyan-600' : 'text-cyan-400'
                  )}
                >
                  Security & Audit
                </p>
                <h3 className={clsx('text-lg font-bold', isLight ? 'text-slate-800' : 'text-slate-100')}>
                  User Management Audit Logs
                </h3>
              </div>
            </div>
            <button
              type="button"
              className={clsx(
                'rounded-full p-2 transition-colors',
                isLight
                  ? 'text-slate-400 hover:bg-slate-200 hover:text-slate-700'
                  : 'text-zinc-400 hover:bg-white/10 hover:text-zinc-100'
              )}
              onClick={onClose}
              title="Close Audit Logs"
            >
              <X size={18} />
            </button>
          </div>

          {/* Filters & Search Toolbar */}
          <div
            className={clsx(
              'flex flex-wrap items-center justify-between gap-3 border-b px-6 py-3.5',
              isLight ? 'border-slate-200 bg-slate-100/70' : 'border-white/[0.08] bg-[#141417]'
            )}
          >
            <div className="relative flex-1 min-w-[220px]">
              <Search
                className={clsx(
                  'absolute left-3.5 top-1/2 -translate-y-1/2',
                  isLight ? 'text-slate-400' : 'text-slate-500'
                )}
                size={15}
              />
              <input
                type="text"
                className={clsx(
                  'w-full rounded-full border py-1.5 pl-9 pr-8 text-xs transition-all focus:outline-none focus:ring-2',
                  isLight
                    ? 'border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 shadow-sm'
                    : 'border-white/[0.08] bg-[#141417] text-zinc-100 placeholder-zinc-500 focus:border-zinc-700'
                )}
                placeholder="Search by Admin name, User name, or details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchLogs();
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    fetchLogs();
                  }}
                  className={clsx(
                    'absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-colors',
                    isLight ? 'text-slate-400 hover:bg-slate-200' : 'text-zinc-400 hover:bg-white/10'
                  )}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} className={isLight ? 'text-slate-500' : 'text-slate-400'} />
              <select
                className={clsx(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2',
                  isLight
                    ? 'border-slate-300 bg-white text-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20 shadow-sm'
                    : 'border-white/[0.08] bg-[#141417] text-zinc-200 focus:border-zinc-700'
                )}
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="all">All Actions</option>
                <option value="ROLE_CHANGE">Role Changes</option>
                <option value="STATUS_CHANGE">Status Changes</option>
                <option value="USER_CREATED">User Creations</option>
                <option value="USER_DEACTIVATED">Deactivations</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Content */}
          <div className="max-h-[calc(100vh-18rem)] min-h-[320px] overflow-y-auto p-6">
            {loading ? (
              <div
                className={clsx(
                  'flex h-64 flex-col items-center justify-center gap-2',
                  isLight ? 'text-slate-500' : 'text-slate-400'
                )}
              >
                <RefreshCw className="animate-spin" size={24} />
                <span className="text-xs font-medium">Fetching audit trail logs...</span>
              </div>
            ) : logs.length ? (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.audit_id}
                    className={clsx(
                      'group rounded-xl border p-4 transition-all duration-200',
                      isLight
                        ? 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-md shadow-slate-200/40'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                    )}
                  >
                    <div
                      className={clsx(
                        'flex flex-wrap items-center justify-between gap-2 border-b pb-2.5',
                        isLight ? 'border-slate-100' : 'border-white/5'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        {getActionBadge(log.action_type, isLight)}
                        <span
                          className={clsx(
                            'flex items-center gap-1 text-xs font-medium',
                            isLight ? 'text-slate-500' : 'text-slate-400'
                          )}
                        >
                          <Clock size={12} />
                          {formatDateTime(log.created_at)}
                        </span>
                      </div>
                      <div
                        className={clsx(
                          'text-xs font-mono font-semibold',
                          isLight ? 'text-slate-400' : 'text-slate-500'
                        )}
                      >
                        Log #{log.audit_id}
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p
                          className={clsx(
                            'text-[11px] uppercase tracking-wider font-semibold',
                            isLight ? 'text-slate-500' : 'text-slate-400'
                          )}
                        >
                          Performed By (Admin)
                        </p>
                        <p
                          className={clsx(
                            'mt-0.5 text-xs font-bold',
                            isLight ? 'text-slate-800' : 'text-slate-100'
                          )}
                        >
                          {log.actor_name || 'System Administrator'}
                        </p>
                        {log.actor_email && (
                          <p
                            className={clsx(
                              'text-[11px]',
                              isLight ? 'text-slate-500' : 'text-slate-400'
                            )}
                          >
                            {log.actor_email}
                          </p>
                        )}
                      </div>

                      <div>
                        <p
                          className={clsx(
                            'text-[11px] uppercase tracking-wider font-semibold',
                            isLight ? 'text-slate-500' : 'text-slate-400'
                          )}
                        >
                          Target User Affected
                        </p>
                        <p
                          className={clsx(
                            'mt-0.5 text-xs font-bold',
                            isLight ? 'text-cyan-700' : 'text-cyan-400'
                          )}
                        >
                          {log.target_name || 'User'}
                        </p>
                        {log.target_email && (
                          <p
                            className={clsx(
                              'text-[11px]',
                              isLight ? 'text-slate-500' : 'text-slate-400'
                            )}
                          >
                            {log.target_email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className={clsx(
                        'mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg p-2.5 text-xs',
                        isLight
                          ? 'bg-slate-100/80 border border-slate-200/80'
                          : 'bg-black/20'
                      )}
                    >
                      <p
                        className={clsx(
                          'font-medium',
                          isLight ? 'text-slate-800' : 'text-slate-200'
                        )}
                      >
                        {log.description}
                      </p>

                      {log.action_type === 'ROLE_CHANGE' && log.old_value && log.new_value && (
                        <div className="flex items-center gap-2 shrink-0">
                          {formatRolePill(log.old_value, isLight)}
                          <ArrowRight
                            size={12}
                            className={isLight ? 'text-slate-400' : 'text-slate-500'}
                          />
                          {formatRolePill(log.new_value, isLight)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={clsx(
                  'flex h-64 flex-col items-center justify-center text-center',
                  isLight ? 'text-slate-500' : 'text-slate-400'
                )}
              >
                <ShieldAlert size={36} className="mb-2 opacity-40" />
                <p className="text-sm font-semibold">No audit logs found</p>
                <p className="text-xs opacity-70">
                  {search || actionFilter !== 'all'
                    ? 'Try adjusting your search or filter parameters.'
                    : 'Role updates and user creations will be tracked here.'}
                </p>
              </div>
            )}
          </div>

          {/* Footer Pagination */}
          <div
            className={clsx(
              'flex flex-wrap items-center justify-between gap-3 border-t px-6 py-3 text-xs',
              isLight ? 'border-slate-200 bg-slate-50/90' : 'border-white/[0.08] bg-[#141417]'
            )}
          >
            <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
              Total <strong className={isLight ? 'text-slate-900' : 'text-slate-200'}>{totalLogs}</strong> audit entries recorded
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className={clsx(
                  'btn-secondary px-2.5 py-1 text-xs flex items-center gap-1',
                  isLight && 'border-slate-300 text-slate-700 hover:bg-slate-200'
                )}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span
                className={clsx(
                  'text-[11px] font-semibold tracking-wider px-1',
                  isLight ? 'text-slate-600' : 'text-slate-400'
                )}
              >
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className={clsx(
                  'btn-secondary px-2.5 py-1 text-xs flex items-center gap-1',
                  isLight && 'border-slate-300 text-slate-700 hover:bg-slate-200'
                )}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>,
    document.body
  );
};

export default UserAuditLogModal;
