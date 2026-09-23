import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, MessageSquare, CheckCircle2, Gauge } from 'lucide-react';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { generateHslColorFromString } from '../lib/utils';
import Avatar from './Avatar';

// Premium priority colors for dark theme
const priorityClassDark = {
  Low: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  Medium: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
  High: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  Critical: 'border-rose-400/30 bg-rose-400/10 text-rose-200'
};

// Premium priority colors for light theme
const priorityClassLight = {
  Low: 'border-emerald-500/40 bg-emerald-50 text-emerald-700',
  Medium: 'border-cyan-500/40 bg-cyan-50 text-cyan-700',
  High: 'border-amber-500/40 bg-amber-50 text-amber-700',
  Critical: 'border-rose-500/40 bg-rose-50 text-rose-700'
};

// Premium card class name generator
const getCardClassName = (isLight) => clsx(
  'relative rounded-2xl border p-3.5 transition-all duration-200 overflow-hidden',
  isLight
    ? 'border-slate-200/80 bg-white shadow-xs hover:border-slate-300 hover:shadow-md'
    : 'border-white/[0.08] bg-[#18181b] shadow-sm hover:border-white/[0.18] hover:bg-[#1c1c20]'
);

const TaskCard = ({ task, users, onOpen, readOnly = false, isActive = false }) => {
  const { isLight } = useTheme();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `task:${task.task_id}`,
    data: { task, type: 'task' },
    disabled: readOnly
  });

  const isStale = useMemo(() => {
    if (!['In Progress', 'In Review', 'Testing'].includes(task.status)) return false;
    const now = new Date();
    const updatedAt = new Date(task.updated_at);
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    return (now.getTime() - updatedAt.getTime()) > threeDays;
  }, [task.status, task.updated_at]);

  return (
    <motion.article
      ref={setNodeRef}
      {...(readOnly ? {} : listeners)}
      {...(readOnly ? {} : attributes)}
      onClick={() => {
        if (!isDragging && !isActive) {
          onOpen(task);
        }
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={clsx(
        getCardClassName(isLight),
        readOnly ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing',
        (isDragging || isActive) && 'opacity-0',
        isStale && 'task-card-stale'
      )}
    >
      <TaskCardBody task={task} users={users} isLight={isLight} isStale={isStale} />
    </motion.article>
  );
};

export const TaskCardPreview = ({ task, users, width, isStale }) => {
  const { isLight } = useTheme();

  return (
    <article
      className={clsx(
        getCardClassName(isLight),
        'pointer-events-none cursor-grabbing border-cyan-300/70 opacity-100 shadow-2xl ring-2 ring-cyan-400/35 transition-none'
      )}
      style={{ width: width || '18.5rem' }}
    >
      <TaskCardBody task={task} users={users} isLight={isLight} isStale={isStale} />
    </article>
  );
};

const TaskCardBody = ({ task, users, isLight, isStale }) => {
  const priorityClass = isLight ? priorityClassLight : priorityClassDark;
  // const projectColor = generateHslColorFromString(task.project_name || '', 60, 55);
  const projectColor = generateHslColorFromString(
    task.project_name || '',
    isLight ? 78 : 60,
    isLight ? 42 : 55
  );


  const assigneeName = task.assigned_user_name || task.employee_name;
  const assignedUser = users?.find(u => u.full_name === assigneeName);

  // --- Mock data for sub-tasks feature ---
  const subtasks = {
    total: task.priority === 'Critical' ? 5 : (task.priority === 'High' ? 3 : 0),
    completed: task.priority === 'Critical' ? 2 : (task.priority === 'High' ? 1 : 0),
  };
  const hasSubtasks = subtasks.total > 0;
  const subtaskProgress = hasSubtasks ? (subtasks.completed / subtasks.total) * 100 : 0;
  // --- End of mock data ---

  return (
    <>
      {/* <span
        className="absolute left-0 top-0 h-full w-1.5"
        style={{ backgroundColor: projectColor }}
      /> */}

      <span
        aria-hidden="true"
        className={clsx(
          'absolute inset-y-0 left-0 w-1.5 rounded-l-xl',
          isLight ? 'opacity-100 shadow-[2px_0_8px_rgba(219,39,119,0.18)]' : 'opacity-90'
        )}
        style={{
          background: `linear-gradient(180deg, ${projectColor}, ${projectColor}cc)`
        }}
      />
      {/* Title and Badges (Priority & Story Points) */}
      <div className="flex items-start justify-between gap-3">
        <h3 className={clsx(
          'line-clamp-2 text-sm font-bold leading-snug',
          isLight ? 'text-slate-800' : 'text-white'
        )}>
          {task.task_title}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            title={`Task Weight: ${task.story_points || 1} ${task.story_points === 1 ? 'Point' : 'Points'}`}
            className={clsx(
              'badge shrink-0 rounded-lg px-2 py-0.5 text-[9px] font-extrabold tracking-wide flex items-center gap-1.5',
              isLight
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                : 'border-indigo-500/30 bg-indigo-500/15 text-indigo-300'
            )}
          >
            <Gauge size={11} className={isLight ? 'text-indigo-600' : 'text-indigo-400'} />
            <span>{task.story_points || 1} {task.story_points === 1 ? 'pt' : 'pts'}</span>
          </span>
          <span className={clsx(
            'badge shrink-0 rounded-lg px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider',
            priorityClass[task.priority] || priorityClass.Medium
          )}>
            {task.priority || 'Medium'}
          </span>
        </div>
      </div>

      {/* Sub-task Progress (Placeholder) */}
      {hasSubtasks && (
        <div className="mt-3 space-y-1.5 text-[11px]">
          {/* This is a placeholder. Replace with real sub-task data from your backend. */}
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className={isLight ? 'text-sky-600' : 'text-sky-400'} />
            <span className={clsx('font-semibold', isLight ? 'text-slate-500' : 'text-slate-400')}>
              {subtasks.completed} of {subtasks.total} sub-tasks done
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200/50 dark:bg-slate-700/50">
            <div
              className="h-1.5 rounded-full bg-sky-500"
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Task Details */}
      <div className="mt-3 space-y-2.5 text-[11px]">
        {/* Assignee */}
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              'task-card-assignee-avatar shrink-0 rounded-full',
              isLight && 'task-card-assignee-avatar-light'
            )}
          >
            <Avatar
              name={assigneeName}
              imageUrl={assignedUser?.image_url}
              size="sm"
            />
          </div>
          <span className={clsx('truncate font-medium', isLight ? 'text-slate-600' : 'text-slate-400')}>
            {assigneeName || 'Unassigned'}
          </span>
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-2.5">
          <div className={clsx(
            'task-card-icon flex h-6 w-6 items-center justify-center rounded-lg',
            isLight ? 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200/50' : 'bg-white/10'
          )}>
            <CalendarDays size={12} className={isLight ? 'text-green-500' : 'text-slate-400'} />
          </div>
          <span className={clsx('font-medium', isLight ? 'text-slate-600' : 'text-slate-400')}>
            {formatDate(task.due_date) || 'No due date'}
          </span>
        </div>

        {/* Project/Module */}
        <div className="flex items-center gap-2.5">
          <div className={clsx(
            'task-card-icon flex h-6 w-6 items-center justify-center rounded-lg',
            isLight ? 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200/50' : 'bg-white/10'
          )}>
            <MapPin size={12} className={isLight ? 'text-red-500' : 'text-slate-400'} />
          </div>
          <span className={clsx('font-medium', isLight ? 'text-slate-600' : 'text-slate-300')}>
            {task.project_name || 'No project'} · {task.module_name || 'No module'} · {task.onsite_offshore || 'N/A'}
          </span>
        </div>

        {/* Remarks Preview */}
        {/* {task.remarks ? (
          <div className={clsx(
            'flex gap-2.5 rounded-lg p-2.5 transition-all',
            isLight ? 'bg-gradient-to-r from-cyan-50/80 to-sky-50/40 border border-cyan-200/60 shadow-xs' : 'bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20'
          )}>
            <MessageSquare size={14} className={clsx('mt-0.5 shrink-0', isLight ? 'text-cyan-600' : 'text-cyan-400')} />
            <span className={clsx('line-clamp-2 font-medium text-[11px]', isLight ? 'text-slate-700' : 'text-slate-300')}>
              {task.remarks}
            </span>
          </div>
        ) : null} */}
      </div>
    </>
  );
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString();
};

export default TaskCard;