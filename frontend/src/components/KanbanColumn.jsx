import { useDroppable } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsLeft, ChevronsRight, Gauge } from 'lucide-react';
import clsx from 'clsx';
import TaskCard from './TaskCard';
import { useTheme } from '../context/ThemeContext';

const KanbanColumn = ({ status, tasks, users, readOnly = false, activeTaskId, collapsedColumns, onToggleCollapse, onOpenTask }) => {
  const { isLight } = useTheme();
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { status }, disabled: readOnly });

  const isCollapsed = collapsedColumns.includes(status);
  const totalPoints = tasks.reduce((sum, t) => sum + (Number(t.story_points) || 1), 0);

  // Status-based colors for column headers
  const statusColors = {
    'Backlog': { dark: 'bg-blue-500/10 border-blue-500/20 text-blue-400', light: 'bg-blue-50 text-blue-700', text: 'text-blue-400', dot: 'bg-blue-400' },
    'To Do': { dark: 'bg-sky-500/10 border-sky-500/20 text-sky-400', light: 'bg-sky-50 text-sky-700', text: 'text-sky-400', dot: 'bg-sky-400' },
    'In Progress': { dark: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400', light: 'bg-indigo-50 text-indigo-700', text: 'text-indigo-400', dot: 'bg-indigo-400' },
    'In Review': { dark: 'bg-purple-500/10 border-purple-500/20 text-purple-400', light: 'bg-purple-50 text-purple-700', text: 'text-purple-400', dot: 'bg-purple-400' },
    'Testing': { dark: 'bg-amber-500/10 border-amber-500/20 text-amber-400', light: 'bg-amber-50 text-amber-700', text: 'text-amber-400', dot: 'bg-amber-400' },
    'Blocked': { dark: 'bg-rose-500/10 border-rose-500/20 text-rose-400', light: 'bg-rose-50 text-rose-700', text: 'text-rose-400', dot: 'bg-rose-400' },
    'Completed': { dark: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', light: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-400', dot: 'bg-emerald-400' }
  };

  const color = statusColors[status] || statusColors['To Do'];

  return (
    <motion.section
      ref={setNodeRef}
      initial={false}
      animate={{ width: isCollapsed ? 64 : 320 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      className={clsx(
        'relative flex h-[calc(100vh-13rem)] min-h-[32rem] shrink-0 flex-col overflow-hidden rounded-2xl border select-none transition-all duration-200',
        isCollapsed ? 'cursor-pointer hover:border-white/20' : '',
        isOver
          ? 'z-20 border-indigo-500/60 shadow-xl ring-1 ring-indigo-500/20'
          : isLight
          ? 'border-slate-200/80 bg-slate-50/70 shadow-xs'
          : 'border-white/[0.08] bg-[#121215] shadow-sm'
      )}
      onClick={() => {
        if (isCollapsed) {
          onToggleCollapse(status);
        }
      }}
      title={isCollapsed ? `Click to expand ${status} column` : undefined}
    >
      {/* Column Header */}
      <div className={clsx(
        'flex items-center justify-between border-b px-4 py-3.5 transition-colors h-14 shrink-0 overflow-hidden',
        isLight
          ? 'border-slate-200/60 bg-white'
          : 'border-white/[0.08] bg-[#18181b]'
      )}>
        {!isCollapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between w-full min-w-[17.5rem]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span className={clsx('absolute h-full w-full rounded-full animate-ping', color.dot, isLight ? 'opacity-40' : 'opacity-60')} />
                <span className={clsx('relative h-2 w-2 rounded-full', color.dot)} />
              </span>
              <h2 className={clsx('text-sm font-bold truncate', isLight ? 'text-slate-700' : 'text-white')}>
                {status}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span
                title={`${tasks.length} task${tasks.length === 1 ? '' : 's'} (${totalPoints} total pts)`}
                className={clsx(
                  'rounded-full border px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 shrink-0',
                  isLight
                    ? 'border-slate-200 bg-slate-100 text-slate-600'
                    : 'border-white/10 bg-white/10 text-slate-300'
                )}
              >
                <span>{tasks.length}</span>
                <span className="opacity-40">•</span>
                <span className="flex items-center gap-1 text-indigo-400 font-bold">
                  <Gauge size={12} className={isLight ? 'text-indigo-600' : 'text-indigo-400'} />
                  {totalPoints} pts
                </span>
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse(status);
                }}
                className={clsx(
                  'rounded-lg p-1.5 transition-colors shrink-0',
                  isLight
                    ? 'text-slate-400 hover:bg-slate-200/70 hover:text-slate-700'
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
                )}
                title="Collapse column"
              >
                <ChevronsLeft size={18} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full flex items-center justify-center"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse(status);
              }}
              className={clsx(
                'rounded-lg p-1.5 transition-all transform hover:scale-110',
                isLight
                  ? 'text-indigo-600 hover:bg-indigo-100/70'
                  : 'text-indigo-400 hover:bg-indigo-500/20'
              )}
              title="Expand / Maximize column"
            >
              <ChevronsRight size={20} />
            </button>
          </motion.div>
        )}
      </div>

      {/* Body Section */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <AnimatePresence initial={false}>
          {!isCollapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="absolute inset-0 space-y-3 overflow-y-auto p-3 w-80"
            >
              {tasks.length ? (
                tasks.map((task, index) => (
                  <motion.div
                    key={task.task_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02, duration: 0.2 }}
                  >
                    <TaskCard
                      task={task}
                      users={users}
                      readOnly={readOnly}
                      isActive={activeTaskId === task.task_id}
                      onOpen={onOpenTask}
                    />
                  </motion.div>
                ))
              ) : (
                <div
                  className={clsx(
                    'grid h-28 place-items-center rounded-xl border-2 border-dashed text-sm transition-colors',
                    isLight
                      ? 'border-slate-200 text-slate-400'
                      : 'border-slate-700 text-slate-500'
                  )}
                >
                  Drop tasks here
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="absolute inset-0 flex flex-col items-center justify-between py-4 gap-3 cursor-pointer group"
            >
              {/* Status Dot */}
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span className={clsx('absolute h-full w-full rounded-full animate-ping', color.dot, isLight ? 'opacity-40' : 'opacity-60')} />
                <span className={clsx('relative h-2 w-2 rounded-full', color.dot)} />
              </span>

              {/* Vertical Status Label */}
              <div className="flex-1 flex items-center justify-center">
                <h3
                  className={clsx(
                    'text-xs font-bold uppercase tracking-wider -rotate-90 whitespace-nowrap transition-colors group-hover:text-indigo-400',
                    isLight ? 'text-slate-600' : 'text-slate-300'
                  )}
                >
                  {status}
                </h3>
              </div>

              {/* Task Count & Total Points Pills */}
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={clsx(
                    'flex items-center justify-center rounded-full text-[10px] font-bold h-6 min-w-6 px-1.5 border',
                    isLight
                      ? 'border-slate-200 bg-slate-100 text-slate-700'
                      : 'border-white/10 bg-white/10 text-slate-200'
                  )}
                  title={`${tasks.length} tasks`}
                >
                  {tasks.length}
                </span>
                <span
                  className={clsx(
                    'flex items-center justify-center rounded-md text-[9px] font-extrabold px-1.5 py-0.5 border',
                    isLight
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                  )}
                  title={`${totalPoints} story points`}
                >
                  {totalPoints}pt
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default KanbanColumn;

// import { useDroppable } from '@dnd-kit/core';
// import { motion } from 'framer-motion';
// import clsx from 'clsx';
// import TaskCard from './TaskCard';
// import { useTheme } from '../context/ThemeContext';

// const KanbanColumn = ({ status, tasks, readOnly = false, activeTaskId, onOpenTask }) => {
//   const { isLight } = useTheme();
//   const { setNodeRef, isOver } = useDroppable({ id: status, data: { status }, disabled: readOnly });

//   // Status-based colors for column headers
//   const statusColors = {
//     'Backlog': { dark: 'from-blue-500/20 to-blue-600/10', light: 'from-blue-100 to-blue-50', text: 'text-blue-400', dot: 'bg-blue-400' },
//     'To Do': { dark: 'from-cyan-500/20 to-cyan-600/10', light: 'from-cyan-100 to-cyan-50', text: 'text-cyan-400', dot: 'bg-cyan-400' },
//     'In Progress': { dark: 'from-indigo-500/20 to-indigo-600/10', light: 'from-indigo-100 to-indigo-50', text: 'text-indigo-400', dot: 'bg-indigo-400' },
//     'In Review': { dark: 'from-violet-500/20 to-violet-600/10', light: 'from-violet-100 to-violet-50', text: 'text-violet-400', dot: 'bg-violet-400' },
//     'Testing': { dark: 'from-amber-500/20 to-amber-600/10', light: 'from-amber-100 to-amber-50', text: 'text-amber-400', dot: 'bg-amber-400' },
//     'Blocked': { dark: 'from-red-500/20 to-red-600/10', light: 'from-red-100 to-red-50', text: 'text-red-400', dot: 'bg-red-400' },
//     'Done': { dark: 'from-emerald-500/20 to-emerald-600/10', light: 'from-emerald-100 to-emerald-50', text: 'text-emerald-400', dot: 'bg-emerald-400' }
//   };

//   const color = statusColors[status] || statusColors['To Do'];

//   return (
//     <section
//       ref={setNodeRef}
//       className={clsx(
//         'relative flex h-[calc(100vh-13rem)] min-h-[32rem] w-80 shrink-0 flex-col overflow-hidden rounded-2xl border transition-all duration-300',
//         isOver
//           ? 'z-20 border-cyan-400/60 shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-400/20'
//           : isLight
//           ? 'border-slate-200/60 bg-white/60 shadow-lg shadow-slate-200/15'
//           : 'border-white/10 bg-[#0a0f1a]/70 shadow-xl shadow-black/20'
//       )}
//     >
//       {/* Premium Column Header with Gradient */}
//       <div className={clsx(
//         'flex items-center justify-between border-b px-4 py-3.5',
//         isLight
//           ? 'border-slate-200/50 bg-gradient-to-r to-transparent'
//           : 'border-white/10 bg-gradient-to-r to-transparent',
//         isLight ? color.light : color.dark
//       )}>
//         <div className="flex items-center gap-2.5">
//           {/* Status Dot */}
//           <span className={clsx(
//             'relative flex h-2.5 w-2.5 items-center justify-center',
//             isLight ? color.text : color.text
//           )}>
//             <span className={clsx('absolute h-full w-full rounded-full animate-ping', color.dot, isLight ? 'opacity-40' : 'opacity-60')} />
//             <span className={clsx('relative h-2 w-2 rounded-full', color.dot)} />
//           </span>
//           <h2 className={clsx(
//             'text-sm font-bold',
//             isLight ? 'text-slate-700' : 'text-white'
//           )}>
//             {status}
//           </h2>
//         </div>
//         <span className={clsx(
//           'rounded-full border px-2.5 py-1 text-xs font-semibold transition-all duration-300',
//           isLight
//             ? 'border-slate-200 bg-slate-100 text-slate-600'
//             : 'border-white/10 bg-white/10 text-slate-300'
//         )}>
//           {tasks.length}
//         </span>
//       </div>

//       {/* Task List */}
//       <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
//         {tasks.length ? (
//           tasks.map((task, index) => (
//             <motion.div
//               key={task.task_id}
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.03 }}
//             >
//               <TaskCard
//                 task={task}
//                 readOnly={readOnly}
//                 isActive={activeTaskId === task.task_id}
//                 onOpen={onOpenTask}
//               />
//             </motion.div>
//           ))
//         ) : (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className={clsx(
//               'grid h-28 place-items-center rounded-xl border-2 border-dashed text-sm transition-colors',
//               isLight
//                 ? 'border-slate-200 text-slate-400'
//                 : 'border-slate-700 text-slate-500'
//             )}
//           >
//             Drop tasks here
//           </motion.div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default KanbanColumn;