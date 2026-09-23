import { useEffect, useState } from 'react';
import { MessageSquareText, Info, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { TASK_LOCATIONS, TASK_MODULES, TASK_PRIORITIES, TASK_STATUSES, TASK_WEIGHT_OPTIONS, TASK_WEIGHT_GUIDE } from '../constants/taskOptions';
import { useTheme } from '../context/ThemeContext';
import { groupProjectsByParent } from '../utils/projectGrouping';
import clsx from 'clsx';

const emptyTask = {
  task_title: '',
  description: '',
  assigned_user_id: '',
  employee_name: '',
  status: '',
  priority: '',
  project_id: '',
  module_name: '',
  start_date: '',
  end_date: '',
  due_date: '',
  onsite_offshore: 'Offshore',
  remarks: '',
  story_points: ''
};

const TaskForm = ({
  initialTask,
  users = [],
  projects = [],
  isAdmin,
  readOnly = false,
  loading,
  remarksCount = 0,
  canOpenRemarks = false,
  onOpenRemarks,
  onSubmit,
  onCancel
}) => {
  const { isLight } = useTheme();
  const [form, setForm] = useState(emptyTask);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({
      ...emptyTask,
      ...initialTask,
      story_points: initialTask?.story_points !== undefined && initialTask?.story_points !== null ? initialTask.story_points : '',
      status: initialTask?.status || '',
      priority: initialTask?.priority || '',
      assigned_user_id: initialTask?.assigned_user_id || '',
      project_id: initialTask?.project_id || '',
      start_date: inputDate(initialTask?.start_date),
      end_date: inputDate(initialTask?.end_date),
      due_date: inputDate(initialTask?.due_date)
    });
    setErrors({});
  }, [initialTask]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const moduleOptions =
    form.module_name && !TASK_MODULES.includes(form.module_name) ? [form.module_name, ...TASK_MODULES] : TASK_MODULES;

  const validate = () => {
    const errs = {};
    const title = (form.task_title || '').trim();

    if (!title) {
      errs.task_title = 'Task title is required.';
    } else if (title.length < 3) {
      errs.task_title = 'Task title must be at least 3 characters long.';
    }

    if (!form.status) {
      errs.status = 'Status is required.';
    }

    if (!form.priority) {
      errs.priority = 'Priority is required.';
    }

    if (!form.story_points) {
      errs.story_points = 'Task Weight (Points) is required.';
    }

    if (!form.project_id) {
      errs.project_id = 'Project selection is required.';
    }

    if (!form.module_name) {
      errs.module_name = 'Stream selection is required.';
    }

    if (!form.start_date) {
      errs.start_date = 'Start date is required.';
    }

    if (!form.due_date) {
      errs.due_date = 'Plan completion date is required.';
    }

    if (form.start_date && form.end_date) {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);
      if (end < start) {
        errs.end_date = 'End date cannot be earlier than Start date.';
      }
    }

    if (form.start_date && form.due_date) {
      const start = new Date(form.start_date);
      const due = new Date(form.due_date);
      if (due < start) {
        errs.due_date = 'Plan completion date cannot be earlier than Start date.';
      }
    }

    setErrors(errs);
    return errs;
  };

  const submit = (event) => {
    event.preventDefault();
    const validationErrors = validate();
    const errorKeys = Object.keys(validationErrors);
    if (errorKeys.length > 0) {
      toast.error(validationErrors[errorKeys[0]]);
      return;
    }

    onSubmit({
      ...form,
      task_title: form.task_title.trim(),
      story_points: Number(form.story_points),
      assigned_user_id: form.assigned_user_id || null,
      project_id: form.project_id || null
    });
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="label flex items-center justify-between">
            <span>Task title <span className="text-rose-500">*</span></span>
          </span>
          <input
            className={clsx(
              'input-field mt-1',
              errors.task_title && 'border-rose-500 focus:ring-rose-500/20'
            )}
            disabled={readOnly}
            value={form.task_title}
            onChange={(event) => update('task_title', event.target.value)}
            placeholder="Enter a descriptive task title (min 3 chars)..."
          />
          {errors.task_title && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-500">
              <AlertCircle size={13} />
              {errors.task_title}
            </p>
          )}
        </label>

        <label className="md:col-span-2">
          <span className="label">Description</span>
          <textarea
            className="input-field mt-1 min-h-24 resize-y"
            disabled={readOnly}
            value={form.description || ''}
            onChange={(event) => update('description', event.target.value)}
          />
        </label>

        {isAdmin ? (
          <label>
            <span className="label">Assigned user</span>
            <select
              className="input-field mt-1"
              disabled={readOnly}
              value={form.assigned_user_id || ''}
              onChange={(event) => update('assigned_user_id', event.target.value)}
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.full_name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label>
          <span className="label">Employee name</span>
          <input
            className="input-field mt-1"
            value={form.employee_name || ''}
            onChange={(event) => update('employee_name', event.target.value)}
            disabled={!isAdmin || readOnly}
          />
        </label>

        <label>
          <span className="label">Status <span className="text-rose-500">*</span></span>
          <select
            className={clsx('input-field mt-1', errors.status && 'border-rose-500 focus:ring-rose-500/20')}
            value={form.status || ''}
            onChange={(event) => update('status', event.target.value)}
            disabled={readOnly}
          >
            <option value="">Select status</option>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-500">
              <AlertCircle size={13} />
              {errors.status}
            </p>
          )}
        </label>

        <label>
          <span className="label">Priority <span className="text-rose-500">*</span></span>
          <select
            className={clsx('input-field mt-1', errors.priority && 'border-rose-500 focus:ring-rose-500/20')}
            value={form.priority || ''}
            onChange={(event) => update('priority', event.target.value)}
            disabled={readOnly}
          >
            <option value="">Select priority</option>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          {errors.priority && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-500">
              <AlertCircle size={13} />
              {errors.priority}
            </p>
          )}
        </label>

        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="label">Task Weight (Points) <span className="text-rose-500">*</span></span>
            <div className="group relative inline-flex items-center">
              <button
                type="button"
                className={`transition-colors focus:outline-none ${isLight ? 'text-slate-400 hover:text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`}
                aria-label="Task Weight Guide"
              >
                <Info size={15} />
              </button>
              <div className={`pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-80 rounded-xl border p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 ${
                isLight
                  ? 'border-slate-200 bg-white/95 text-slate-800 shadow-slate-300/40'
                  : 'border-white/[0.08] bg-[#18181b] text-zinc-100 shadow-black/60'
              }`}>
                <div className={`flex items-center justify-between border-b pb-2 ${isLight ? 'border-slate-100' : 'border-white/[0.08]'}`}>
                  <span className={`font-bold ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>Task Weight (Story Points) Guide</span>
                  <span className={`text-[10px] uppercase tracking-wider font-mono ${isLight ? 'text-slate-400' : 'text-zinc-400'}`}>Jira Standard</span>
                </div>
                <p className={`leading-relaxed text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                  Task weight measures complexity & effort. Hover to see how each weight maps to realistic work:
                </p>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {TASK_WEIGHT_OPTIONS.map((pts) => {
                    const guide = TASK_WEIGHT_GUIDE[pts];
                    return (
                      <div
                        key={pts}
                        className={`p-2 rounded-lg border flex flex-col gap-1 ${
                          isLight
                            ? 'bg-slate-50/80 border-slate-200/80'
                            : 'bg-[#141417] border-white/[0.08]'
                        }`}
                      >
                        <div className="flex justify-between items-center font-medium">
                          <span className={`font-semibold text-xs ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>
                            {guide?.label || `${pts} Points`}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                            isLight
                              ? 'text-amber-700 bg-amber-100'
                              : 'text-amber-300 bg-amber-500/15'
                          }`}>
                            {guide?.duration}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-snug ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                          <strong className={isLight ? 'text-slate-800' : 'text-slate-400'}>Example:</strong> {guide?.example}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <select
            className={clsx('input-field', errors.story_points && 'border-rose-500 focus:ring-rose-500/20')}
            disabled={readOnly}
            value={form.story_points ?? ''}
            onChange={(event) => update('story_points', event.target.value ? Number(event.target.value) : '')}
          >
            <option value="">Select task weight</option>
            {TASK_WEIGHT_OPTIONS.map((pts) => (
              <option key={pts} value={pts}>
                {pts} {pts === 1 ? 'Point' : 'Points'} ({TASK_WEIGHT_GUIDE[pts]?.duration || `${pts} pts`})
              </option>
            ))}
          </select>
          {errors.story_points && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-500">
              <AlertCircle size={13} />
              {errors.story_points}
            </p>
          )}
        </div>

        <label>
          <span className="label">Project <span className="text-rose-500">*</span></span>
          <select
            className={clsx('input-field mt-1', errors.project_id && 'border-rose-500 focus:ring-rose-500/20')}
            value={form.project_id || ''}
            onChange={(event) => update('project_id', event.target.value)}
            disabled={readOnly}
          >
            <option value="">Select project</option>
            {(() => {
              const { topLevel, groups } = groupProjectsByParent(projects);
              return (
                <>
                  {groups.map((group) => (
                    <optgroup key={group.parentName} label={group.parentName.toUpperCase()}>
                      {group.subProjects.map((sp) => (
                        <option key={sp.project_id} value={sp.project_id}>
                          {sp.project_name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  {topLevel.length > 0 && (
                    <optgroup label={groups.length > 0 ? 'Other Projects' : 'Projects'}>
                      {topLevel.map((p) => (
                        <option key={p.project_id} value={p.project_id}>
                          {p.project_name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </>
              );
            })()}
          </select>
          {errors.project_id && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-500">
              <AlertCircle size={13} />
              {errors.project_id}
            </p>
          )}
        </label>

        <label>
          <span className="label">Stream <span className="text-rose-500">*</span></span>
          <select
            className={clsx('input-field mt-1', errors.module_name && 'border-rose-500 focus:ring-rose-500/20')}
            disabled={readOnly}
            value={form.module_name || ''}
            onChange={(event) => update('module_name', event.target.value)}
          >
            <option value="">Select stream</option>
            {moduleOptions.map((module) => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </select>
          {errors.module_name && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-500">
              <AlertCircle size={13} />
              {errors.module_name}
            </p>
          )}
        </label>

        <label>
          <span className="label">Start date <span className="text-rose-500">*</span></span>
          <input
            className={clsx('input-field mt-1', errors.start_date && 'border-rose-500 focus:ring-rose-500/20')}
            type="date"
            disabled={readOnly}
            value={form.start_date || ''}
            onChange={(event) => update('start_date', event.target.value)}
          />
          {errors.start_date && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-500">
              <AlertCircle size={13} />
              {errors.start_date}
            </p>
          )}
        </label>

        <label>
          <span className="label">End date</span>
          <input
            className={clsx('input-field mt-1', errors.end_date && 'border-rose-500 focus:ring-rose-500/20')}
            type="date"
            disabled={readOnly}
            value={form.end_date || ''}
            onChange={(event) => update('end_date', event.target.value)}
          />
          {errors.end_date && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-500">
              <AlertCircle size={13} />
              {errors.end_date}
            </p>
          )}
        </label>

        <label>
          <span className="label">Plan completion date <span className="text-rose-500">*</span></span>
          <input
            className={clsx('input-field mt-1', errors.due_date && 'border-rose-500 focus:ring-rose-500/20')}
            type="date"
            disabled={readOnly}
            value={form.due_date || ''}
            onChange={(event) => update('due_date', event.target.value)}
          />
          {errors.due_date && (
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-500">
              <AlertCircle size={13} />
              {errors.due_date}
            </p>
          )}
        </label>

        <label>
          <span className="label">Onsite/Offshore</span>
          <select
            className="input-field mt-1"
            disabled={readOnly}
            value={form.onsite_offshore || 'Offshore'}
            onChange={(event) => update('onsite_offshore', event.target.value)}
          >
            {TASK_LOCATIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>

        <div className="md:col-span-2 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="label">Daily Progress Remarks</span>
              <p className="mt-1 text-xs text-slate-400">{remarksCount} date-wise work updates logged</p>
            </div>
            <button
              type="button"
              className="btn-secondary text-xs flex items-center gap-1.5"
              disabled={!canOpenRemarks}
              onClick={onOpenRemarks}
              title={canOpenRemarks ? 'Open daily progress remarks' : 'Save task before remarks'}
            >
              <MessageSquareText size={15} />
              Daily Remarks
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          {readOnly ? 'Close' : 'Cancel'}
        </button>
        {!readOnly ? (
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save task'}
          </button>
        ) : null}
      </div>
    </form>
  );
};

const inputDate = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

export default TaskForm;
