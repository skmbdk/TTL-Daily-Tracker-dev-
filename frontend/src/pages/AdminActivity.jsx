import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MessageSquareText,
  RadioTower,
  RefreshCw,
  RotateCcw,
  Route,
  Search,
  Tag,
  User,
  Users,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getErrorMessage } from '../services/api';
import { dashboardService } from '../services/dashboardService';
import { connectSocket } from '../services/socket';
import clsx from 'clsx';

const initialFilters = {
  search: '',
  type: '',
  user: '',
  timeframe: 'all',
  customDate: ''
};

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const formatRelativeTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} Min Ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ${diffHr === 1 ? 'Hour' : 'Hours'} Ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} Days Ago`;
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
};

const formatFullDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  const dateStr = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
  const relativeStr = formatRelativeTime(value);
  return `${dateStr} (${relativeStr})`;
};

const formatDate = (value) => {
  if (!value) return 'No date';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));
};

const groupItemsByDate = (itemList) => {
  const groups = {};
  const now = new Date();
  const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toDateString();
  const yesterdayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toDateString();

  itemList.forEach((item) => {
    const d = new Date(item.changed_at || item.created_at);
    const dStr = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString();
    let groupKey = 'EARLIER';
    if (dStr === todayStr) {
      groupKey = 'TODAY';
    } else if (dStr === yesterdayStr) {
      groupKey = 'YESTERDAY';
    } else {
      groupKey = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d).toUpperCase();
    }
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(item);
  });

  return Object.entries(groups);
};

const AdminActivity = () => {
  const { isLight } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);

  // Collapse/Expand state for the 3 sections
  const [collapsedSections, setCollapsedSections] = useState({
    history: false,
    comments: false,
    overdue: false
  });

  const toggleSection = (key) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Pagination states for history panel and comments panel
  const [historyPage, setHistoryPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setHistoryPage(1);
    setCommentsPage(1);
  }, [filters]);

  const load = useCallback(async ({ showLoader = true } = {}) => {
    if (showLoader) setLoading(true);
    try {
      setData(await dashboardService.activity());
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return undefined;

    let refreshTimer;
    const refresh = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => load({ showLoader: false }), 400);
    };

    socket.on('task:changed', refresh);
    socket.on('notification:new', refresh);
    return () => {
      window.clearTimeout(refreshTimer);
      socket.off('task:changed', refresh);
      socket.off('notification:new', refresh);
    };
  }, [load]);

  const summary = data?.summary || {};
  const stats = useMemo(
    () => [
      { label: 'Open tasks', value: summary.open_tasks || 0, icon: Route, tone: 'cyan' },
      { label: 'Overdue', value: summary.overdue_tasks || 0, icon: AlertTriangle, tone: 'rose' },
      { label: 'Blocked', value: summary.blocked_tasks || 0, icon: Clock3, tone: 'amber' },
      { label: 'Active users', value: data?.active_users?.length || 0, icon: Users, tone: 'emerald' }
    ],
    [data?.active_users?.length, summary.blocked_tasks, summary.open_tasks, summary.overdue_tasks]
  );

  const availableUsers = useMemo(() => {
    const userSet = new Set();
    (data?.recent_activity || []).forEach((i) => {
      if (i.changed_by_name) userSet.add(i.changed_by_name);
    });
    (data?.recent_comments || []).forEach((i) => {
      if (i.author_name) userSet.add(i.author_name);
    });
    (data?.recent_remarks || []).forEach((i) => {
      if (i.author_name) userSet.add(i.author_name);
    });
    (data?.active_users || []).forEach((u) => {
      if (u.full_name) userSet.add(u.full_name);
    });
    return Array.from(userSet).sort();
  }, [data]);

  const filterItem = useCallback(
    (item, itemType) => {
      const timestamp = new Date(item.changed_at || item.created_at);
      const textContent = (
        (item.task_title || '') +
        ' ' +
        (item.change_description || '') +
        ' ' +
        (item.comment_text || '') +
        ' ' +
        (item.remark_text || '') +
        ' #' +
        (item.task_id || '')
      ).toLowerCase();

      const authorName = item.changed_by_name || item.author_name || 'System';

      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!textContent.includes(q) && !authorName.toLowerCase().includes(q)) {
          return false;
        }
      }

      if (filters.user) {
        if (authorName !== filters.user) return false;
      }

      if (filters.type) {
        if (filters.type === 'comments') {
          if (itemType !== 'message') return false;
        } else if (filters.type === 'status') {
          if (itemType !== 'history') return false;
          const desc = (item.change_description || '').toLowerCase();
          if (!desc.includes('status') && !desc.includes('moved')) return false;
        } else if (filters.type === 'assignment') {
          if (itemType !== 'history') return false;
          const desc = (item.change_description || '').toLowerCase();
          if (!desc.includes('assign')) return false;
        }
      }

      if (filters.timeframe && filters.timeframe !== 'all') {
        const now = new Date();
        if (filters.timeframe === 'today') {
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (timestamp < todayStart) return false;
        } else if (filters.timeframe === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (timestamp < weekAgo) return false;
        } else if (filters.timeframe === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (timestamp < monthAgo) return false;
        }
      }

      if (filters.customDate) {
        const targetDateStr = new Date(filters.customDate).toISOString().slice(0, 10);
        const itemDateStr = timestamp.toISOString().slice(0, 10);
        if (targetDateStr !== itemDateStr) return false;
      }

      return true;
    },
    [filters]
  );

  const filteredHistory = useMemo(() => {
    return (data?.recent_activity || []).filter((item) => filterItem(item, 'history'));
  }, [data?.recent_activity, filterItem]);

  const filteredComments = useMemo(() => {
    const combined = [...(data?.recent_comments || []), ...(data?.recent_remarks || [])]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return combined.filter((item) => filterItem(item, 'message'));
  }, [data?.recent_comments, data?.recent_remarks, filterItem]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, val]) => {
      if (key === 'timeframe') return val !== 'all';
      return Boolean(val);
    }).length;
  }, [filters]);

  const openTask = (taskId) => {
    if (taskId) navigate(`/tasks?taskId=${taskId}`);
  };

  // Paginated History
  const historyTotalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, historyPage, pageSize]);

  const groupedHistory = useMemo(() => {
    return groupItemsByDate(paginatedHistory);
  }, [paginatedHistory]);

  // Paginated Comments
  const commentsTotalPages = Math.max(1, Math.ceil(filteredComments.length / pageSize));
  const paginatedComments = useMemo(() => {
    const start = (commentsPage - 1) * pageSize;
    return filteredComments.slice(start, start + pageSize);
  }, [filteredComments, commentsPage, pageSize]);

  const groupedComments = useMemo(() => {
    return groupItemsByDate(paginatedComments);
  }, [paginatedComments]);

  const areAllCollapsed = collapsedSections.history && collapsedSections.comments && collapsedSections.overdue;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Activity Center</h2>
          <p className={`mt-1 text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Admin command view for changes, comments, risk, and live team movement.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-secondary flex items-center gap-1.5 text-xs"
            onClick={() => {
              setCollapsedSections({
                history: !areAllCollapsed,
                comments: !areAllCollapsed,
                overdue: !areAllCollapsed
              });
            }}
          >
            <ChevronDown size={14} className={clsx('transition-transform duration-200', areAllCollapsed && '-rotate-90')} />
            {areAllCollapsed ? 'Expand All' : 'Collapse All'}
          </button>

          <button className="btn-secondary flex items-center gap-2" onClick={() => load()} type="button">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <section className="glass-panel px-4 py-4" key={stat.label}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`text-xs font-bold uppercase tracking-[0.18em] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</p>
                <p className={`mt-2 text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{stat.value}</p>
              </div>
              <div className={`grid h-11 w-11 place-items-center rounded-xl border ${
                stat.tone === 'rose'
                  ? 'border-rose-400/25 bg-rose-400/10 text-rose-300'
                  : stat.tone === 'amber'
                    ? 'border-amber-400/25 bg-amber-400/10 text-amber-300'
                    : stat.tone === 'emerald'
                      ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                      : 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300'
              }`}>
                <stat.icon size={19} />
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Activity Filter Toolbar */}
      <div
        className={clsx(
          'rounded-2xl border p-3.5 transition-all duration-300 backdrop-blur-md space-y-3',
          isLight
            ? 'border-slate-200/80 bg-white/80 shadow-md shadow-slate-200/15'
            : 'border-white/[0.08] bg-[#141417] shadow-xl shadow-black/30'
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-64 sm:w-72 md:w-80 flex-shrink-0">
            <Search
              className={clsx('pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400')}
              size={16}
            />
            <input
              className={clsx(
                'w-full h-10 rounded-full border pl-10 pr-9 text-xs font-medium transition-all duration-200 outline-none placeholder:text-slate-400',
                isLight
                  ? 'border-slate-200 bg-slate-50/80 text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs'
                  : 'border-white/[0.08] bg-[#141417] text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700'
              )}
              placeholder="Search activity..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => setFilters((f) => ({ ...f, search: '' }))}
                className={clsx(
                  'absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-colors',
                  isLight ? 'text-slate-400 hover:bg-slate-200 hover:text-slate-700' : 'text-slate-400 hover:bg-white/10 hover:text-white'
                )}
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filters on Right */}
          <div className="flex flex-wrap items-center gap-2.5 ml-auto">
            <ActivitySelect
              icon={Tag}
              label="Type"
              value={filters.type}
              options={[
                { value: '', label: 'All Activity Types' },
                { value: 'status', label: 'Status Moves' },
                { value: 'comments', label: 'Comments & Remarks' },
                { value: 'assignment', label: 'Assignments' }
              ]}
              onChange={(val) => setFilters((f) => ({ ...f, type: val }))}
              onClear={() => setFilters((f) => ({ ...f, type: '' }))}
              isLight={isLight}
            />

            <ActivitySelect
              icon={User}
              label="User"
              value={filters.user}
              options={[
                { value: '', label: 'All Team Members' },
                ...availableUsers.map((u) => ({ value: u, label: u }))
              ]}
              onChange={(val) => setFilters((f) => ({ ...f, user: val }))}
              onClear={() => setFilters((f) => ({ ...f, user: '' }))}
              isLight={isLight}
            />

            <ActivitySelect
              icon={Clock3}
              label="Timeframe"
              value={filters.timeframe}
              options={[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'Past 7 Days' },
                { value: 'month', label: 'Past 30 Days' }
              ]}
              onChange={(val) => setFilters((f) => ({ ...f, timeframe: val }))}
              onClear={() => setFilters((f) => ({ ...f, timeframe: 'all' }))}
              isLight={isLight}
            />

            {/* Custom Date Filter */}
            <div className="relative min-w-[130px] max-w-[160px]">
              <div
                className={clsx(
                  'flex items-center gap-2 h-10 rounded-full border px-3 text-xs transition-all duration-200 relative',
                  filters.customDate
                    ? isLight
                      ? 'border-cyan-500/70 bg-cyan-50/90 text-cyan-900 font-semibold shadow-2xs'
                      : 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200 font-semibold'
                    : isLight
                    ? 'border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-white hover:border-slate-300'
                    : 'border-white/[0.08] bg-[#141417] text-zinc-300 hover:border-white/20'
                )}
              >
                <Calendar size={14} className={filters.customDate ? (isLight ? 'text-cyan-600' : 'text-cyan-400') : 'text-slate-400'} />
                <input
                  type="date"
                  className="w-full bg-transparent outline-none cursor-pointer text-xs"
                  value={filters.customDate}
                  onChange={(e) => setFilters((f) => ({ ...f, customDate: e.target.value }))}
                  title="Filter by exact date"
                />
                {filters.customDate && (
                  <button
                    type="button"
                    onClick={() => setFilters((f) => ({ ...f, customDate: '' }))}
                    className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white ml-1 shrink-0"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Reset Button */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => setFilters(initialFilters)}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-3.5 h-10 rounded-full text-xs font-semibold border transition-all duration-200 active:scale-95 cursor-pointer',
                  isLight
                    ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-2xs'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                )}
                title="Reset activity filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Activity Grid */}
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr] items-start">
        {/* Section 1: Recent task movement */}
        <section className={clsx("glass-panel overflow-hidden transition-all duration-300", collapsedSections.history ? "h-auto" : "flex flex-col justify-between min-h-[300px]")}>
          <div>
            <button
              type="button"
              onClick={() => toggleSection('history')}
              className={clsx(
                'w-full flex items-center justify-between px-4 py-3.5 select-none cursor-pointer text-left transition-colors',
                !collapsedSections.history && (isLight ? 'border-b border-slate-200/90' : 'border-b border-white/10'),
                isLight ? 'hover:bg-slate-50/60' : 'hover:bg-white/[0.02]'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
                  <RadioTower size={17} />
                </span>
                <h3 className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Recent task movement</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/10 border-white/10 text-slate-300'}`}>
                  {filteredHistory.length}
                </span>
                <ChevronDown size={18} className={clsx('transition-transform duration-200', isLight ? 'text-slate-500' : 'text-slate-400', collapsedSections.history && '-rotate-90')} />
              </div>
            </button>

            {!collapsedSections.history && (
              <div className={clsx('divide-y', isLight ? 'divide-slate-200/70' : 'divide-white/10')}>
                {loading ? (
                  <p className={`px-4 py-8 text-center text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Loading activity...</p>
                ) : groupedHistory.length ? (
                  groupedHistory.map(([dateGroup, items]) => (
                    <div key={dateGroup}>
                      {/* Date Group Timeline Divider */}
                      <div className="relative flex items-center justify-center py-2 px-4">
                        <div className="absolute inset-0 flex items-center px-4" aria-hidden="true">
                          <div className={clsx('w-full border-t', isLight ? 'border-slate-300/90' : 'border-white/15')} />
                        </div>
                        <div className={clsx(
                          'relative px-3 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded-full border shadow-2xs',
                          isLight
                            ? 'bg-slate-100/90 border-slate-300 text-slate-600'
                            : 'bg-[#18181b] border-white/20 text-slate-300'
                        )}>
                          {dateGroup}
                        </div>
                        </div>

                      {/* Timeline items for this date group */}
                      {items.map((item, index) => {
                        const authorName = item.changed_by_name || 'System';
                        const desc = item.change_description || '';
                        const isStatusMove = desc.toLowerCase().includes('status') || desc.toLowerCase().includes('moved');
                        const isAssign = desc.toLowerCase().includes('assign');

                        return (
                          <button
                            className="w-full px-4 py-3 text-left transition hover:bg-white/[0.04] flex items-start gap-3.5 group cursor-pointer"
                            key={`h-${item.history_id || index}`}
                            onClick={() => openTask(item.task_id)}
                            type="button"
                          >
                            {/* Avatar Circle */}
                            <div className={clsx(
                              'flex h-9 w-9 items-center justify-center rounded-full font-bold text-xs shrink-0 border mt-0.5 shadow-2xs',
                              isLight
                                ? 'bg-indigo-50 border-indigo-200/80 text-indigo-700'
                                : 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300'
                            )}>
                              {getInitials(authorName)}
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className={`text-sm font-semibold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                  #{item.task_id} {item.task_title || 'Task Update'}
                                </p>
                                <span
                                  className={clsx(
                                    'text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0',
                                    isStatusMove
                                      ? isLight ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-indigo-500/30 bg-indigo-500/15 text-indigo-300'
                                      : isAssign
                                      ? isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                                      : isLight ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-white/10 bg-white/10 text-slate-300'
                                  )}
                                >
                                  {isStatusMove ? 'Status Move' : isAssign ? 'Assignment' : 'Update'}
                                </span>
                              </div>
                              <p className={`line-clamp-2 text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                                <span className="font-semibold">{authorName}</span> {desc}
                              </p>
                              {/* Timestamp: Exact log time & relative time */}
                              <p className={`text-[11px] font-medium flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                <Clock3 size={11} />
                                <span>{formatFullDateTime(item.changed_at)}</span>
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <p className={`px-4 py-8 text-center text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>No task activity matches current filters.</p>
                )}
              </div>
            )}
          </div>

          {/* History Pagination Bar */}
          {!collapsedSections.history && filteredHistory.length > pageSize && (
            <div className={clsx('border-t px-4 py-2.5 flex items-center justify-between text-xs', isLight ? 'border-slate-200/80' : 'border-white/10')}>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                Showing {(historyPage - 1) * pageSize + 1} - {Math.min(historyPage * pageSize, filteredHistory.length)} of {filteredHistory.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={historyPage === 1}
                  onClick={() => setHistoryPage((p) => Math.max(p - 1, 1))}
                  className={clsx('px-2.5 py-1 rounded-full border text-xs font-semibold disabled:opacity-40 cursor-pointer', isLight ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10')}
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="font-semibold px-1">{historyPage} / {historyTotalPages}</span>
                <button
                  type="button"
                  disabled={historyPage >= historyTotalPages}
                  onClick={() => setHistoryPage((p) => Math.min(p + 1, historyTotalPages))}
                  className={clsx('px-2.5 py-1 rounded-full border text-xs font-semibold disabled:opacity-40 cursor-pointer', isLight ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10')}
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Comments and remarks */}
        <section className={clsx("glass-panel overflow-hidden transition-all duration-300", collapsedSections.comments ? "h-auto" : "flex flex-col justify-between min-h-[300px]")}>
          <div>
            <button
              type="button"
              onClick={() => toggleSection('comments')}
              className={clsx(
                'w-full flex items-center justify-between px-4 py-3.5 select-none cursor-pointer text-left transition-colors',
                !collapsedSections.comments && (isLight ? 'border-b border-slate-200/90' : 'border-b border-white/10'),
                isLight ? 'hover:bg-slate-50/60' : 'hover:bg-white/[0.02]'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-indigo-400/25 bg-indigo-400/10 text-indigo-300">
                  <MessageSquareText size={17} />
                </span>
                <h3 className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Comments and remarks</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/10 border-white/10 text-slate-300'}`}>
                  {filteredComments.length}
                </span>
                <ChevronDown size={18} className={clsx('transition-transform duration-200', isLight ? 'text-slate-500' : 'text-slate-400', collapsedSections.comments && '-rotate-90')} />
              </div>
            </button>

            {!collapsedSections.comments && (
              <div className={clsx('divide-y', isLight ? 'divide-slate-200/70' : 'divide-white/10')}>
                {loading ? (
                  <p className={`px-4 py-8 text-center text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Loading comments...</p>
                ) : groupedComments.length ? (
                  groupedComments.map(([dateGroup, items]) => (
                    <div key={dateGroup}>
                      {/* Date Group Timeline Divider */}
                      <div className="relative flex items-center justify-center py-2 px-4">
                        <div className="absolute inset-0 flex items-center px-4" aria-hidden="true">
                          <div className={clsx('w-full border-t', isLight ? 'border-slate-300/90' : 'border-white/15')} />
                        </div>
                        <div className={clsx(
                          'relative px-3 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded-full border shadow-2xs',
                          isLight
                            ? 'bg-slate-100/90 border-slate-300 text-slate-600'
                            : 'bg-[#18181b] border-white/20 text-slate-300'
                        )}>
                          {dateGroup}
                        </div>
                      </div>

                      {/* Timeline items for this date group */}
                      {items.map((item, index) => {
                        const authorName = item.author_name || 'System';
                        const commentBody = item.comment_text || item.remark_text || '';

                        return (
                          <button
                            className="w-full px-4 py-3 text-left transition hover:bg-white/[0.04] flex items-start gap-3.5 group cursor-pointer"
                            key={`c-${item.comment_id || item.remark_id || index}`}
                            onClick={() => openTask(item.task_id)}
                            type="button"
                          >
                            {/* Avatar Circle */}
                            <div className={clsx(
                              'flex h-9 w-9 items-center justify-center rounded-full font-bold text-xs shrink-0 border mt-0.5 shadow-2xs',
                              isLight
                                ? 'bg-cyan-50 border-cyan-200/80 text-cyan-700'
                                : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                            )}>
                              {getInitials(authorName)}
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className={`text-sm font-semibold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                  #{item.task_id} {item.task_title || 'Task Discussion'}
                                </p>
                                <span
                                  className={clsx(
                                    'text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0',
                                    isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-700' : 'border-cyan-500/30 bg-cyan-500/15 text-cyan-300'
                                  )}
                                >
                                  {item.remark_id ? 'Remark' : 'Comment'}
                                </span>
                              </div>
                              <p className={`line-clamp-2 text-xs leading-relaxed italic ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                                "<span className="font-semibold not-italic">{authorName}:</span> {commentBody}"
                              </p>
                              {/* Timestamp: Exact log time & relative time */}
                              <p className={`text-[11px] font-medium flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                <Clock3 size={11} />
                                <span>{formatFullDateTime(item.created_at)}</span>
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <p className={`px-4 py-8 text-center text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>No comments match current filters.</p>
                )}
              </div>
            )}
          </div>

          {/* Comments Pagination Bar */}
          {!collapsedSections.comments && filteredComments.length > pageSize && (
            <div className={clsx('border-t px-4 py-2.5 flex items-center justify-between text-xs', isLight ? 'border-slate-200/80' : 'border-white/10')}>
              <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                Showing {(commentsPage - 1) * pageSize + 1} - {Math.min(commentsPage * pageSize, filteredComments.length)} of {filteredComments.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={commentsPage === 1}
                  onClick={() => setCommentsPage((p) => Math.max(p - 1, 1))}
                  className={clsx('px-2.5 py-1 rounded-full border text-xs font-semibold disabled:opacity-40 cursor-pointer', isLight ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10')}
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="font-semibold px-1">{commentsPage} / {commentsTotalPages}</span>
                <button
                  type="button"
                  disabled={commentsPage >= commentsTotalPages}
                  onClick={() => setCommentsPage((p) => Math.min(p + 1, commentsTotalPages))}
                  className={clsx('px-2.5 py-1 rounded-full border text-xs font-semibold disabled:opacity-40 cursor-pointer', isLight ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10')}
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Section 3: Overdue focus queue */}
      <section className={clsx("glass-panel overflow-hidden transition-all duration-300", collapsedSections.overdue ? "h-auto" : "block")}>
        <button
          type="button"
          onClick={() => toggleSection('overdue')}
          className={clsx(
            'w-full flex items-center justify-between px-4 py-3 select-none cursor-pointer text-left transition-colors',
            !collapsedSections.overdue && (isLight ? 'border-b border-slate-200/90' : 'border-b border-white/10'),
            isLight ? 'hover:bg-slate-50/60' : 'hover:bg-white/[0.02]'
          )}
        >
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-rose-400/25 bg-rose-400/10 text-rose-300">
              <AlertTriangle size={17} />
            </span>
            <h3 className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Overdue focus queue</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
              {(data?.overdue_tasks || []).length} Urgent
            </span>
            <ChevronDown size={18} className={clsx('transition-transform duration-200', isLight ? 'text-slate-500' : 'text-slate-400', collapsedSections.overdue && '-rotate-90')} />
          </div>
        </button>

        {!collapsedSections.overdue && (
          <div className={clsx('divide-y', isLight ? 'divide-slate-200/70' : 'divide-white/10')}>
            {(data?.overdue_tasks || []).length ? (
              data.overdue_tasks.map((task) => (
                <button
                  className="flex w-full flex-col gap-2 px-4 py-3.5 text-left transition hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between cursor-pointer"
                  key={task.task_id}
                  onClick={() => openTask(task.task_id)}
                  type="button"
                >
                  <div className="min-w-0">
                    <p className={`font-semibold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>#{task.task_id} {task.task_title}</p>
                    <p className={`mt-0.5 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {task.project_name || 'No project'} · {task.assigned_user_name || 'Unassigned'}
                    </p>
                  </div>
                  <span className="border border-rose-400/30 bg-rose-400/10 text-rose-300 text-xs px-2.5 py-0.5 rounded-full shrink-0 font-semibold">{formatDate(task.due_date)}</span>
                </button>
              ))
            ) : (
              <p className={`px-4 py-8 text-center text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>No overdue tasks right now.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

const ActivitySelect = ({ icon: Icon, label, value, options, onChange, onClear, isLight }) => {
  const isSelected = Boolean(value) && value !== 'all';

  return (
    <div className="relative min-w-[130px] max-w-[160px]">
      <div
        className={clsx(
          'flex items-center gap-2 h-10 rounded-full border px-3 text-xs transition-all duration-200 relative',
          isSelected
            ? isLight
              ? 'border-indigo-500/70 bg-indigo-50/90 text-indigo-900 font-semibold shadow-2xs ring-1 ring-indigo-500/20'
              : 'border-white/20 bg-white/[0.08] text-zinc-100 font-semibold ring-1 ring-white/10'
            : isLight
            ? 'border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-white hover:border-slate-300'
            : 'border-white/[0.08] bg-[#141417] text-zinc-300 hover:border-white/20'
        )}
      >
        <Icon size={14} className={isSelected ? (isLight ? 'text-indigo-600' : 'text-zinc-200') : 'text-zinc-500'} />
        <select
          className="w-full bg-transparent outline-none cursor-pointer text-xs pr-4 appearance-none font-medium text-ellipsis overflow-hidden whitespace-nowrap"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className={isLight ? 'bg-white text-slate-800' : 'bg-[#18181b] text-zinc-100'}
            >
              {opt.label}
            </option>
          ))}
        </select>

        {isSelected ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            title={`Clear ${label} filter`}
          >
            <X size={12} />
          </button>
        ) : (
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 text-slate-400" />
        )}
      </div>
    </div>
  );
};

export default AdminActivity;
