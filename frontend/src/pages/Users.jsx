import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart2,
  Briefcase,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Edit3,
  ExternalLink,
  Filter,
  Gauge,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  User,
  UsersRound,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import DataTable from '../components/DataTable';
import UserAuditLogModal from '../components/UserAuditLogModal';
import { useTheme } from '../context/ThemeContext';
import { getErrorMessage } from '../services/api';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import clsx from 'clsx';

const emptyUser = {
  full_name: '',
  email: '',
  password: '',
  role: 'user',
  designation: '',
  status: 'Active'
};

const initialFilters = {
  search: '',
  role: 'all',
  status: 'all',
  designation: 'all'
};

const Users = () => {
  const { isLight } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyUser);
  const [editing, setEditing] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [workloadUser, setWorkloadUser] = useState(null);
  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const exportUsersToCSV = () => {
    if (!filteredUsers.length) {
      toast.error('No users available to export');
      return;
    }
    const headers = ['User ID', 'Full Name', 'Email', 'Role', 'Designation', 'Status', 'Assigned Tasks', 'Created At'];
    const rows = filteredUsers.map((u) => [
      u.user_id,
      `"${(u.full_name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.role_name || 'user').replace(/"/g, '""')}"`,
      `"${(u.designation || 'N/A').replace(/"/g, '""')}"`,
      `"${(u.status || 'Active').replace(/"/g, '""')}"`,
      u.task_count || 0,
      u.created_at ? new Date(u.created_at).toISOString().slice(0, 10) : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `user_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredUsers.length} users to CSV`);
  };

  const availableDesignations = useMemo(() => {
    const set = new Set();
    users.forEach((u) => {
      if (u.designation && u.designation.trim()) {
        set.add(u.designation.trim());
      }
    });
    return Array.from(set).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName = (user.full_name || '').toLowerCase().includes(q);
        const matchEmail = (user.email || '').toLowerCase().includes(q);
        const matchDesig = (user.designation || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchDesig) return false;
      }

      if (filters.role !== 'all') {
        if ((user.role_name || 'user') !== filters.role) return false;
      }

      if (filters.status !== 'all') {
        if ((user.status || 'Active') !== filters.status) return false;
      }

      if (filters.designation !== 'all') {
        if ((user.designation || '') !== filters.designation) return false;
      }

      return true;
    });
  }, [users, filters]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([_, val]) => val !== 'all' && Boolean(val)).length;
  }, [filters]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pageStart = filteredUsers.length ? (page - 1) * pageSize + 1 : 0;
  const pageEnd = Math.min(page * pageSize, filteredUsers.length);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);
  const userStats = useMemo(() => {
    const activeUsers = users.filter((user) => user.status === 'Active').length;
    const adminUsers = users.filter((user) => user.role_name === 'admin').length;
    const totalTasks = users.reduce((sum, user) => sum + Number(user.task_count || 0), 0);

    return [
      {
        label: 'Total users',
        value: users.length,
        detail: 'workspace seats',
        icon: UsersRound,
        tone: 'cyan'
      },
      {
        label: 'Active',
        value: activeUsers,
        detail: 'can sign in',
        icon: CheckCircle2,
        tone: 'emerald'
      },
      {
        label: 'Admins',
        value: adminUsers,
        detail: 'control access',
        icon: ShieldCheck,
        tone: 'blue'
      },
      {
        label: 'Ownership',
        value: totalTasks,
        detail: 'assigned tasks',
        icon: BriefcaseBusiness,
        tone: 'amber'
      }
    ];
  }, [users]);

  const load = async () => {
    setLoading(true);
    try {
      setUsers(await userService.list());
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
    setForm(emptyUser);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      full_name: user.full_name || '',
      email: user.email || '',
      password: '',
      role: user.role_name || 'user',
      designation: user.designation || '',
      status: user.status || 'Active'
    });
    setModalOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form };
      if (editing && !payload.password) delete payload.password;
      if (editing) {
        await userService.update(editing.user_id, payload);
        toast.success('User updated');
      } else {
        await userService.create(payload);
        toast.success('User created');
      }
      setModalOpen(false);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const deactivate = async () => {
    try {
      await userService.remove(deleteUser.user_id);
      toast.success('User deactivated');
      setDeleteUser(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // const columns = [
  //   { key: 'full_name', header: 'User', render: (user) => <UserIdentityCell user={user} onOpen={() => openEdit(user)} /> },
  //   { key: 'role_name', header: 'Role', render: (user) => <UserRoleBadge value={user.role_name} /> },
  //   { key: 'designation', header: 'Designation', render: (user) => <UserDesignation value={user.designation} /> },
  //   { key: 'status', header: 'Status', render: (user) => <UserStatusBadge value={user.status} /> },
  //   { key: 'task_count', header: 'Tasks', render: (user) => <UserTaskPill value={user.task_count} /> },
  //   {
  //     key: 'actions',
  //     header: '',
  //     render: (user) => (
  //       <div className="flex justify-center gap-2">
  //         <button className="btn-secondary px-3" onClick={() => openEdit(user)} title="Edit user">
  //           <Edit3 size={15} />
  //         </button>
  //         <button className="btn-danger px-3" onClick={() => setDeleteUser(user)} title="Deactivate user">
  //           <Trash2 size={15} />
  //         </button>
  //       </div>
  //     )
  //   }
  // ];


  const columns = [
    {
      key: 'full_name',
      header: 'User',
      align: 'center',
      headerClassName: 'md:-translate-x-4',
      render: (user) => (
        <UserIdentityCell
          user={user}
          onOpen={() => setWorkloadUser(user)}
        />
      )
    },
    {
      key: 'role_name',
      header: 'Role',
      align: 'center',
      render: (user) => <UserRoleBadge value={user.role_name} />
    },
    {
      key: 'designation',
      header: 'Designation',
      align: 'center',
      render: (user) => <UserDesignation value={user.designation} />
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (user) => <UserStatusBadge value={user.status} />
    },
    {
      key: 'task_count',
      header: 'Tasks',
      align: 'center',
      render: (user) => <UserTaskPill value={user.task_count} />
    },
    {
      key: 'actions',
      header: '',
      align: 'center',
      render: (user) => (
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
              setWorkloadUser(user);
            }}
            title="View User Workload & Performance"
          >
            <BarChart2 size={15} />
          </button>

          <button
            type="button"
            className="btn-secondary px-3"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(user);
            }}
            title="Edit user"
          >
            <Edit3 size={15} />
          </button>

          <button
            type="button"
            className="btn-danger px-3"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteUser(user);
            }}
            title="Deactivate user"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      <section className="people-command-panel flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <p className="people-command-eyebrow">Access control</p>
          <h2 className="people-command-title">User Management</h2>
          <p className="people-command-copy">Create users, assign roles, reset passwords, and monitor task ownership.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-secondary flex items-center gap-2 border-cyan-500/40 text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-transparent hover:bg-cyan-100/60 dark:hover:bg-cyan-500/10 hover:border-cyan-500/60 shadow-sm dark:shadow-none transition-colors"
            onClick={() => setAuditLogOpen(true)}
            title="View User Audit Logs & Role History"
          >
            <ShieldAlert size={16} />
            Audit Logs
          </button>
          <button
            type="button"
            className="btn-secondary flex items-center gap-2"
            onClick={exportUsersToCSV}
            title="Export user list to CSV"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
            <Plus size={17} />
            Create user
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {userStats.map((item) => (
          <UserStatCard key={item.label} {...item} />
        ))}
      </section>

      {/* User Management Filters Toolbar */}
      <div
        className={clsx(
          'rounded-2xl border p-3.5 backdrop-blur-md transition-all duration-300 space-y-3',
          isLight
            ? 'border-slate-200/80 bg-white/80 shadow-md shadow-slate-200/15'
            : 'border-white/[0.08] bg-[#141417] shadow-xl shadow-black/30'
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-64 sm:w-72 md:w-80 flex-shrink-0">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} size={16} />
            <input
              type="text"
              className={clsx(
                'w-full rounded-full border py-2 pl-10 pr-9 text-sm transition-all duration-200 focus:outline-none focus:ring-2',
                isLight
                  ? 'border-slate-200 bg-slate-50/80 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20'
                  : 'border-white/[0.08] bg-[#141417] text-zinc-100 placeholder-zinc-500 focus:border-zinc-700'
              )}
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-slate-500/20 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters on the right */}
          <div className="flex flex-wrap items-center gap-3 ml-auto">
            {/* Role Filter */}
            <div className="relative min-w-[130px]">
              <ShieldCheck className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} size={15} />
              <select
                className={clsx(
                  'w-full appearance-none rounded-full border py-2 pl-9 pr-8 text-sm transition-all duration-200 focus:outline-none focus:ring-2 cursor-pointer',
                  isLight
                    ? 'border-slate-200 bg-slate-50/80 text-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20'
                    : 'border-white/[0.08] bg-[#141417] text-zinc-100 focus:border-zinc-700'
                )}
                value={filters.role}
                onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <ChevronDown className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} size={14} />
            </div>

            {/* Status Filter */}
            <div className="relative min-w-[130px]">
              <Activity className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} size={15} />
              <select
                className={clsx(
                  'w-full appearance-none rounded-full border py-2 pl-9 pr-8 text-sm transition-all duration-200 focus:outline-none focus:ring-2 cursor-pointer',
                  isLight
                    ? 'border-slate-200 bg-slate-50/80 text-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20'
                    : 'border-white/[0.08] bg-[#141417] text-zinc-100 focus:border-zinc-700'
                )}
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} size={14} />
            </div>

            {/* Designation Filter */}
            {availableDesignations.length > 0 && (
              <div className="relative min-w-[160px]">
                <BriefcaseBusiness className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} size={15} />
                <select
                  className={clsx(
                    'w-full appearance-none rounded-full border py-2 pl-9 pr-8 text-sm transition-all duration-200 focus:outline-none focus:ring-2 cursor-pointer',
                    isLight
                      ? 'border-slate-200 bg-slate-50/80 text-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20'
                      : 'border-white/[0.08] bg-[#141417] text-zinc-100 focus:border-zinc-700'
                  )}
                  value={filters.designation}
                  onChange={(e) => setFilters((prev) => ({ ...prev, designation: e.target.value }))}
                >
                  <option value="all">All Designations</option>
                  {availableDesignations.map((desig) => (
                    <option key={desig} value={desig}>
                      {desig}
                    </option>
                  ))}
                </select>
                <ChevronDown className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} size={14} />
              </div>
            )}

            {/* Reset button */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => setFilters(initialFilters)}
                className={clsx(
                  'flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all',
                  isLight
                    ? 'border-cyan-300 bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                    : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
                )}
              >
                <RotateCcw size={13} />
                Reset filters ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={paginatedUsers} loading={loading} emptyText={activeFilterCount > 0 ? "No users match the selected filters." : "No users found."} onRowClick={openEdit} />

      <div className="people-pagination-bar flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="people-pagination-copy text-sm">
          Showing <span>{pageStart}</span>-<span>{pageEnd}</span> of <span>{filteredUsers.length}</span> users
          {filteredUsers.length !== users.length && (
            <span className="ml-1 opacity-70">(filtered from {users.length} total)</span>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <label className="people-pagination-copy flex items-center gap-2 text-sm">
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
            <span className="people-page-count min-w-24 text-center text-sm font-semibold">
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
          <form className="glass-panel w-full max-w-2xl p-5" onSubmit={save}>
            <h3 className="text-lg font-bold text-white">{editing ? 'Edit user' : 'Create user'}</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input label="Full name" value={form.full_name} onChange={(value) => setForm({ ...form, full_name: value })} required />
              <Input label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
              <Input
                label={editing ? 'New password' : 'Password'}
                type="password"
                value={form.password}
                onChange={(value) => setForm({ ...form, password: value })}
                required={!editing}
              />
              <label>
                <span className="label">Role</span>
                <select className="input-field mt-1" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <Input label="Designation" value={form.designation} onChange={(value) => setForm({ ...form, designation: value })} />
              <label>
                <span className="label">Status</span>
                <select className="input-field mt-1" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary">
                <RefreshCcw size={16} />
                Save user
              </button>
            </div>
          </form>
        </div>,
        document.body
      ) : null}

      <ConfirmModal
        open={Boolean(deleteUser)}
        title="Deactivate user?"
        message="The user will no longer be able to sign in. Existing tasks remain assigned for reporting."
        confirmText="Deactivate"
        onCancel={() => setDeleteUser(null)}
        onConfirm={deactivate}
      />

      {/* User Workload Drawer Modal */}
      <UserWorkloadModal
        user={workloadUser}
        onClose={() => setWorkloadUser(null)}
        onEditUser={openEdit}
      />

      {/* User Audit Log Modal */}
      <UserAuditLogModal
        open={auditLogOpen}
        onClose={() => setAuditLogOpen(false)}
      />
    </div>
  );
};

