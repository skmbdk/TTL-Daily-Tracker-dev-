import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Archive,
  BarChart2,
  Briefcase,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Edit3,
  ExternalLink,
  Filter,
  FolderKanban,
  Gauge,
  GitFork,
  Plus,
  RotateCcw,
  Search,
  Target,
  User,
  Users as UsersIcon,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import DataTable from '../components/DataTable';
import Avatar from '../components/Avatar';
import { getErrorMessage } from '../services/api';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

const emptyProject = {
  project_name: '',
  description: '',
  parent_project_id: '',
  start_date: '',
  end_date: '',
  status: 'Active',
  member_ids: []
};

const initialFilters = {
  search: '',
  status: 'all',
  progress: 'all',
  hierarchy: 'all',
  parentProjectId: 'all',
  health: 'all',
  memberId: 'all'
};

const getProjectHealth = (project) => {
  if (!project) return { label: 'On Track', tone: 'emerald' };
  if (project.status === 'Completed') {
    return { label: 'Completed', tone: 'emerald' };
  }
  if (project.status === 'On Hold') {
    return { label: 'On Hold', tone: 'amber' };
  }
  if (project.end_date) {
    try {
      const end = new Date(project.end_date);
      if (!isNaN(end.getTime())) {
        const now = new Date();
        if (end < now) {
          return { label: 'Overdue', tone: 'rose' };
        }
        const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        if (diffDays <= 5) {
          return { label: 'Due Soon', tone: 'amber' };
        }
      }
    } catch (e) {}
  }
  return { label: 'On Track', tone: 'emerald' };
};

const ProjectHealthBadge = ({ project }) => {
  const health = getProjectHealth(project);
  const toneClasses = {
    emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    rose: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
  };

  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold', toneClasses[health.tone])}>
      <span className={clsx('h-1.5 w-1.5 rounded-full', health.tone === 'emerald' ? 'bg-emerald-500' : health.tone === 'amber' ? 'bg-amber-500' : 'bg-rose-500')} />
      {health.label}
    </span>
  );
};

