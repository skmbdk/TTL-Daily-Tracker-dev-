import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Eye, Plus, Trash2, Download, Gauge } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import TaskModal from '../components/TaskModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getErrorMessage } from '../services/api';
import { projectService } from '../services/projectService';
import { reportService } from '../services/reportService';
import { connectSocket } from '../services/socket';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';

const initialFilters = {
  search: '',
  status: '',
  module_name: '',
  user_id: '',
  project_id: '',
  parent_project_id: '',
  priority: '',
  story_points: '',
  onsite_offshore: '',
  date: ''
};

const Tasks = () => {
  const { isAdmin, isPresenter, isReadOnly } = useAuth();
  const canViewAllUsers = isAdmin || isPresenter;
  const { isLight } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, page_size: 10, total: 0, total_pages: 1 });
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(() => cleanFilters(filters), [filters]);
  const queryKey = useMemo(() => JSON.stringify(query), [query]);
  const taskIdFromUrl = searchParams.get('taskId');
  const totalPages = pagination.total_pages || 1;
  const pageStart = pagination.total ? (page - 1) * pageSize + 1 : 0;
  const pageEnd = Math.min(page * pageSize, pagination.total || 0);

  const loadLookups = useCallback(async () => {
    try {
      const [projectRows, userRows] = await Promise.all([
        projectService.list(),
        canViewAllUsers ? userService.list() : Promise.resolve([])
      ]);
      setProjects(projectRows);
      setUsers(userRows);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, [canViewAllUsers]);

  const load = useCallback(async ({ showLoader = true } = {}) => {
    if (showLoader) setLoading(true);
    try {
      const data = await taskService.listWithMeta({ ...query, page, page_size: pageSize });
      setTasks(data.tasks || []);
      setPagination(data.pagination || { page, page_size: pageSize, total: data.tasks?.length || 0, total_pages: 1 });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [page, pageSize, query]);

  useEffect(() => {
    loadLookups();
  }, [loadLookups, isAdmin, isPresenter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [queryKey, pageSize]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (!taskIdFromUrl) return undefined;

    let cancelled = false;
    taskService
      .get(taskIdFromUrl)
      .then((data) => {
        if (cancelled) return;
        setSelectedTask(data.task);
        setModalOpen(true);
      })
      .catch((error) => toast.error(getErrorMessage(error)));

    return () => {
      cancelled = true;
    };
  }, [taskIdFromUrl]);

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return undefined;

    let refreshTimer;
    const refreshTasks = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => load({ showLoader: false }), 250);
    };

    socket.on('task:changed', refreshTasks);
    return () => {
      window.clearTimeout(refreshTimer);
      socket.off('task:changed', refreshTasks);
    };
  }, [load]);

  const columns = [
    { key: 'task_id', header: 'ID', render: (task) => <span className="font-mono text-xs text-slate-500">#{task.task_id}</span> },
    {
      key: 'task_title',
      header: 'Task',
      render: (task) => (
        <button className={`max-w-80 truncate text-center font-semibold transition-colors ${isLight ? 'text-slate-800 hover:text-cyan-600' : 'text-white hover:text-cyan-300'}`} onClick={() => openTask(task)}>
          {task.task_title}
        </button>
      )
    },
    { key: 'assigned_user_name', header: 'Assigned', render: (task) => <UserAvatar name={task.assigned_user_name || task.employee_name} /> },
    { key: 'status', header: 'Status', render: (task) => <StatusBadge value={task.status} /> },
    { key: 'priority', header: 'Priority', render: (task) => <PriorityBadge value={task.priority} /> },
    {
      key: 'story_points',
      header: 'Points',
      render: (task) => <PointsBadge value={task.story_points} />
    },
    { key: 'project_name', header: 'Project', render: (task) => task.project_name || 'N/A' },
    { key: 'module_name', header: 'Stream', render: (task) => task.module_name || 'N/A' },
    { key: 'due_date', header: 'Plan completion date', render: (task) => <SmartDueDate dateString={task.due_date} /> },
    {
      key: 'actions',
      header: '',
      render: (task) => (
        <div className="flex justify-center gap-1">
          <button className={`rounded p-1.5 transition-colors ${isLight ? 'text-slate-400 hover:bg-slate-100 hover:text-cyan-600' : 'text-slate-400 hover:bg-white/5 hover:text-cyan-300'}`} onClick={() => openTask(task)} title={isReadOnly ? 'View task' : 'Edit task'}>
            {isReadOnly ? <Eye size={16} /> : <Edit3 size={16} />}
          </button>
          {!isReadOnly ? (
            <button className={`rounded p-1.5 transition-colors ${isLight ? 'text-slate-400 hover:bg-rose-100 hover:text-rose-600' : 'text-slate-400 hover:bg-rose-500/10 hover:text-rose-400'}`} onClick={() => setDeleteTask(task)} title="Delete task">
              <Trash2 size={16} />
            </button>
          ) : null}
        </div>
      )
    }
  ];

  const openTask = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const exportReport = async () => {
    setExportLoading(true);
    try {
      const { blob, fileName } = await reportService.exportTasks(query);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Tasks exported successfully');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExportLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await taskService.remove(deleteTask.task_id);
      toast.success('Task deleted');
      setDeleteTask(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Task Management</h2>
          <p className={`mt-1 text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Search, filter, assign, update, comment, and review task history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={exportReport} disabled={exportLoading}>
            <Download size={17} />
            {exportLoading ? 'Exporting...' : 'Export Excel'}
          </button>
          {!isReadOnly ? (
            <button
              className="btn-primary"
              onClick={() => {
                setSelectedTask(null);
                setModalOpen(true);
              }}
            >
              <Plus size={17} />
              Add task
            </button>
          ) : (
            <div className={`rounded-lg border px-3 py-2 text-sm font-semibold ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-700' : 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200'}`}>
              Presenter view-only
            </div>
          )}
        </div>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        users={users}
        projects={projects}
        showUsers={canViewAllUsers}
        showPriority={true}
        showProjects={true}
        singleDate
        onReset={() => setFilters(initialFilters)}
      />

      <DataTable columns={columns} data={tasks} loading={loading} emptyText="No tasks match the current filters." onRowClick={openTask} />

      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Showing <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{pageStart}</span>-<span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{pageEnd}</span> of{' '}
          <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{pagination.total || 0}</span> tasks
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            Rows
            <select
              className="input-field w-24 py-1.5"
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-2">
            <button className="btn-secondary px-3" onClick={() => setPage((current) => current - 1)} disabled={page <= 1}>
              <ChevronLeft size={16} />
            </button>
            <span className={`min-w-24 text-center text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
              {page} / {totalPages}
            </span>
            <button className="btn-secondary px-3" onClick={() => setPage((current) => current + 1)} disabled={page >= totalPages}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <TaskModal
        open={modalOpen}
        task={selectedTask}
        users={users}
        projects={projects}
        isAdmin={isAdmin}
        readOnly={isReadOnly}
        onClose={() => {
          setModalOpen(false);
          if (taskIdFromUrl) {
            const next = new URLSearchParams(searchParams);
            next.delete('taskId');
            setSearchParams(next, { replace: true });
          }
        }}
        onSaved={() => load()}
      />

      <ConfirmModal
        open={Boolean(deleteTask)}
        title="Delete task?"
        message="This permanently removes the task, comments, and history from the database."
        confirmText="Delete"
        onCancel={() => setDeleteTask(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

const cleanFilters = (filters) => {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined));
};

const StatusBadge = ({ value }) => {
  const { isLight } = useTheme();
  const colors = {
    'Completed': isLight ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    'In Progress': isLight ? 'border-blue-200 bg-blue-100 text-blue-700' : 'border-blue-400/30 bg-blue-400/10 text-blue-300',
    'In Review': isLight ? 'border-indigo-200 bg-indigo-100 text-indigo-700' : 'border-indigo-400/30 bg-indigo-400/10 text-indigo-300',
    'Testing': isLight ? 'border-purple-200 bg-purple-100 text-purple-700' : 'border-purple-400/30 bg-purple-400/10 text-purple-300',
    'Blocked': isLight ? 'border-rose-200 bg-rose-100 text-rose-700' : 'border-rose-400/30 bg-rose-400/10 text-rose-300',
    'To Do': isLight ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-slate-400/30 bg-slate-400/10 text-slate-300',
    'Backlog': isLight ? 'border-slate-300 bg-slate-200 text-slate-700' : 'border-slate-500/30 bg-slate-500/10 text-slate-400',
  };
  const colorClass = colors[value] || (isLight ? 'border-cyan-200 bg-cyan-100 text-cyan-700' : 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300');
  return <span className={`badge ${colorClass}`}>{value}</span>;
};

const PriorityBadge = ({ value }) => {
  const { isLight } = useTheme();
  const colors = {
    'Critical': isLight ? 'border-rose-300 bg-rose-100 text-rose-700 font-bold' : 'border-rose-500/30 bg-rose-500/10 text-rose-400 font-bold',
    'High': isLight ? 'border-amber-300 bg-amber-100 text-amber-700' : 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    'Medium': isLight ? 'border-blue-200 bg-blue-100 text-blue-700' : 'border-blue-400/30 bg-blue-400/10 text-blue-300',
    'Low': isLight ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  };
  const colorClass = colors[value] || (isLight ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-slate-400/30 bg-slate-400/10 text-slate-300');
  return <span className={`badge ${colorClass}`}>{value}</span>;
};

const PointsBadge = ({ value }) => {
  const { isLight } = useTheme();
  const pts = Number(value) || 1;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold tracking-tight border transition-all ${
        isLight
          ? 'bg-indigo-50 border-indigo-200/80 text-indigo-700 shadow-2xs'
          : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
      }`}
    >
      <Gauge size={13} className={isLight ? 'text-indigo-600' : 'text-indigo-400'} />
      <span>{pts} {pts === 1 ? 'pt' : 'pts'}</span>
    </span>
  );
};

const SmartDueDate = ({ dateString }) => {
  const { isLight } = useTheme();
  if (!dateString) return <span className="text-slate-500">N/A</span>;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  
  if (diffDays < 0) return <span className={`flex items-center justify-center gap-1.5 font-medium ${isLight ? 'text-rose-600' : 'text-rose-400'}`}><span>{formattedDate}</span> <span className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${isLight ? 'bg-rose-100 text-rose-700' : 'bg-rose-500/20 text-rose-300'}`}>Overdue</span></span>;
  if (diffDays === 0) return <span className={`font-medium ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>Today</span>;
  if (diffDays <= 2) return <span className={isLight ? 'text-amber-600' : 'text-amber-300'}>{formattedDate}</span>;
  return <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>{formattedDate}</span>;
};

const UserAvatar = ({ name }) => {
  const { isLight } = useTheme();
  if (!name || name === 'Unassigned') {
    return (
      <div className="mx-auto flex w-36 items-center justify-start gap-2 text-left">
        <div className="h-6 w-6 shrink-0" />
        <span className="text-slate-500">Unassigned</span>
      </div>
    );
  }
  
  const initials = name
    .split(' ')
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto flex w-36 items-center justify-start gap-2 text-left">
      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${isLight ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200' : 'bg-indigo-400/10 text-indigo-300 ring-1 ring-indigo-400/30'}`}>
        {initials}
      </div>
      <span className="truncate">{name}</span>
    </div>
  );
};

export default Tasks;