const UserWorkloadModal = ({ user, onClose, onEditUser }) => {
  const { isLight } = useTheme();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchUserTasks = async () => {
      setLoading(true);
      try {
        const allTasks = await taskService.list();
        const userAssigned = allTasks.filter(
          (t) => String(t.assigned_user_id) === String(user.user_id)
        );
        setTasks(userAssigned);
      } catch (err) {
        toast.error('Failed to load user task workload');
      } finally {
        setLoading(false);
      }
    };
    fetchUserTasks();
  }, [user]);

  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => (t.status || '').toUpperCase() === 'DONE' || (t.status || '').toUpperCase() === 'COMPLETED').length;
    const overdue = tasks.filter((t) => {
      if (!t.due_date) return false;
      const statusUpper = (t.status || '').toUpperCase();
      if (statusUpper === 'DONE' || statusUpper === 'COMPLETED') return false;
      return new Date(t.due_date) < new Date();
    }).length;
    const points = tasks.reduce((sum, t) => sum + (Number(t.story_points) || 0), 0);
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, overdue, points, rate };
  }, [tasks]);

  if (!user) return null;

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
                'flex h-12 w-12 items-center justify-center rounded-full border text-base font-semibold transition-colors shrink-0',
                isLight
                  ? 'border-slate-300 bg-slate-100 text-slate-700'
                  : 'border-white/[0.08] bg-[#141417] text-zinc-200'
              )}
            >
              {getUserInitials(user.full_name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{user.full_name || 'Unnamed user'}</h3>
                <UserRoleBadge value={user.role_name} />
                <UserStatusBadge value={user.status} />
              </div>
              <p className={`mt-0.5 text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {user.email} • {user.designation || 'No designation set'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary px-3 text-xs flex items-center gap-1"
              onClick={() => {
                onClose();
                onEditUser(user);
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

        {/* Workload Stats Row */}
        <div className="grid gap-3 sm:grid-cols-4">
          <div className={`rounded-xl border p-3.5 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/[0.08] bg-[#141417]'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Assigned Tasks</p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black">{metrics.total}</span>
              <Briefcase className={isLight ? 'text-cyan-600' : 'text-cyan-400'} size={18} />
            </div>
          </div>

          <div className={`rounded-xl border p-3.5 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/[0.08] bg-[#141417]'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Story Points</p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-400">{metrics.points}</span>
              <Gauge className="text-amber-400" size={18} />
            </div>
          </div>

          <div className={`rounded-xl border p-3.5 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/[0.08] bg-[#141417]'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Completion Rate</p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-400">{metrics.rate}%</span>
              <CheckCircle2 className="text-emerald-400" size={18} />
            </div>
          </div>

          <div className={`rounded-xl border p-3.5 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/[0.08] bg-[#141417]'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Overdue Tasks</p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className={`text-2xl font-black ${metrics.overdue > 0 ? 'text-rose-400' : ''}`}>{metrics.overdue}</span>
              <AlertTriangle className={metrics.overdue > 0 ? 'text-rose-400' : 'text-slate-500'} size={18} />
            </div>
          </div>
        </div>

        {/* Assigned Tasks Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Assigned Tasks ({tasks.length})</h4>
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">Loading tasks workload...</div>
          ) : tasks.length === 0 ? (
            <div className={`rounded-xl border p-8 text-center text-sm ${isLight ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-white/[0.08] bg-[#141417] text-zinc-400'}`}>
              No tasks currently assigned to this user.
            </div>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task.task_id}
                  onClick={() => {
                    onClose();
                    navigate(`/tasks?taskId=${task.task_id}`);
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
                      <span className={clsx('text-xs font-mono font-bold', isLight ? 'text-cyan-700' : 'text-cyan-400')}>#{task.task_id}</span>
                      <h5 className={clsx('truncate font-semibold text-sm transition-colors', isLight ? 'group-hover:text-cyan-700' : 'group-hover:text-cyan-400')}>
                        {task.task_title || task.title || 'Untitled task'}
                      </h5>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(task.due_date).toISOString().slice(0, 10)}
                        </span>
                      )}
                      {task.priority && (
                        <span className="capitalize text-slate-300">• {task.priority}</span>
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
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-white/10 pt-4">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const Input = ({ label, type = 'text', value, onChange, required = false }) => (
  <label>
    <span className="label">{label}</span>
    <input className="input-field mt-1" type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
  </label>
);

const UserStatCard = ({ label, value, detail, icon: Icon, tone }) => (
  <div className="people-stat-card" data-tone={tone}>
    <div>
      <p className="people-stat-label">{label}</p>
      <p className="people-stat-value">{value}</p>
      <p className="people-stat-detail">{detail}</p>
    </div>
    <span className="people-stat-icon">
      <Icon size={18} />
    </span>
  </div>
);

// const UserIdentityCell = ({ user, onOpen }) => (
//   <button className="people-name-cell" onClick={onOpen} type="button">
//     <span className="people-avatar">{getUserInitials(user.full_name)}</span>
//     <span className="min-w-0 text-left">
//       <span className="people-name-title">{user.full_name || 'Unnamed user'}</span>
//       <span className="people-name-description">{user.email || 'No email added'}</span>
//     </span>
//   </button>
// );

const UserIdentityCell = ({ user, onOpen }) => (
  <button
    className="people-name-cell"
    onClick={(event) => {
      event.stopPropagation();
      onOpen();
    }}
    type="button"
  >
    <span className="people-avatar">
      {getUserInitials(user.full_name)}
    </span>

    <span className="people-user-details">
      <span className="people-name-title">
        {user.full_name || 'Unnamed user'}
      </span>

      <span className="people-name-description">
        {user.email || 'No email added'}
      </span>
    </span>
  </button>
);

const UserRoleBadge = ({ value }) => (
  <span className="people-role-badge" data-role={value || 'user'}>
    {value || 'user'}
  </span>
);

const UserStatusBadge = ({ value }) => (
  <span className="people-status-badge" data-status={value || 'Inactive'}>
    <Activity size={12} />
    {value || 'Inactive'}
  </span>
);

const UserDesignation = ({ value }) => (
  <span className="people-designation-pill">{value || 'N/A'}</span>
);

const UserTaskPill = ({ value }) => (
  <span className="people-task-pill">
    <BriefcaseBusiness size={13} />
    {Number(value || 0)}
  </span>
);

function getUserInitials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'US';
}

export default Users;