const Projects = () => {
  const { isLight } = useTheme();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProject);
  const [workingMembers, setWorkingMembers] = useState([]);
  const [archiveProject, setArchiveProject] = useState(null);
  const [detailProject, setDetailProject] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterPopoverRef = useRef(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportProjectsToCSV = () => {
    if (!filteredProjects.length) {
      toast.error('No projects available to export');
      return;
    }
    const headers = ['Project ID', 'Project Name', 'Status', 'Health', 'Total Tasks', 'Completed Tasks', 'Completion %', 'Start Date', 'End Date', 'Description'];
    const rows = filteredProjects.map((p) => {
      const health = getProjectHealth(p).label;
      const total = p.task_count || 0;
      const completed = p.completed_count || 0;
      const pct = total ? Math.round((completed / total) * 100) : 0;
      return [
        p.project_id,
        `"${(p.project_name || '').replace(/"/g, '""')}"`,
        `"${(p.status || 'Active').replace(/"/g, '""')}"`,
        `"${health}"`,
        total,
        completed,
        `${pct}%`,
        p.start_date ? new Date(p.start_date).toISOString().slice(0, 10) : '',
        p.end_date ? new Date(p.end_date).toISOString().slice(0, 10) : '',
        `"${(p.description || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `projects_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredProjects.length} projects to CSV`);
  };

  const availableParentProjects = useMemo(() => {
    return projects
      .filter((p) => !p.parent_project_id)
      .sort((a, b) => (a.project_name || '').localeCompare(b.project_name || ''));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName = (project.project_name || '').toLowerCase().includes(q);
        const matchDesc = (project.description || '').toLowerCase().includes(q);
        const matchParent = (project.parent_project_name || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchParent) return false;
      }

      if (filters.status !== 'all') {
        if ((project.status || 'Active') !== filters.status) return false;
      }

      if (filters.progress !== 'all') {
        const total = project.task_count || 0;
        const completed = project.completed_count || 0;
        const pct = total ? Math.round((completed / total) * 100) : 0;

        if (filters.progress === 'completed' && pct !== 100) return false;
        if (filters.progress === 'in_progress' && (pct === 0 || pct === 100)) return false;
        if (filters.progress === 'not_started' && pct !== 0) return false;
      }

      if (filters.hierarchy !== 'all') {
        const isSub = Boolean(project.parent_project_id);
        if (filters.hierarchy === 'parents_only' && isSub) return false;
        if (filters.hierarchy === 'subprojects_only' && !isSub) return false;
      }

      if (filters.parentProjectId !== 'all') {
        if (String(project.parent_project_id) !== String(filters.parentProjectId)) return false;
      }

      if (filters.health !== 'all') {
        const healthLabel = getProjectHealth(project).label.toLowerCase().replace(/\s+/g, '_');
        if (healthLabel !== filters.health) return false;
      }

      if (filters.memberId !== 'all') {
        const targetId = Number(filters.memberId);
        let memberIds = [];
        if (project.member_ids) {
          let raw = project.member_ids;
          if (typeof raw === 'string' && raw.trim().startsWith('[')) {
            try { raw = JSON.parse(raw); } catch (e) {}
          } else if (typeof raw === 'string') {
            raw = raw.split(',');
          }
          const arr = Array.isArray(raw) ? raw : [raw];
          memberIds = arr.map((item) => {
            if (item && typeof item === 'object') {
              return item.user_id || item.id || item.member_id || Object.values(item)[0];
            }
            return item;
          }).map(Number).filter((n) => !isNaN(n));
        }
        if (!memberIds.includes(targetId)) return false;
      }

      return true;
    });
  }, [projects, filters]);

  const activeFilterList = useMemo(() => {
    const list = [];
    if (filters.hierarchy !== 'all') {
      const label = filters.hierarchy === 'parents_only' ? 'Parent Projects Only' : 'Sub-Projects Only';
      list.push({ key: 'hierarchy', label: 'Type', value: label });
    }
    if (filters.parentProjectId !== 'all') {
      const parent = availableParentProjects.find((p) => String(p.project_id) === String(filters.parentProjectId));
      list.push({ key: 'parentProjectId', label: 'Parent', value: parent?.project_name || 'Parent Project' });
    }
    if (filters.health !== 'all') {
      const healthMap = { on_track: 'On Track', due_soon: 'Due Soon', overdue: 'Overdue', on_hold: 'On Hold', completed: 'Completed' };
      list.push({ key: 'health', label: 'Health', value: healthMap[filters.health] || filters.health });
    }
    if (filters.status !== 'all') {
      list.push({ key: 'status', label: 'Status', value: filters.status });
    }
    if (filters.progress !== 'all') {
      const progressMap = { completed: 'Completed (100%)', in_progress: 'In Progress (1-99%)', not_started: 'Not Started (0%)' };
      list.push({ key: 'progress', label: 'Progress', value: progressMap[filters.progress] || filters.progress });
    }
    if (filters.memberId !== 'all') {
      const user = users.find((u) => String(u.user_id) === String(filters.memberId));
      list.push({ key: 'memberId', label: 'Member', value: user?.full_name || 'Member' });
    }
    return list;
  }, [filters, availableParentProjects, users]);

  const activeFilterCount = useMemo(() => {
    return activeFilterList.length + (filters.search ? 1 : 0);
  }, [activeFilterList, filters.search]);

  const removeSingleFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: 'all' }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const pageStart = filteredProjects.length ? (page - 1) * pageSize + 1 : 0;
  const pageEnd = Math.min(page * pageSize, filteredProjects.length);

  const paginatedProjects = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, page, pageSize]);
  const projectStats = useMemo(() => {
    const totalTasks = projects.reduce((sum, project) => sum + Number(project.task_count || 0), 0);
    const completedTasks = projects.reduce((sum, project) => sum + Number(project.completed_count || 0), 0);
    const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return [
      {
        label: 'Active',
        value: projects.filter((project) => project.status === 'Active').length,
        detail: 'projects running',
        icon: FolderKanban,
        tone: 'cyan'
      },
      {
        label: 'Completed',
        value: projects.filter((project) => project.status === 'Completed').length,
        detail: 'delivered spaces',
        icon: CheckCircle2,
        tone: 'emerald'
      },
      {
        label: 'On hold',
        value: projects.filter((project) => project.status === 'On Hold').length,
        detail: 'need attention',
        icon: Clock3,
        tone: 'amber'
      },
      {
        label: 'Completion',
        value: `${completionRate}%`,
        detail: `${completedTasks} / ${totalTasks} tasks`,
        icon: Target,
        tone: 'blue'
      }
    ];
  }, [projects]);

  const load = async () => {
    setLoading(true);
    try {
      const [projectRows, userRows] = await Promise.all([projectService.list(), userService.list()]);
      setProjects(projectRows);
      setUsers(userRows.filter((user) => user.status === 'Active'));
      setPage(1);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages) || 1);
  }, [totalPages]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyProject);
    setWorkingMembers([]);
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    
    let memberIds = [];
    if (project.member_ids !== undefined && project.member_ids !== null) {
      let raw = project.member_ids;
      if (typeof raw === 'string' && raw.trim().startsWith('[')) {
        try { raw = JSON.parse(raw); } catch (e) {}
      } else if (typeof raw === 'string') {
        raw = raw.split(',');
      }
      const arr = Array.isArray(raw) ? raw : [raw];
      memberIds = arr.map((item) => {
        if (item && typeof item === 'object') {
          return item.user_id || item.id || item.member_id || Object.values(item)[0];
        }
        return item;
      }).map(Number).filter((n) => !isNaN(n) && n > 0);
    }

    let workingIds = [];
    if (project.working_member_ids !== undefined && project.working_member_ids !== null) {
      let raw = project.working_member_ids;
      if (typeof raw === 'string' && raw.trim().startsWith('[')) {
        try { raw = JSON.parse(raw); } catch (e) {}
      } else if (typeof raw === 'string') {
        raw = raw.split(',');
      }
      const arr = Array.isArray(raw) ? raw : [raw];
      workingIds = arr.map((item) => {
        if (item && typeof item === 'object') {
          return item.user_id || item.id || item.member_id || Object.values(item)[0];
        }
        return item;
      }).map(Number).filter((n) => !isNaN(n) && n > 0);
    }

    setWorkingMembers(workingIds);
    setForm({
      project_name: project.project_name || '',
      description: project.description || '',
      parent_project_id: project.parent_project_id || '',
      start_date: inputDate(project.start_date),
      end_date: inputDate(project.end_date),
      status: project.status || 'Active',
      member_ids: memberIds
    });
    setModalOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      const payload = { 
        ...form,
        parent_project_id: form.parent_project_id ? Number(form.parent_project_id) : null,
        member_ids: form.member_ids.map(Number).filter((n) => !isNaN(n))
      };
      if (editing) {
        await projectService.update(editing.project_id, payload);
        toast.success('Project updated');
      } else {
        await projectService.create(payload);
        toast.success('Project created');
      }
      setModalOpen(false);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const archive = async () => {
    try {
      await projectService.remove(archiveProject.project_id);
      toast.success('Project archived');
      setArchiveProject(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // const columns = [
  //   {
  //     key: 'project_name',
  //     header: 'Project',
  //     render: (project) => <ProjectNameCell project={project} onOpen={() => openEdit(project)} />
  //   },
  //   { key: 'status', header: 'Status', render: (project) => <ProjectStatusBadge value={project.status} /> },
  //   { key: 'task_count', header: 'Tasks', render: (project) => <ProjectTaskCount project={project} /> },
  //   {
  //     key: 'progress',
  //     header: 'Progress',
  //     render: (project) => {
  //       const value = project.task_count ? Math.max(0, Math.min(100, Math.round((project.completed_count / project.task_count) * 100))) : 0;
  //       const completed = project.completed_count || 0;
  //       const total = project.task_count || 0;
        
  //       let gradientClass = 'from-cyan-400 to-blue-500';
  //       let shadowColor = 'rgba(6, 182, 212, 0.4)';
        
  //       if (value === 100) {
  //         gradientClass = 'from-emerald-400 to-emerald-500';
  //         shadowColor = 'rgba(52, 211, 153, 0.5)';
  //       } else if (value > 0 && value < 30) {
  //         gradientClass = 'from-amber-400 to-orange-500';
  //         shadowColor = 'rgba(245, 158, 11, 0.4)';
  //       } else if (value === 0) {
  //         gradientClass = 'from-slate-400 to-slate-500';
  //       }

  //       return (
  //         <div className="min-w-[11.5rem] py-1">
  //           <div className="mb-1.5 flex items-center justify-between text-xs">
  //             <div className="flex items-baseline gap-1.5">
  //               <span className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{value}%</span>
  //               <span className={`text-[10px] font-semibold tracking-wide ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
  //                 {completed} / {total} Tasks
  //               </span>
  //             </div>
  //             {value === 100 && (
  //               <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Done</span>
  //             )}
  //           </div>
  //           <div className={`relative h-2 w-full overflow-hidden rounded-full ${isLight ? 'bg-slate-200/80 shadow-inner' : 'bg-slate-800/80 shadow-inner'}`}>
  //             <div
  //               className={`relative h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-1000 ease-out`}
  //               style={{ 
  //                 width: `${value}%`,
  //                 boxShadow: !isLight && value > 0 ? `0 0 10px ${shadowColor}` : 'none'
  //               }}
  //             >
  //               {value > 0 && value < 100 && (
  //                 <div className="absolute right-0 top-0 h-full w-8 animate-[pulse_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent to-white/40" />
  //               )}
  //             </div>
  //           </div>
  //         </div>
  //       );
  //     }
  //   },
  //   { key: 'start_date', header: 'Start', render: (project) => <ProjectDateChip value={project.start_date} /> },
  //   { key: 'end_date', header: 'End', render: (project) => <ProjectDateChip value={project.end_date} /> },
  //   {
  //     key: 'actions',
  //     header: '',
  //     render: (project) => (
  //       <div className="flex justify-center gap-2">
  //         <button className="btn-secondary px-3" onClick={() => openEdit(project)} title="Edit project">
  //           <Edit3 size={15} />
  //         </button>
  //         <button className="btn-danger px-3" onClick={() => setArchiveProject(project)} title="Archive project">
  //           <Archive size={15} />
  //         </button>
  //       </div>
  //     )
  //   }
  // ];


  const columns = [
    {
      key: 'project_name',
      header: 'Project',
      align: 'center',
      headerClassName: '-translate-x-8',
      render: (project) => (
        <ProjectNameCell
          project={project}
          onOpen={() => setDetailProject(project)}
        />
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (project) => (
        <ProjectStatusBadge value={project.status} />
      )
    },
    {
      key: 'health',
      header: 'Health',
      align: 'center',
      render: (project) => <ProjectHealthBadge project={project} />
    },
    {
      key: 'task_count',
      header: 'Tasks',
      align: 'center',
      render: (project) => (
        <ProjectTaskCount project={project} />
      )
    },{
      key: 'progress',
      header: 'Progress',
      render: (project) => {
        const value = project.task_count ? Math.max(0, Math.min(100, Math.round((project.completed_count / project.task_count) * 100))) : 0;
        const completed = project.completed_count || 0;
        const total = project.task_count || 0;
        
        let gradientClass = 'from-cyan-400 to-blue-500';
        let shadowColor = 'rgba(6, 182, 212, 0.4)';
        
        if (value === 100) {
          gradientClass = 'from-emerald-400 to-emerald-500';
          shadowColor = 'rgba(52, 211, 153, 0.5)';
        } else if (value > 0 && value < 30) {
          gradientClass = 'from-amber-400 to-orange-500';
          shadowColor = 'rgba(245, 158, 11, 0.4)';
        } else if (value === 0) {
          gradientClass = 'from-slate-400 to-slate-500';
        }

        return (
          <div className="min-w-[11.5rem] py-1">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{value}%</span>
                <span className={`text-[10px] font-semibold tracking-wide ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {completed} / {total} Tasks
                </span>
              </div>
              {value === 100 && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Completed</span>
              )}
            </div>
            <div className={`relative h-2 w-full overflow-hidden rounded-full ${isLight ? 'bg-slate-200/80 shadow-inner' : 'bg-slate-800/80 shadow-inner'}`}>
              <div
                className={`relative h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-1000 ease-out`}
                style={{ 
                  width: `${value}%`,
                  boxShadow: !isLight && value > 0 ? `0 0 10px ${shadowColor}` : 'none'
                }}
              >
                {value > 0 && value < 100 && (
                  <div className="absolute right-0 top-0 h-full w-8 animate-[pulse_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent to-white/40" />
                )}
              </div>
            </div>
          </div>
        );
      }
    },
  {
    key: 'start_date',
    header: 'Start',
    align: 'center',
    render: (project) => (
      <ProjectDateChip value={project.start_date} />
    )
  },
  {
    key: 'end_date',
    header: 'End',
    align: 'center',
    render: (project) => (
      <ProjectDateChip value={project.end_date} />
    )
  },
  {
    key: 'actions',
    header: '',
    align: 'center',
    render: (project) => (
      <div className="flex justify-center gap-2">
        <button
          type="button"
          className={clsx(
            'btn-secondary px-3 transition-colors',
            isLight
              ? 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:border-cyan-300 hover:bg-cyan-100 hover:text-cyan-800'
              : 'text-cyan-400 hover:text-cyan-300'
          )}
          onClick={(e) => {
            e.stopPropagation();
            setDetailProject(project);
          }}
          title="View Project Detail & Task Breakdown"
        >
          <BarChart2 size={15} />
        </button>

        <button
          type="button"
          className="btn-secondary px-3"
          onClick={(e) => {
            e.stopPropagation();
            openEdit(project);
          }}
          title="Edit project"
        >
          <Edit3 size={15} />
        </button>

        <button
          type="button"
          className="btn-danger px-3"
          onClick={(e) => {
            e.stopPropagation();
            setArchiveProject(project);
          }}
          title="Archive project"
        >
          <Archive size={15} />
        </button>
      </div>
    )
  }
];
  return (
    <div className="space-y-5">
      <section className="project-command-panel flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <p className="project-command-eyebrow">Portfolio control</p>
          <h2 className="project-command-title">Project Management</h2>
          <p className="project-command-copy">Create project spaces, assign members, and track completion.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-secondary flex items-center gap-2"
            onClick={exportProjectsToCSV}
            title="Export projects list to CSV"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
            <Plus size={17} />
            Create project
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {projectStats.map((item) => (
          <ProjectStatCard key={item.label} {...item} />
        ))}
      </section>

      {/* Project Management Minimal Filter Toolbar */}
      <div
        className={clsx(
          'rounded-2xl border p-3 backdrop-blur-md transition-all duration-300 relative z-30',
          isLight
            ? 'border-slate-200/80 bg-white/80 shadow-md shadow-slate-200/15'
            : 'border-white/[0.08] bg-[#141417] shadow-xl shadow-black/30'
        )}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search bar (LEFT SIDE) */}
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} size={15} />
            <input
              type="text"
              className={clsx(
                'w-full h-10 rounded-full border pl-10 pr-9 text-xs font-medium outline-none transition-all duration-200 placeholder:text-slate-400',
                isLight
                  ? 'border-slate-200 bg-slate-50/80 text-slate-800 focus:bg-white focus:border-cyan-500'
                  : 'border-white/[0.08] bg-[#141417] text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700'
              )}
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* RIGHT SIDE: Filters Popover Button & Active Chips */}
          <div className="flex items-center gap-2.5 flex-wrap ml-auto">
            {/* Minimal Filter Popover Toggle Button */}
            <div className="relative z-50" ref={filterPopoverRef}>
              <button
                type="button"
                onClick={() => setFilterOpen((prev) => !prev)}
                className={clsx(
                  'inline-flex items-center gap-2 h-10 px-4 rounded-full border text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs',
                  activeFilterList.length > 0
                    ? isLight
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700 ring-2 ring-cyan-500/20'
                      : 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/30'
                    : isLight
                    ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:border-slate-300'
                    : 'border-white/[0.08] bg-[#141417] text-zinc-200 hover:border-white/20'
                )}
              >
                <Filter size={15} className={activeFilterList.length > 0 ? (isLight ? 'text-cyan-600' : 'text-cyan-400') : 'text-slate-400'} />
                <span>Filters</span>
                {activeFilterList.length > 0 && (
                  <span className="ml-0.5 rounded-full bg-cyan-600 text-white px-2 py-0.5 text-[10px] font-bold">
                    {activeFilterList.length}
                  </span>
                )}
                <ChevronDown size={14} className={clsx('transition-transform duration-200 ml-0.5', filterOpen && 'rotate-180')} />
              </button>

              {/* Minimal Dropdown Popover Menu */}
              {filterOpen && (
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
                      <Filter size={16} className="text-cyan-500" />
                      <span className="font-bold text-sm tracking-wide">Filter Projects</span>
                    </div>
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw size={12} />
                        Reset all
                      </button>
                    )}
                  </div>

                  {/* Popover Filter Selects */}
                  <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                    {/* 1. Projects & Hierarchy */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-1.5">
                        <GitFork size={13} /> Hierarchy & Structure
                      </span>
                      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                        {/* Hierarchy */}
                        <label className="block">
                          <span className="text-[11px] text-slate-400 font-medium mb-1 block">Type</span>
                          <select
                            value={filters.hierarchy}
                            onChange={(e) => setFilters((prev) => ({ ...prev, hierarchy: e.target.value }))}
                            className={clsx(
                              'w-full h-9 rounded-xl border px-2.5 text-xs font-medium outline-none cursor-pointer',
                              isLight ? 'border-slate-200 bg-slate-50 text-slate-800' : 'border-white/10 bg-[#121215] text-zinc-200'
                            )}
                          >
                            <option value="all">All Types</option>
                            <option value="parents_only">Parent Projects Only</option>
                            <option value="subprojects_only">Sub-Projects Only</option>
                          </select>
                        </label>

                        {/* Parent Project */}
                        {availableParentProjects.length > 0 && (
                          <label className="block">
                            <span className="text-[11px] text-slate-400 font-medium mb-1 block">Parent Project</span>
                            <select
                              value={filters.parentProjectId}
                              onChange={(e) => setFilters((prev) => ({ ...prev, parentProjectId: e.target.value }))}
                              className={clsx(
                                'w-full h-9 rounded-xl border px-2.5 text-xs font-medium outline-none cursor-pointer',
                                isLight ? 'border-slate-200 bg-slate-50 text-slate-800' : 'border-white/10 bg-[#121215] text-zinc-200'
                              )}
                            >
                              <option value="all">All Parents</option>
                              {availableParentProjects.map((p) => (
                                <option key={p.project_id} value={p.project_id}>
                                  Under {p.project_name}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* 2. Status & Health */}
                    <div className="space-y-2 border-t pt-3 border-inherit">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-1.5">
                        <Activity size={13} /> Status & Health
                      </span>
                      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                        {/* Health */}
                        <label className="block">
                          <span className="text-[11px] text-slate-400 font-medium mb-1 block">Health</span>
                          <select
                            value={filters.health}
                            onChange={(e) => setFilters((prev) => ({ ...prev, health: e.target.value }))}
                            className={clsx(
                              'w-full h-9 rounded-xl border px-2.5 text-xs font-medium outline-none cursor-pointer',
                              isLight ? 'border-slate-200 bg-slate-50 text-slate-800' : 'border-white/10 bg-[#121215] text-zinc-200'
                            )}
                          >
                            <option value="all">All Health</option>
                            <option value="on_track">On Track</option>
                            <option value="due_soon">Due Soon</option>
                            <option value="overdue">Overdue</option>
                            <option value="on_hold">On Hold</option>
                            <option value="completed">Completed</option>
                          </select>
                        </label>

                        {/* Status */}
                        <label className="block">
                          <span className="text-[11px] text-slate-400 font-medium mb-1 block">Status</span>
                          <select
                            value={filters.status}
                            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                            className={clsx(
                              'w-full h-9 rounded-xl border px-2.5 text-xs font-medium outline-none cursor-pointer',
                              isLight ? 'border-slate-200 bg-slate-50 text-slate-800' : 'border-white/10 bg-[#121215] text-zinc-200'
                            )}
                          >
                            <option value="all">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                          </select>
                        </label>
                      </div>
                    </div>

                    {/* 3. Progress & Members */}
                    <div className="space-y-2 border-t pt-3 border-inherit">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-1.5">
                        <UsersIcon size={13} /> Progress & Team
                      </span>
                      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                        {/* Progress */}
                        <label className="block">
                          <span className="text-[11px] text-slate-400 font-medium mb-1 block">Progress</span>
                          <select
                            value={filters.progress}
                            onChange={(e) => setFilters((prev) => ({ ...prev, progress: e.target.value }))}
                            className={clsx(
                              'w-full h-9 rounded-xl border px-2.5 text-xs font-medium outline-none cursor-pointer',
                              isLight ? 'border-slate-200 bg-slate-50 text-slate-800' : 'border-white/10 bg-[#121215] text-zinc-200'
                            )}
                          >
                            <option value="all">All Progress</option>
                            <option value="completed">Completed (100%)</option>
                            <option value="in_progress">In Progress (1-99%)</option>
                            <option value="not_started">Not Started (0%)</option>
                          </select>
                        </label>

                        {/* Team Member */}
                        {users.length > 0 && (
                          <label className="block">
                            <span className="text-[11px] text-slate-400 font-medium mb-1 block">Member</span>
                            <select
                              value={filters.memberId}
                              onChange={(e) => setFilters((prev) => ({ ...prev, memberId: e.target.value }))}
                              className={clsx(
                                'w-full h-9 rounded-xl border px-2.5 text-xs font-medium outline-none cursor-pointer',
                                isLight ? 'border-slate-200 bg-slate-50 text-slate-800' : 'border-white/10 bg-[#121215] text-zinc-200'
                              )}
                            >
                              <option value="all">All Members</option>
                              {users.map((u) => (
                                <option key={u.user_id} value={u.user_id}>
                                  {u.full_name}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reset All Button */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className={clsx(
                  'inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full border text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs',
                  isLight
                    ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                )}
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFilterList.length > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-inherit flex flex-wrap items-center gap-1.5">
            <span className={`text-[11px] font-bold uppercase tracking-wider mr-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              Active:
            </span>
            {activeFilterList.map((item) => (
              <span
                key={item.key}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-2xs transition-colors',
                  isLight
                    ? 'border-cyan-200 bg-cyan-50/90 text-cyan-800'
                    : 'border-cyan-500/30 bg-cyan-500/15 text-cyan-300'
                )}
              >
                <span className="opacity-70 text-[10px] uppercase font-bold">{item.label}:</span>
                <span>{item.value}</span>
                <button
                  type="button"
                  onClick={() => removeSingleFilter(item.key)}
                  className="rounded-full p-0.5 hover:bg-cyan-500/20 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <DataTable columns={columns} data={paginatedProjects} loading={loading} emptyText={activeFilterCount > 0 ? "No projects match the selected filters." : "No projects found."} onRowClick={openEdit} />

      <div className="project-pagination-bar flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="project-pagination-copy text-sm">
          Showing <span>{pageStart}</span>-<span>{pageEnd}</span> of <span>{filteredProjects.length}</span> projects
          {filteredProjects.length !== projects.length && (
            <span className="ml-1 opacity-70">(filtered from {projects.length} total)</span>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <label className="project-pagination-copy flex items-center gap-2 text-sm">
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
            <span className="project-page-count min-w-24 text-center text-sm font-semibold">
              {page} / {totalPages}
            </span>
            <button className="btn-secondary px-3" onClick={() => setPage((current) => current + 1)} disabled={page >= totalPages}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {modalOpen ? createPortal(
        <div className="app-modal-backdrop fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
          <form className="glass-panel max-h-[92vh] w-full max-w-2xl overflow-y-auto p-5" onSubmit={save}>
            <h3 className="text-lg font-bold text-white">{editing ? 'Edit project' : 'Create project'}</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input label="Project name" value={form.project_name} onChange={(value) => setForm({ ...form, project_name: value })} required />
              <label>
                <span className="label">Parent Project (Optional)</span>
                <select
                  className="input-field mt-1"
                  value={form.parent_project_id || ''}
                  onChange={(event) => setForm({ ...form, parent_project_id: event.target.value })}
                >
                  <option value="">None (Top-Level Parent Project)</option>
                  {projects
                    .filter((p) => !editing || String(p.project_id) !== String(editing.project_id))
                    .filter((p) => !p.parent_project_id)
                    .map((p) => (
                      <option key={p.project_id} value={p.project_id}>
                        {p.project_name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                <span className="label">Status</span>
                <select className="input-field mt-1" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option>Active</option>
                  <option>On Hold</option>
                  <option>Completed</option>
                  <option>Archived</option>
                </select>
              </label>
              <Input label="Start date" type="date" value={form.start_date} onChange={(value) => setForm({ ...form, start_date: value })} />
              <Input label="End date" type="date" value={form.end_date} onChange={(value) => setForm({ ...form, end_date: value })} />
              <label className="md:col-span-2">
                <span className="label">Description</span>
                <textarea
                  className="input-field mt-1 min-h-24"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </label>
          <label className="md:col-span-2">
            <span className="label">Members</span>
            <select
              className="input-field mt-1 min-h-36"
              multiple
              value={form.member_ids.map(String)}
              onChange={(event) =>
                setForm({
                  ...form,
                  member_ids: Array.from(event.target.selectedOptions).map((option) => Number(option.value))
                })
              }
            >
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.full_name}
                </option>
              ))}
            </select>
          </label>
          {editing ? (
            <div className={`md:col-span-2 mt-2 rounded-xl border p-4 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/[0.02]'}`}>
              <h4 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Currently working Members</h4>
              <p className={`mb-3 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Users actively assigned to tasks in this project.</p>
              {workingMembers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                {users
                  .filter((user) => workingMembers.includes(Number(user.user_id)))
                  .map((user) => {
                    const initials = user.full_name
                      .split(' ')
                      .filter((n) => n.length > 0)
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase();

                    return (
                      <div
                        key={user.user_id}
                        className={`pointer-events-none flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm transition-all ${
                          isLight
                            ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
                            : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200 shadow-glow'
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            isLight ? 'bg-cyan-600 text-white' : 'bg-cyan-500 text-ink-950'
                          }`}
                        >
                          {initials}
                        </div>
                        <span className="truncate max-w-[140px]">{user.full_name}</span>
                      </div>
                    );
                  })}
              </div>
              ) : (
                <p className="text-sm text-slate-500">No members are currently working on tasks in this project.</p>
              )}
            </div>
          ) : null}
        </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary">Save project</button>
            </div>
          </form>
        </div>,
        document.body
      ) : null}

      <ConfirmModal
        open={Boolean(archiveProject)}
        title="Archive project?"
        message="The project will be hidden from active planning views. Existing tasks remain available for reports."
        confirmText="Archive"
        onCancel={() => setArchiveProject(null)}
        onConfirm={archive}
      />

      {/* Project Detail & Task Breakdown Modal */}
      <ProjectDetailModal
        project={detailProject}
        users={users}
        onClose={() => setDetailProject(null)}
        onEditProject={openEdit}
      />
    </div>
  );
};

const ProjectStatCard = ({ label, value, detail, icon: Icon, tone }) => (
  <div className="project-stat-card" data-tone={tone}>
    <div>
      <p className="project-stat-label">{label}</p>
      <p className="project-stat-value">{value}</p>
      <p className="project-stat-detail">{detail}</p>
    </div>
    <span className="project-stat-icon">
      <Icon size={18} />
    </span>
  </div>
);

const ProjectDetailModal = ({ project, users = [], onClose, onEditProject }) => {
  const { isLight } = useTheme();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!project) return;
    let isMounted = true;
    const fetchProjectTasks = async () => {
      setLoading(true);
      try {
        const res = await taskService.list();
        const allTasks = Array.isArray(res) ? res : res?.tasks || [];
        const projectTasks = allTasks.filter(
          (t) => t && (String(t.project_id) === String(project.project_id) || (t.project_name && t.project_name === project.project_name))
        );
        if (isMounted) setTasks(projectTasks);
      } catch (err) {
        console.error('Failed to fetch tasks for project detail:', err);
        if (isMounted) setTasks([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProjectTasks();
    return () => {
      isMounted = false;
    };
  }, [project]);

  const assignedMembers = useMemo(() => {
    if (!project || !users || !Array.isArray(users) || !users.length) return [];
    let memberIds = [];
    if (project.member_ids) {
      let raw = project.member_ids;
      if (typeof raw === 'string' && raw.trim().startsWith('[')) {
        try { raw = JSON.parse(raw); } catch (e) {}
      } else if (typeof raw === 'string') {
        raw = raw.split(',');
      }
      const arr = Array.isArray(raw) ? raw : [raw];
      memberIds = arr.map((item) => {
        if (item && typeof item === 'object') {
          return item.user_id || item.id || item.member_id || Object.values(item)[0];
        }
        return item;
      }).map(Number).filter((n) => !isNaN(n));
    }
    return users.filter((u) => u && memberIds.includes(Number(u.user_id)));
  }, [project, users]);

  const metrics = useMemo(() => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const total = safeTasks.length;
    const completed = safeTasks.filter((t) => t && ((t.status || '').toUpperCase() === 'DONE' || (t.status || '').toUpperCase() === 'COMPLETED')).length;
    const points = safeTasks.reduce((sum, t) => sum + (Number(t?.story_points) || 0), 0);
    const completedPoints = safeTasks
      .filter((t) => t && ((t.status || '').toUpperCase() === 'DONE' || (t.status || '').toUpperCase() === 'COMPLETED'))
      .reduce((sum, t) => sum + (Number(t?.story_points) || 0), 0);
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, points, completedPoints, rate };
  }, [tasks]);

  if (!project) return null;

  return createPortal(
    <div className="app-modal-backdrop fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={clsx(
          'w-full max-w-3xl rounded-2xl border p-6 transition-all duration-300 shadow-2xl space-y-6',
          isLight
            ? 'border-slate-200 bg-white text-slate-900'
            : 'border-white/[0.08] bg-[#18181b] text-zinc-100'
        )}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            <div
              className={clsx(
                'flex h-12 w-12 items-center justify-center rounded-xl border text-base font-semibold transition-colors shrink-0',
                isLight
                  ? 'border-slate-300 bg-slate-100 text-slate-700'
                  : 'border-white/[0.08] bg-[#141417] text-zinc-200'
              )}
            >
              {getProjectInitials(project.project_name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{project.project_name || 'Untitled project'}</h3>
                <ProjectStatusBadge value={project.status} />
                <ProjectHealthBadge project={project} />
              </div>
              <p className={`mt-0.5 text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {project.description || 'No description set for this project space.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary px-3 text-xs flex items-center gap-1"
              onClick={() => {
                onClose();
                onEditProject(project);
              }}
            >
              <Edit3 size={14} />
              Edit
            </button>
            <button
              type="button"
              className={`rounded-full p-2 hover:bg-slate-500/20 ${isLight ? 'text-slate-400' : 'text-slate-400'}`}
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Project Key Metrics Grid */}
        <div className="grid gap-3 sm:grid-cols-4">
          <div className={`rounded-xl border p-3.5 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/[0.08] bg-[#141417]'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Total Tasks</p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black">{metrics.total}</span>
              <FolderKanban className={isLight ? 'text-cyan-600' : 'text-cyan-400'} size={18} />
            </div>
          </div>

          <div className={`rounded-xl border p-3.5 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/[0.08] bg-[#141417]'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Completion</p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-500">{metrics.rate}%</span>
              <CheckCircle2 className="text-emerald-500" size={18} />
            </div>
          </div>

          <div className={`rounded-xl border p-3.5 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/[0.08] bg-[#141417]'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Story Points</p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-500">{metrics.completedPoints}/{metrics.points}</span>
              <Gauge className="text-amber-500" size={18} />
            </div>
          </div>

          <div className={`rounded-xl border p-3.5 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/[0.08] bg-[#141417]'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>End Target Date</p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-sm font-bold truncate">{project.end_date ? formatDate(project.end_date) || 'Not set' : 'Not set'}</span>
              <Calendar className="text-slate-400" size={18} />
            </div>
          </div>
        </div>

        {/* Assigned Team Members */}
        {assignedMembers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <UsersIcon size={14} /> Assigned Team Members ({assignedMembers.length})
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {assignedMembers.map((m) => (
                <div
                  key={m.user_id}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${isLight ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-white/[0.08] bg-[#141417] text-zinc-200'}`}
                >
                  <Avatar name={m.full_name} size="sm" />
                  <span>{m.full_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project Tasks Breakdown List */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Project Tasks ({tasks.length})</h4>
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">Loading project task breakdown...</div>
          ) : tasks.length === 0 ? (
            <div className={`rounded-xl border p-8 text-center text-sm ${isLight ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-white/[0.08] bg-[#141417] text-zinc-400'}`}>
              No tasks currently linked to this project space.
            </div>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {tasks.map((task) => {
                if (!task) return null;
                const taskId = task.task_id || task.id;
                return (
                  <div
                    key={taskId}
                    onClick={() => {
                      onClose();
                      navigate(`/tasks?taskId=${taskId}`);
                    }}
                    className={clsx(
                      'group flex items-center justify-between rounded-xl border p-3 transition-all cursor-pointer hover:border-cyan-500/50',
                      isLight
                        ? 'border-slate-200 bg-slate-50/80 hover:bg-slate-100'
                        : 'border-white/[0.08] bg-[#141417] hover:bg-white/[0.05]'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={clsx('text-xs font-mono font-bold', isLight ? 'text-cyan-700' : 'text-cyan-400')}>#{taskId}</span>
                        <h5 className={clsx('truncate font-semibold text-sm transition-colors', isLight ? 'group-hover:text-cyan-700' : 'group-hover:text-cyan-400')}>
                          {task.task_title || task.title || 'Untitled task'}
                        </h5>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                        {task.assigned_user_name && (
                          <span>Assignee: {task.assigned_user_name}</span>
                        )}
                        {task.priority && (
                          <span className="capitalize">• {task.priority}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {task.story_points && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                          <Gauge size={11} />
                          {task.story_points} pt
                        </span>
                      )}
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300">
                        {task.status || 'TODO'}
                      </span>
                      <ExternalLink size={14} className={clsx('transition-colors', isLight ? 'text-slate-400 group-hover:text-cyan-700' : 'text-slate-500 group-hover:text-cyan-400')} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <button
            type="button"
            className="btn-secondary flex items-center gap-2 text-xs"
            onClick={() => {
              onClose();
              navigate('/kanban');
            }}
          >
            <FolderKanban size={15} />
            Open Kanban Board
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const ProjectNameCell = ({ project, onOpen }) => (
  <button
    className="project-name-cell"
    onClick={(event) => {
      event.stopPropagation();
      onOpen();
    }}
    type="button"
  >
    <span className="project-name-avatar">
      {getProjectInitials(project?.project_name)}
    </span>

    <span className="project-name-details">
      {project?.parent_project_name && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-500 dark:text-cyan-400">
          <span>{project.parent_project_name}</span>
          <span>➔</span>
        </span>
      )}
      <span className="project-name-title">
        {project?.project_name || 'Untitled project'}
      </span>

      <span className="project-name-description">
        {project?.description || 'No description added'}
      </span>
    </span>
  </button>
);

const ProjectTaskCount = ({ project }) => {
  const total = Number(project?.task_count || 0);
  const completed = Number(project?.completed_count || 0);

  return (
    <div className="project-task-pill">
      <span>{total}</span>
      <small>{completed} done</small>
    </div>
  );
};

const ProjectDateChip = ({ value }) => (
  <span className="project-date-chip">
    <CalendarDays size={13} />
    {formatDate(value) || 'N/A'}
  </span>
);

function getProjectInitials(name) {
  const str = String(name || '').trim();
  if (!str) return 'PR';
  return (
    str
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'PR'
  );
}

const Input = ({ label, type = 'text', value, onChange, required = false }) => (
  <label>
    <span className="label">{label}</span>
    <input className="input-field mt-1" type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
  </label>
);

function formatDate(value) {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString();
  } catch (e) {
    return '';
  }
}

function inputDate(value) {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  } catch (e) {
    return '';
  }
}

const ProjectStatusBadge = ({ value }) => {
  const { isLight } = useTheme();
  const colors = {
    'Active': isLight ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    'Completed': isLight ? 'border-blue-200 bg-blue-100 text-blue-700' : 'border-blue-400/30 bg-blue-400/10 text-blue-300',
    'On Hold': isLight ? 'border-amber-200 bg-amber-100 text-amber-700' : 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    'Archived': isLight ? 'border-slate-300 bg-slate-200 text-slate-700' : 'border-slate-500/30 bg-slate-500/10 text-slate-400',
  };
  const colorClass = colors[value] || (isLight ? 'border-cyan-200 bg-cyan-100 text-cyan-700' : 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300');
  
  return <span className={`badge ${colorClass}`}>{value || 'Active'}</span>;
};

export default Projects;
