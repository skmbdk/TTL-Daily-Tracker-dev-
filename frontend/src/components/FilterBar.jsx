import { useMemo, useState, useRef, useEffect } from 'react';
import { Search, RotateCcw, X, CheckCircle2, Layers, Flame, FolderGit2, User, MapPin, Calendar, Filter, ChevronDown, Gauge, Briefcase } from 'lucide-react';
import { TASK_LOCATIONS, TASK_MODULES, TASK_PRIORITIES, TASK_STATUSES } from '../constants/taskOptions';
import { useTheme } from '../context/ThemeContext';
import { groupProjectsByParent } from '../utils/projectGrouping';
import clsx from 'clsx';

const FilterBar = ({
  filters,
  onChange,
  users = [],
  projects = [],
  showUsers = false,
  showPriority = true,
  showProjects = true,
  singleDate = false,
  onReset
}) => {
  const { isLight } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const update = (key, value) => onChange({ ...filters, [key]: value });
  const updateSingleDate = (value) => onChange({ ...filters, date: value, date_from: '', date_to: '' });

  const clearField = (key, e) => {
    if (e) e.stopPropagation();
    if (key === 'date') {
      onChange({ ...filters, date: '', date_from: '', date_to: '' });
    } else {
      update(key, '');
    }
  };

  const projectGroups = useMemo(() => groupProjectsByParent(projects), [projects]);
  const parentProjects = useMemo(() => projects.filter((p) => !p.parent_project_id), [projects]);

  const activeFilters = useMemo(() => {
    const list = [];
    if (filters.status) {
      list.push({ key: 'status', label: 'Status', value: filters.status });
    }
    if (filters.module_name || filters.module) {
      list.push({ key: 'module_name', label: 'Stream', value: filters.module_name || filters.module });
    }
    if (filters.priority) {
      list.push({ key: 'priority', label: 'Priority', value: filters.priority });
    }
    if (filters.parent_project_id) {
      const found = parentProjects.find((p) => String(p.project_id) === String(filters.parent_project_id));
      list.push({ key: 'parent_project_id', label: 'Parent', value: found?.project_name || 'Parent Project' });
    }
    if (filters.project_id) {
      const found = projects.find((p) => String(p.project_id) === String(filters.project_id));
      list.push({ key: 'project_id', label: 'Project', value: found?.project_name || 'Project' });
    }
    if (filters.user_id) {
      const found = users.find((u) => String(u.user_id) === String(filters.user_id));
      list.push({ key: 'user_id', label: 'Assigned', value: found?.full_name || 'User' });
    }
    if (filters.onsite_offshore) {
      list.push({ key: 'onsite_offshore', label: 'Location', value: filters.onsite_offshore });
    }
    if (filters.story_points) {
      list.push({ key: 'story_points', label: 'Points', value: `${filters.story_points} Pts` });
    }
    if (filters.date) {
      list.push({ key: 'date', label: 'Date', value: filters.date });
    }
    if (filters.date_from || filters.date_to) {
      list.push({ key: 'date_from', label: 'Dates', value: `${filters.date_from || ''} - ${filters.date_to || ''}` });
    }
    return list;
  }, [filters, parentProjects, projects, users]);

  const activeCount = activeFilters.length + (filters.search ? 1 : 0);

  return (
    <div
      className={clsx(
        'rounded-2xl border p-3 backdrop-blur-md transition-all duration-300 relative z-30',
        isLight
          ? 'border-slate-200/80 bg-white/80 shadow-md shadow-slate-200/15'
          : 'border-white/[0.08] bg-[#141417] shadow-xl shadow-black/30'
      )}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search Bar Input (LEFT SIDE) */}
        <div className="relative min-w-[200px] max-w-xs flex-1">
          <Search
            className={clsx(
              'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors',
              isLight ? 'text-slate-400' : 'text-slate-400'
            )}
            size={15}
          />
          <input
            className={clsx(
              'w-full h-10 rounded-full border pl-10 pr-9 text-xs font-medium transition-all duration-200 outline-none placeholder:text-slate-400',
              isLight
                ? 'border-slate-200 bg-slate-50/80 text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs'
                : 'border-white/[0.08] bg-[#141417] text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700'
            )}
            placeholder="Search tasks by title..."
            value={filters.search || ''}
            onChange={(event) => update('search', event.target.value)}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => update('search', '')}
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

        {/* RIGHT SIDE GROUP: Minimal Filters Button & Active Filter Pills */}
        <div className="flex items-center gap-2.5 flex-wrap ml-auto">
          {/* Minimal Filter Dropdown Toggle Button */}
          <div className="relative z-50" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className={clsx(
                'inline-flex items-center gap-2 h-10 px-4 rounded-full border text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs',
                activeFilters.length > 0
                  ? isLight
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30'
                  : isLight
                  ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:border-slate-300'
                  : 'border-white/[0.08] bg-[#141417] text-zinc-200 hover:border-white/20'
              )}
            >
              <Filter size={15} className={activeFilters.length > 0 ? (isLight ? 'text-indigo-600' : 'text-indigo-400') : 'text-slate-400'} />
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <span className="ml-0.5 rounded-full bg-indigo-600 text-white px-2 py-0.5 text-[10px] font-bold">
                  {activeFilters.length}
                </span>
              )}
              <ChevronDown size={14} className={clsx('transition-transform duration-200 ml-0.5', isOpen && 'rotate-180')} />
            </button>

            {/* Minimal Nested Popover Menu */}
            {isOpen && (
              <div
                className={clsx(
                  'absolute right-0 top-full mt-2 z-[100] w-80 sm:w-96 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all space-y-4 animate-in fade-in slide-in-from-top-2 duration-200',
                  isLight
                    ? 'border-slate-200 bg-white text-slate-800 shadow-slate-300/50'
                    : 'border-white/10 bg-[#18181b] text-zinc-100 shadow-black/80'
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-3 border-inherit">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-indigo-500" />
                    <span className="font-bold text-sm tracking-wide">Filter Task Management</span>
                  </div>
                  {activeFilters.length > 0 && (
                    <button
                      type="button"
                      onClick={onReset}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      Reset all
                    </button>
                  )}
                </div>

                {/* Categorized Nested Filters */}
                <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                  {/* 1. Projects & Hierarchy */}
                  {showProjects && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                        <FolderGit2 size={13} /> Projects & Hierarchy
                      </span>
                      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                        {/* Parent Project */}
                        {parentProjects.length > 0 && (
                          <label className="block">
                            <span className="text-[11px] text-slate-400 font-medium mb-1 block">Parent Project</span>
                            <select
                              value={filters.parent_project_id || ''}
                              onChange={(e) => update('parent_project_id', e.target.value)}
                              className={clsx(
                                'w-full h-9 rounded-xl border px-2.5 text-xs font-medium outline-none cursor-pointer',
                                isLight
                                  ? 'border-slate-200 bg-slate-50 text-slate-800'
                                  : 'border-white/10 bg-[#121215] text-zinc-200'
                              )}
                            >
                              <option value="">All Parents</option>
                              {parentProjects.map((p) => (
                                <option key={p.project_id} value={p.project_id}>
                                  {p.project_name}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}

                        {/* Sub / Grouped Projects */}
                        <label className="block">
                          <span className="text-[11px] text-slate-400 font-medium mb-1 block">Project</span>
                          <select
                            value={filters.project_id || ''}
                            onChange={(e) => update('project_id', e.target.value)}
                            className={clsx(
                              'w-full h-9 rounded-xl border px-2.5 text-xs font-medium outline-none cursor-pointer',
                              isLight
                                ? 'border-slate-200 bg-slate-50 text-slate-800'
                                : 'border-white/10 bg-[#121215] text-zinc-200'
                            )}
                          >
                            <option value="">All Projects</option>
                            {projectGroups.groups.map((group) => (
                              <optgroup key={group.parentName} label={`── ${group.parentName.toUpperCase()} ──`}>
                                {group.subProjects.map((sp) => (
                                  <option key={sp.project_id} value={sp.project_id}>
                                    {sp.project_name}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                            {projectGroups.topLevel.length > 0 && (
                              <optgroup label="── OTHER PROJECTS ──">
                                {projectGroups.topLevel.map((p) => (
                                  <option key={p.project_id} value={p.project_id}>
                                    {p.project_name}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 2. Status, Stream & Priority */}
                  <div className="space-y-2 border-t pt-3 border-inherit">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                      <Layers size={13} /> Status & Priority
                    </span>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
                      {/* Status */}
                      <label className="block">
                        <span className="text-[11px] text-slate-400 font-medium mb-1 block">Status</span>
                        <select
                          value={filters.status || ''}
                          onChange={(e) => update('status', e.target.value)}
                          className={clsx(
                            'w-full h-9 rounded-xl border px-2 text-xs font-medium outline-none cursor-pointer',
                            isLight
                              ? 'border-slate-200 bg-slate-50 text-slate-800'
                              : 'border-white/10 bg-[#121215] text-zinc-200'
                          )}
                        >
                          <option value="">All Statuses</option>
                          {TASK_STATUSES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </label>

                      {/* Stream */}
                      <label className="block">
                        <span className="text-[11px] text-slate-400 font-medium mb-1 block">Stream</span>
                        <select
                          value={filters.module_name || filters.module || ''}
                          onChange={(e) => {
                            update('module_name', e.target.value);
                            update('module', e.target.value);
                          }}
                          className={clsx(
                            'w-full h-9 rounded-xl border px-2 text-xs font-medium outline-none cursor-pointer',
                            isLight
                              ? 'border-slate-200 bg-slate-50 text-slate-800'
                              : 'border-white/10 bg-[#121215] text-zinc-200'
                          )}
                        >
                          <option value="">All Streams</option>
                          {TASK_MODULES.map((mod) => (
                            <option key={mod} value={mod}>{mod}</option>
                          ))}
                        </select>
                      </label>

                      {/* Priority */}
                      {showPriority && (
                        <label className="block">
                          <span className="text-[11px] text-slate-400 font-medium mb-1 block">Priority</span>
                          <select
                            value={filters.priority || ''}
                            onChange={(e) => update('priority', e.target.value)}
                            className={clsx(
                              'w-full h-9 rounded-xl border px-2 text-xs font-medium outline-none cursor-pointer',
                              isLight
                                ? 'border-slate-200 bg-slate-50 text-slate-800'
                                : 'border-white/10 bg-[#121215] text-zinc-200'
                            )}
                          >
                            <option value="">All Priorities</option>
                            {TASK_PRIORITIES.map((prio) => (
                              <option key={prio} value={prio}>{prio}</option>
                            ))}
                          </select>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* 3. Assignee, Location & Story Points */}
                  <div className="space-y-2 border-t pt-3 border-inherit">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                      <User size={13} /> Assignee & Attributes
                    </span>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
                      {/* Assignee */}
                      {showUsers && (
                        <label className="block">
                          <span className="text-[11px] text-slate-400 font-medium mb-1 block">Assigned</span>
                          <select
                            value={filters.user_id || ''}
                            onChange={(e) => update('user_id', e.target.value)}
                            className={clsx(
                              'w-full h-9 rounded-xl border px-2 text-xs font-medium outline-none cursor-pointer',
                              isLight
                                ? 'border-slate-200 bg-slate-50 text-slate-800'
                                : 'border-white/10 bg-[#121215] text-zinc-200'
                            )}
                          >
                            <option value="">All Users</option>
                            {users.map((user) => (
                              <option key={user.user_id} value={user.user_id}>{user.full_name}</option>
                            ))}
                          </select>
                        </label>
                      )}

                      {/* Location */}
                      <label className="block">
                        <span className="text-[11px] text-slate-400 font-medium mb-1 block">Location</span>
                        <select
                          value={filters.onsite_offshore || ''}
                          onChange={(e) => update('onsite_offshore', e.target.value)}
                          className={clsx(
                            'w-full h-9 rounded-xl border px-2 text-xs font-medium outline-none cursor-pointer',
                            isLight
                              ? 'border-slate-200 bg-slate-50 text-slate-800'
                              : 'border-white/10 bg-[#121215] text-zinc-200'
                          )}
                        >
                          <option value="">All Locations</option>
                          {TASK_LOCATIONS.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                      </label>

                      {/* Story Points */}
                      <label className="block">
                        <span className="text-[11px] text-slate-400 font-medium mb-1 block">Points</span>
                        <select
                          value={filters.story_points || ''}
                          onChange={(e) => update('story_points', e.target.value)}
                          className={clsx(
                            'w-full h-9 rounded-xl border px-2 text-xs font-medium outline-none cursor-pointer',
                            isLight
                              ? 'border-slate-200 bg-slate-50 text-slate-800'
                              : 'border-white/10 bg-[#121215] text-zinc-200'
                          )}
                        >
                          <option value="">All Points</option>
                          {['1', '2', '3', '5', '8', '13'].map((pts) => (
                            <option key={pts} value={pts}>{pts} pts</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>

                  {/* 4. Dates */}
                  <div className="space-y-2 border-t pt-3 border-inherit">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                      <Calendar size={13} /> Dates
                    </span>
                    {singleDate ? (
                      <label className="block">
                        <span className="text-[11px] text-slate-400 font-medium mb-1 block">Completion Date</span>
                        <input
                          type="date"
                          value={filters.date || ''}
                          onChange={(e) => updateSingleDate(e.target.value)}
                          className={clsx(
                            'w-full h-9 rounded-xl border px-3 text-xs outline-none cursor-pointer',
                            isLight
                              ? 'border-slate-200 bg-slate-50 text-slate-800'
                              : 'border-white/10 bg-[#121215] text-zinc-200'
                          )}
                        />
                      </label>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <label className="block">
                          <span className="text-[11px] text-slate-400 font-medium mb-1 block">From Date</span>
                          <input
                            type="date"
                            value={filters.date_from || ''}
                            onChange={(e) => update('date_from', e.target.value)}
                            className={clsx(
                              'w-full h-9 rounded-xl border px-2 text-xs outline-none cursor-pointer',
                              isLight
                                ? 'border-slate-200 bg-slate-50 text-slate-800'
                                : 'border-white/10 bg-[#121215] text-zinc-200'
                            )}
                          />
                        </label>
                        <label className="block">
                          <span className="text-[11px] text-slate-400 font-medium mb-1 block">To Date</span>
                          <input
                            type="date"
                            value={filters.date_to || ''}
                            onChange={(e) => update('date_to', e.target.value)}
                            className={clsx(
                              'w-full h-9 rounded-xl border px-2 text-xs outline-none cursor-pointer',
                              isLight
                                ? 'border-slate-200 bg-slate-50 text-slate-800'
                                : 'border-white/10 bg-[#121215] text-zinc-200'
                            )}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Popover Footer */}
                <div className="border-t pt-3 border-inherit flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    style={{ color: '#ffffff' }}
                    className={clsx(
                      'px-6 py-2 rounded-full text-xs font-semibold force-text-white !text-white border-0 transition-all shadow-md active:scale-95 cursor-pointer',
                      isLight
                        ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
                        : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30'
                    )}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Filter Pill Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {activeFilters.map((item) => (
              <span
                key={item.key}
                className={clsx(
                  'inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-all animate-in fade-in zoom-in-95 duration-150',
                  isLight
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-900 shadow-2xs'
                    : 'border-indigo-500/30 bg-indigo-500/15 text-indigo-200'
                )}
              >
                <span className="text-[10px] uppercase font-bold opacity-60">{item.label}:</span>
                <span className="font-semibold">{item.value}</span>
                <button
                  type="button"
                  onClick={(e) => clearField(item.key, e)}
                  className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/20 transition-colors ml-0.5 cursor-pointer"
                  title={`Remove ${item.label} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {activeCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className={clsx(
                  'inline-flex items-center gap-1 px-3 h-8 rounded-full text-xs font-semibold border transition-all cursor-pointer',
                  isLight
                    ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                )}
                title="Reset all filters"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
