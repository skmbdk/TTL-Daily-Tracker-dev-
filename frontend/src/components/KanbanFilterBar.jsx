import { useMemo, useState, useRef, useEffect } from 'react';
import { Search, X, RotateCcw, Filter, ChevronDown, Layers, FolderGit2, User, Flame, Gauge, Calendar } from 'lucide-react';
import { TASK_MODULES, TASK_PRIORITIES } from '../constants/taskOptions';
import { groupProjectsByParent } from '../utils/projectGrouping';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

export const DUE_DATE_OPTIONS = {
  ALL: 'All',
  OVERDUE: 'Overdue',
  DUE_THIS_WEEK: 'Due this week',
};

const KanbanFilterBar = ({
  filters,
  onFilterChange,
  users = [],
  projects = [],
  swimlaneBy = 'None',
  onSwimlaneChange,
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

  const handleInputChange = (name, value) => {
    onFilterChange({ ...filters, [name]: value });
  };

  const clearSearch = () => {
    onFilterChange({ ...filters, searchTerm: '' });
  };

  const removeSingleFilter = (key) => {
    if (key === 'dueDate') {
      onFilterChange({ ...filters, dueDate: DUE_DATE_OPTIONS.ALL });
    } else {
      onFilterChange({ ...filters, [key]: '' });
    }
  };

  const projectGroups = useMemo(() => groupProjectsByParent(projects), [projects]);
  const parentProjects = useMemo(() => projects.filter((p) => !p.parent_project_id), [projects]);

  const activeFilters = useMemo(() => {
    const list = [];
    if (filters.parentProjectId) {
      const found = parentProjects.find((p) => String(p.project_id) === String(filters.parentProjectId));
      list.push({ key: 'parentProjectId', label: 'Parent', value: found?.project_name || 'Parent Project' });
    }
    if (filters.projectId) {
      const found = projects.find((p) => String(p.project_id) === String(filters.projectId));
      list.push({ key: 'projectId', label: 'Project', value: found?.project_name || 'Project' });
    }
    if (filters.module) {
      list.push({ key: 'module', label: 'Stream', value: filters.module });
    }
    if (filters.priority) {
      list.push({ key: 'priority', label: 'Priority', value: filters.priority });
    }
    if (filters.assignee) {
      list.push({ key: 'assignee', label: 'Assignee', value: filters.assignee });
    }
    if (filters.storyPoints) {
      list.push({ key: 'storyPoints', label: 'Points', value: `${filters.storyPoints} Pts` });
    }
    if (filters.dueDate && filters.dueDate !== DUE_DATE_OPTIONS.ALL) {
      list.push({ key: 'dueDate', label: 'Due Date', value: filters.dueDate });
    }
    return list;
  }, [filters, parentProjects, projects]);

  const activeCount = activeFilters.length + (filters.searchTerm ? 1 : 0);

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
          <input
            type="text"
            name="searchTerm"
            placeholder="Search tasks in board..."
            value={filters.searchTerm || ''}
            onChange={(e) => handleInputChange('searchTerm', e.target.value)}
            className={clsx(
              'w-full h-10 rounded-full border pl-10 pr-9 text-xs font-medium outline-none transition-all duration-200 placeholder:text-slate-400',
              isLight
                ? 'border-slate-200 bg-slate-50/80 text-slate-800 focus:bg-white focus:border-indigo-500'
                : 'border-white/[0.08] bg-[#141417] text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700'
            )}
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          {filters.searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* RIGHT SIDE GROUP: Minimal Filter Dropdown, Swimlane, Active Pills */}
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
                    <span className="font-bold text-sm tracking-wide">Filter Board Tasks</span>
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
                            value={filters.parentProjectId || ''}
                            onChange={(e) => handleInputChange('parentProjectId', e.target.value)}
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
                          value={filters.projectId || ''}
                          onChange={(e) => handleInputChange('projectId', e.target.value)}
                          className={clsx(
                            'w-full h-9 rounded-xl border px-2.5 text-xs font-medium outline-none cursor-pointer',
                            isLight
                              ? 'border-slate-200 bg-slate-50 text-slate-800'
                              : 'border-white/10 bg-[#121215] text-zinc-200'
                          )}
                        >
                          <option value="">All Projects</option>
                          {projectGroups.groups.map((group) => (
                            <optgroup
                              key={group.parentName}
                              label={`── ${group.parentName.toUpperCase()} ──`}
                              className={isLight ? 'bg-slate-100 text-slate-600 font-bold' : 'bg-[#18181b] text-zinc-400 font-bold'}
                              style={{ backgroundColor: isLight ? '#f1f5f9' : '#18181b', color: isLight ? '#475569' : '#a1a1aa' }}
                            >
                              {group.subProjects.map((sp) => (
                                <option
                                  key={sp.project_id}
                                  value={sp.project_id}
                                  className={isLight ? 'bg-white text-slate-900' : 'bg-[#1c1c20] text-zinc-100'}
                                  style={{ backgroundColor: isLight ? '#ffffff' : '#1c1c20', color: isLight ? '#0f172a' : '#f4f4f5' }}
                                >
                                  {sp.project_name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                          {projectGroups.topLevel.length > 0 && (
                            <optgroup
                              label="── OTHER PROJECTS ──"
                              className={isLight ? 'bg-slate-100 text-slate-600 font-bold' : 'bg-[#18181b] text-zinc-400 font-bold'}
                              style={{ backgroundColor: isLight ? '#f1f5f9' : '#18181b', color: isLight ? '#475569' : '#a1a1aa' }}
                            >
                              {projectGroups.topLevel.map((p) => (
                                <option
                                  key={p.project_id}
                                  value={p.project_id}
                                  className={isLight ? 'bg-white text-slate-900' : 'bg-[#1c1c20] text-zinc-100'}
                                  style={{ backgroundColor: isLight ? '#ffffff' : '#1c1c20', color: isLight ? '#0f172a' : '#f4f4f5' }}
                                >
                                  {p.project_name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </label>
                    </div>
                  </div>

                  {/* 2. Stream & Priority */}
                  <div className="space-y-2 border-t pt-3 border-inherit">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                      <Layers size={13} /> Stream & Priority
                    </span>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                      {/* Stream */}
                      <label className="block">
                        <span className="text-[11px] text-slate-400 font-medium mb-1 block">Stream</span>
                        <select
                          value={filters.module || ''}
                          onChange={(e) => handleInputChange('module', e.target.value)}
                          className={clsx(
                            'w-full h-9 rounded-xl border px-2.5 text-xs font-medium outline-none cursor-pointer',
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
                      <label className="block">
                        <span className="text-[11px] text-slate-400 font-medium mb-1 block">Priority</span>
                        <select
                          value={filters.priority || ''}
                          onChange={(e) => handleInputChange('priority', e.target.value)}
                          className={clsx(
                            'w-full h-9 rounded-xl border px-2.5 text-xs font-medium outline-none cursor-pointer',
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
                    </div>
                  </div>

                  {/* 3. Assignee, Story Points & Due Date */}
                  <div className="space-y-2 border-t pt-3 border-inherit">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                      <User size={13} /> Assignee & Effort
                    </span>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
                      {/* Assignee */}
                      <label className="block">
                        <span className="text-[11px] text-slate-400 font-medium mb-1 block">Assignee</span>
                        <select
                          value={filters.assignee || ''}
                          onChange={(e) => handleInputChange('assignee', e.target.value)}
                          className={clsx(
                            'w-full h-9 rounded-xl border px-2 text-xs font-medium outline-none cursor-pointer',
                            isLight
                              ? 'border-slate-200 bg-slate-50 text-slate-800'
                              : 'border-white/10 bg-[#121215] text-zinc-200'
                          )}
                        >
                          <option value="">All</option>
                          {users.map((user) => (
                            <option key={user.user_id} value={user.full_name}>{user.full_name}</option>
                          ))}
                        </select>
                      </label>

                      {/* Story Points */}
                      <label className="block">
                        <span className="text-[11px] text-slate-400 font-medium mb-1 block">Points</span>
                        <select
                          value={filters.storyPoints || ''}
                          onChange={(e) => handleInputChange('storyPoints', e.target.value)}
                          className={clsx(
                            'w-full h-9 rounded-xl border px-2 text-xs font-medium outline-none cursor-pointer',
                            isLight
                              ? 'border-slate-200 bg-slate-50 text-slate-800'
                              : 'border-white/10 bg-[#121215] text-zinc-200'
                          )}
                        >
                          <option value="">All</option>
                          {['1', '2', '3', '5', '8', '13'].map((pts) => (
                            <option key={pts} value={pts}>{pts} pts</option>
                          ))}
                        </select>
                      </label>

                      {/* Due Date */}
                      <label className="block">
                        <span className="text-[11px] text-slate-400 font-medium mb-1 block">Due Date</span>
                        <select
                          value={filters.dueDate || DUE_DATE_OPTIONS.ALL}
                          onChange={(e) => handleInputChange('dueDate', e.target.value)}
                          className={clsx(
                            'w-full h-9 rounded-xl border px-2 text-xs font-medium outline-none cursor-pointer',
                            isLight
                              ? 'border-slate-200 bg-slate-50 text-slate-800'
                              : 'border-white/10 bg-[#121215] text-zinc-200'
                          )}
                        >
                          <option value={DUE_DATE_OPTIONS.ALL}>All</option>
                          <option value={DUE_DATE_OPTIONS.OVERDUE}>Overdue</option>
                          <option value={DUE_DATE_OPTIONS.DUE_THIS_WEEK}>This Week</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Popover Footer */}
                <div className="border-t pt-3 border-inherit flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    style={{ color: '#ffffff' }}
                    className={clsx(
                      'px-6 py-2 rounded-full text-xs font-semibold !text-white border-0 transition-all shadow-md active:scale-95 cursor-pointer',
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

          {/* Swimlane / Group By Dropdown */}
          <div className="relative shrink-0">
            <select
              name="swimlane"
              value={swimlaneBy}
              onChange={(e) => onSwimlaneChange(e.target.value)}
              className={clsx(
                'h-10 rounded-full border px-3.5 text-xs font-semibold outline-none cursor-pointer transition-all duration-200 appearance-none pr-8 relative',
                isLight
                  ? 'border-slate-200 bg-slate-50 text-cyan-700 hover:bg-white'
                  : 'border-white/[0.08] bg-[#141417] text-cyan-400 hover:border-white/20'
              )}
            >
              <option value="None">Group by: None</option>
              <option value="Project">Group by: Project</option>
              <option value="Parent Project">Group by: Parent Project</option>
              <option value="Assignee">Group by: Assignee</option>
              <option value="Stream">Group by: Stream</option>
              <option value="Priority">Group by: Priority</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
                  onClick={() => removeSingleFilter(item.key)}
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

export default KanbanFilterBar;
