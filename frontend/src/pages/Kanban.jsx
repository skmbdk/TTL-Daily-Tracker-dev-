import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import KanbanBoard from '../components/KanbanBoard';
import KanbanFilterBar, { DUE_DATE_OPTIONS } from '../components/KanbanFilterBar';
import TaskModal from '../components/TaskModal';
import { KanbanBoardSkeletonLoader } from '../components/SkeletonLoader';
import { TASK_MODULES } from '../constants/taskOptions';
import { getErrorMessage } from '../services/api';
import { projectService } from '../services/projectService';
import { connectSocket } from '../services/socket';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const initialFilters = {
  searchTerm: '',
  projectId: '',
  parentProjectId: '',
  module: '',
  assignee: '',
  priority: '',
  location: '',
  storyPoints: '',
  dueDate: DUE_DATE_OPTIONS.ALL,
};

const Kanban = () => {
  const { isAdmin, isReadOnly } = useAuth();
  const { isLight } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [swimlaneBy, setSwimlaneBy] = useState('None');

  const filteredTasks = useMemo(() => {
    let filtered = Array.isArray(tasks) ? [...tasks] : [];

    if (filters.searchTerm) {
      const q = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((task) =>
        (task?.task_title || '').toLowerCase().includes(q) ||
        (task?.description || '').toLowerCase().includes(q) ||
        (task?.project_name || '').toLowerCase().includes(q) ||
        (task?.parent_project_name || '').toLowerCase().includes(q) ||
        (task?.employee_name || task?.assigned_user_name || '').toLowerCase().includes(q)
      );
    }

    if (filters.parentProjectId) {
      filtered = filtered.filter((task) =>
        String(task?.parent_project_id) === String(filters.parentProjectId) ||
        (String(task?.project_id) === String(filters.parentProjectId) && !task?.parent_project_id)
      );
    }

    if (filters.projectId) {
      filtered = filtered.filter((task) => String(task?.project_id) === String(filters.projectId));
    }

    if (filters.module) {
      filtered = filtered.filter((task) => task?.module_name === filters.module);
    }

    if (filters.assignee) {
      filtered = filtered.filter((task) =>
        (task?.assigned_user_name || task?.employee_name || '') === filters.assignee ||
        String(task?.assigned_user_id) === String(filters.assignee)
      );
    }

    if (filters.priority) {
      filtered = filtered.filter((task) => task?.priority === filters.priority);
    }

    if (filters.location) {
      filtered = filtered.filter((task) => task?.onsite_offshore === filters.location);
    }

    if (filters.storyPoints) {
      filtered = filtered.filter((task) => String(task?.story_points) === String(filters.storyPoints));
    }

    if (filters.dueDate === DUE_DATE_OPTIONS.OVERDUE) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      filtered = filtered.filter((task) => {
        if (!task?.due_date) return false;
        try {
          const dueDate = new Date(task.due_date);
          return !isNaN(dueDate.getTime()) && dueDate < now && task.status !== 'Completed';
        } catch (e) {
          return false;
        }
      });
    } else if (filters.dueDate === DUE_DATE_OPTIONS.DUE_THIS_WEEK) {
      const now = new Date();
      const today = now.getDay();
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - today);
      firstDayOfWeek.setHours(0, 0, 0, 0);
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
      lastDayOfWeek.setHours(23, 59, 59, 999);

      filtered = filtered.filter((task) => {
        if (!task?.due_date) return false;
        try {
          const dueDate = new Date(task.due_date);
          return !isNaN(dueDate.getTime()) && dueDate >= firstDayOfWeek && dueDate <= lastDayOfWeek;
        } catch (e) {
          return false;
        }
      });
    }

    return filtered;
  }, [tasks, filters]);

  const load = useCallback(async ({ showLoader = true } = {}) => {
    if (showLoader) setLoading(true);
    try {
      const [taskRows, projectRows, userRows] = await Promise.all([
        taskService.list(),
        projectService.list(),
        isAdmin ? userService.list() : Promise.resolve([])
      ]);
      setTasks(Array.isArray(taskRows) ? taskRows : []);
      setProjects(Array.isArray(projectRows) ? projectRows : []);
      setUsers(Array.isArray(userRows) ? userRows : []);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setTasks([]);
      setProjects([]);
      setUsers([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return undefined;

    let refreshTimer;
    const refreshKanban = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => load({ showLoader: false }), 250);
    };

    socket.on('task:changed', refreshKanban);
    return () => {
      window.clearTimeout(refreshTimer);
      socket.off('task:changed', refreshKanban);
    };
  }, [load]);

  const handleStatusChange = async (task, status) => {
    if (isReadOnly) return;
    const previous = tasks;
    setTasks((current) => moveTaskToColumnTop(current, task.task_id, { status }));
    try {
      const updatedTask = await taskService.updateStatus(task.task_id, status);
      setTasks((current) => moveTaskToColumnTop(current, task.task_id, updatedTask));
      toast.success(`Moved to ${status}`);
    } catch (error) {
      setTasks(previous);
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Kanban Board</h2>
          <p className={`mt-1 text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Drag tasks through delivery states. Daily remarks and activity tracking
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!isReadOnly ? (
            <button
              className="btn-primary"
              onClick={() => {
                setSelectedTask(null);
                setModalOpen(true);
              }}
            >
              Add task
            </button>
          ) : (
            <div className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-200">
              Presenter view-only
            </div>
          )}
        </div>
      </div>

      <KanbanFilterBar
        filters={filters}
        onFilterChange={setFilters}
        users={users}
        projects={projects}
        swimlaneBy={swimlaneBy}
        onSwimlaneChange={setSwimlaneBy}
        onReset={() => setFilters(initialFilters)}
      />

      {loading ? (
        <KanbanBoardSkeletonLoader />
      ) : (
        <KanbanBoard
          tasks={filteredTasks}
          users={users}
          readOnly={isReadOnly}
          swimlaneBy={swimlaneBy}
          onStatusChange={handleStatusChange}
          onTaskOpen={(task) => {
            setSelectedTask(task);
            setModalOpen(true);
          }}
        />
      )}

      <TaskModal
        open={modalOpen}
        task={selectedTask}
        users={users}
        projects={projects}
        isAdmin={isAdmin}
        readOnly={isReadOnly}
        onClose={() => setModalOpen(false)}
        onSaved={() => load()}
      />
    </div>
  );
};

const moveTaskToColumnTop = (tasks, taskId, patch) => {
  const existing = tasks.find((item) => item.task_id === taskId);
  if (!existing) return tasks;

  return [{ ...existing, ...patch }, ...tasks.filter((item) => item.task_id !== taskId)];
};

export default Kanban;


// import { useCallback, useEffect, useMemo, useState } from 'react';
// import toast from 'react-hot-toast';
// import KanbanBoard from '../components/KanbanBoard';
// import TaskModal from '../components/TaskModal';
// import { KanbanBoardSkeletonLoader } from '../components/SkeletonLoader';
// import { TASK_MODULES } from '../constants/taskOptions';
// import { getErrorMessage } from '../services/api';
// import { projectService } from '../services/projectService';
// import { connectSocket } from '../services/socket';
// import { taskService } from '../services/taskService';
// import { userService } from '../services/userService';
// import { useAuth } from '../context/AuthContext';

// const Kanban = () => {
//   const { isAdmin, isReadOnly } = useAuth();
//   const [tasks, setTasks] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [selectedModule, setSelectedModule] = useState('');

//   const moduleOptions = useMemo(() => {
//     const dynamicModules = tasks
//       .map((task) => task.module_name)
//       .filter(Boolean)
//       .filter((module, index, list) => list.indexOf(module) === index);

//     return dynamicModules
//       .filter((module) => !TASK_MODULES.includes(module))
//       .reduce((all, module) => [...all, module], [...TASK_MODULES]);
//   }, [tasks]);

//   const filteredTasks = useMemo(() => {
//     if (!selectedModule) return tasks;
//     return tasks.filter((task) => task.module_name === selectedModule);
//   }, [tasks, selectedModule]);

//   const load = useCallback(async ({ showLoader = true } = {}) => {
//     if (showLoader) setLoading(true);
//     try {
//       const [taskRows, projectRows, userRows] = await Promise.all([
//         taskService.list(),
//         projectService.list(),
//         isAdmin ? userService.list() : Promise.resolve([])
//       ]);
//       setTasks(taskRows);
//       setProjects(projectRows);
//       setUsers(userRows);
//     } catch (error) {
//       toast.error(getErrorMessage(error));
//     } finally {
//       if (showLoader) setLoading(false);
//     }
//   }, [isAdmin]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   useEffect(() => {
//     const socket = connectSocket();
//     if (!socket) return undefined;

//     let refreshTimer;
//     const refreshKanban = () => {
//       window.clearTimeout(refreshTimer);
//       refreshTimer = window.setTimeout(() => load({ showLoader: false }), 250);
//     };

//     socket.on('task:changed', refreshKanban);
//     return () => {
//       window.clearTimeout(refreshTimer);
//       socket.off('task:changed', refreshKanban);
//     };
//   }, [load]);

//   const handleStatusChange = async (task, status) => {
//     if (isReadOnly) return;
//     const previous = tasks;
//     setTasks((current) => moveTaskToColumnTop(current, task.task_id, { status }));
//     try {
//       const updatedTask = await taskService.updateStatus(task.task_id, status);
//       setTasks((current) => moveTaskToColumnTop(current, task.task_id, updatedTask));
//       toast.success(`Moved to ${status}`);
//     } catch (error) {
//       setTasks(previous);
//       toast.error(getErrorMessage(error));
//     }
//   };

//   return (
//     <div className="space-y-5">
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <div>
//           <h2 className="text-2xl font-bold text-white">Kanban board</h2>
//           <p className="mt-1 text-sm text-slate-400">
//             Drag tasks through delivery states. Daily remarks and activity tracking
//           </p>
//         </div>
//         <div className="flex flex-wrap items-center gap-3">
//           <label className="mt-5 w-44 min-w-44">
//             <select
//               className="input-field h-10"
//               value={selectedModule}
//               onChange={(event) => setSelectedModule(event.target.value)}
//             >
//               <option value="">All modules</option>
//               {moduleOptions.map((module) => (
//                 <option key={module} value={module}>
//                   {module}
//                 </option>
//               ))}
//             </select>
//           </label>
//           {!isReadOnly ? (
//             <button
//               className="btn-primary mt-5"
//               onClick={() => {
//                 setSelectedTask(null);
//                 setModalOpen(true);
//               }}
//             >
//               Add task
//             </button>
//           ) : (
//             <div className="mt-5 rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-200">
//               Presenter view-only
//             </div>
//           )}
//         </div>
//       </div>

//       {loading ? (
//         <KanbanBoardSkeletonLoader />
//       ) : (
//         <KanbanBoard
//           tasks={filteredTasks}
//           readOnly={isReadOnly}
//           onStatusChange={handleStatusChange}
//           onTaskOpen={(task) => {
//             setSelectedTask(task);
//             setModalOpen(true);
//           }}
//         />
//       )}

//       <TaskModal
//         open={modalOpen}
//         task={selectedTask}
//         users={users}
//         projects={projects}
//         isAdmin={isAdmin}
//         readOnly={isReadOnly}
//         onClose={() => setModalOpen(false)}
//         onSaved={() => load()}
//       />
//     </div>
//   );
// };

// const moveTaskToColumnTop = (tasks, taskId, patch) => {
//   const existing = tasks.find((item) => item.task_id === taskId);
//   if (!existing) return tasks;

//   return [{ ...existing, ...patch }, ...tasks.filter((item) => item.task_id !== taskId)];
// };

// export default Kanban;