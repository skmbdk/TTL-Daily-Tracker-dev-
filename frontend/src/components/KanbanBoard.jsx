import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { closestCorners, DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import KanbanColumn from './KanbanColumn';
import { TaskCardPreview } from './TaskCard';

// export const KANBAN_STATUSES = ['Backlog', 'To Do', 'In Progress', 'In Review', 'Testing', 'Done', 'Blocked'];
export const KANBAN_STATUSES = ['To Do','In Progress','Completed','Testing','Blocked','In Review'];

const KanbanBoard = ({ tasks, users, readOnly = false, onTaskOpen, onStatusChange, swimlaneBy = 'None' }) => {
  const [activeTask, setActiveTask] = useState(null);
  const [activeCardWidth, setActiveCardWidth] = useState(null);
  const [collapsedColumns, setCollapsedColumns] = useState([]);
  const suppressOpenRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 160, tolerance: 8 } })
  );

  const { swimlanes, swimlaneOrder } = useMemo(() => {
    if (swimlaneBy === 'None') {
      return { swimlanes: { 'All Tasks': tasks }, swimlaneOrder: ['All Tasks'] };
    }
  
    const grouped = tasks.reduce((acc, task) => {
      let key;
      if (swimlaneBy === 'Project') {
        key = task.project_name || 'Unassigned Project';
      } else if (swimlaneBy === 'Parent Project') {
        key = task.parent_project_name || (task.project_name ? 'Standalone Project' : 'Unassigned Project');
      } else if (swimlaneBy === 'Assignee') {
        key = task.assigned_user_name || task.employee_name || 'Unassigned';
      } else if (swimlaneBy === 'Stream') {
        key = task.module_name || 'Unassigned Stream';
      } else if (swimlaneBy === 'Priority') {
        key = task.priority || 'Unassigned Priority';
      }
      
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(task);
      return acc;
    }, {});

    const sortedOrder = Object.keys(grouped).sort((a, b) => {
      if (a.startsWith('Unassigned')) return 1;
      if (b.startsWith('Unassigned')) return -1;
      return a.localeCompare(b);
    });

    return { swimlanes: grouped, swimlaneOrder: sortedOrder };
  }, [tasks, swimlaneBy]);

  const toggleColumnCollapse = (status) => {
    setCollapsedColumns(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleDragStart = ({ active }) => {
    if (readOnly) return;
    setActiveTask(active.data.current?.task || null);
    setActiveCardWidth(active.rect.current.initial?.width || null);
  };

  const handleDragEnd = ({ active, over }) => {
    if (readOnly) return;
    const task = active.data.current?.task;
    const nextStatus = getDropStatus(over);
    suppressCardOpen();
    setActiveTask(null);
    setActiveCardWidth(null);

    if (!task || !nextStatus) return;

    if (task && task.status !== nextStatus) {
      onStatusChange(task, nextStatus);
    }
  };

  const handleDragCancel = () => {
    if (readOnly) return;
    suppressCardOpen();
    setActiveTask(null);
    setActiveCardWidth(null);
  };

  const openTask = (task) => {
    if (!suppressOpenRef.current) {
      onTaskOpen(task);
    }
  };

  const suppressCardOpen = () => {
    suppressOpenRef.current = true;
    window.setTimeout(() => {
      suppressOpenRef.current = false;
    }, 180);
  };

  const dragOverlay = (
    <DragOverlay
      adjustScale={false}
      dropAnimation={{ duration: 140, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}
      zIndex={9999}
    >
      {activeTask ? <TaskCardPreview task={activeTask} users={users} width={activeCardWidth} /> : null}
    </DragOverlay>
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {swimlaneBy === 'None' ? (
        <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-4 pr-2">
          {KANBAN_STATUSES.map((status, index) => {
            const tasksForStatus = swimlanes['All Tasks'].filter(t => t.status === status);
            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.4,
                  type: 'spring',
                  stiffness: 100,
                  damping: 15
                }}
                className="shrink-0"
              >
                <KanbanColumn
                  status={status}
                  tasks={tasksForStatus}
                  users={users}
                  readOnly={readOnly}
                  activeTaskId={activeTask?.task_id}
                  collapsedColumns={collapsedColumns}
                  onToggleCollapse={toggleColumnCollapse}
                  onOpenTask={openTask}
                />
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-8">
          {swimlaneOrder.map(groupName => {
            const groupTasks = swimlanes[groupName];
            return (
              <div key={groupName} className="swimlane">
                <h2 className="swimlane-title">{groupName} ({groupTasks.length})</h2>
                <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-4 pr-2">
                  {KANBAN_STATUSES.map((status, index) => {
                    const tasksForStatus = groupTasks.filter(t => t.status === status);
                    return (
                      <motion.div
                        key={status}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          delay: index * 0.08,
                          duration: 0.4,
                          type: 'spring',
                          stiffness: 100,
                          damping: 15
                        }}
                        className="shrink-0"
                      >
                        <KanbanColumn
                          status={status}
                          tasks={tasksForStatus}
                          users={users}
                          readOnly={readOnly}
                          activeTaskId={activeTask?.task_id}
                          collapsedColumns={collapsedColumns}
                          onToggleCollapse={toggleColumnCollapse}
                          onOpenTask={openTask}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {typeof document === 'undefined' ? dragOverlay : createPortal(dragOverlay, document.body)}
    </DndContext>
  );
};

const getDropStatus = (over) => {
  if (!over) return null;
  if (KANBAN_STATUSES.includes(over.id)) return over.id;
  return over.data.current?.status || null;
};

export default KanbanBoard;


// import { useRef, useState } from 'react';
// import { createPortal } from 'react-dom';
// import { closestCorners, DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
// import { motion } from 'framer-motion';
// import KanbanColumn from './KanbanColumn';
// import { TaskCardPreview } from './TaskCard';

// export const KANBAN_STATUSES = ['Backlog', 'To Do', 'In Progress', 'In Review', 'Testing', 'Done', 'Blocked'];

// const KanbanBoard = ({ tasks, readOnly = false, onTaskOpen, onStatusChange }) => {
//   const [activeTask, setActiveTask] = useState(null);
//   const [activeCardWidth, setActiveCardWidth] = useState(null);
//   const suppressOpenRef = useRef(false);
//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
//     useSensor(TouchSensor, { activationConstraint: { delay: 160, tolerance: 8 } })
//   );

//   const byStatus = KANBAN_STATUSES.reduce((acc, status) => {
//     acc[status] = tasks.filter((task) => task.status === status);
//     return acc;
//   }, {});

//   const handleDragStart = ({ active }) => {
//     if (readOnly) return;
//     setActiveTask(active.data.current?.task || null);
//     setActiveCardWidth(active.rect.current.initial?.width || null);
//   };

//   const handleDragEnd = ({ active, over }) => {
//     if (readOnly) return;
//     const task = active.data.current?.task;
//     const nextStatus = getDropStatus(over);
//     suppressCardOpen();
//     setActiveTask(null);
//     setActiveCardWidth(null);

//     if (!task || !nextStatus) return;

//     if (task && task.status !== nextStatus) {
//       onStatusChange(task, nextStatus);
//     }
//   };

//   const handleDragCancel = () => {
//     if (readOnly) return;
//     suppressCardOpen();
//     setActiveTask(null);
//     setActiveCardWidth(null);
//   };

//   const openTask = (task) => {
//     if (!suppressOpenRef.current) {
//       onTaskOpen(task);
//     }
//   };

//   const suppressCardOpen = () => {
//     suppressOpenRef.current = true;
//     window.setTimeout(() => {
//       suppressOpenRef.current = false;
//     }, 180);
//   };

//   const dragOverlay = (
//     <DragOverlay
//       adjustScale={false}
//       dropAnimation={{ duration: 140, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}
//       zIndex={9999}
//     >
//       {activeTask ? <TaskCardPreview task={activeTask} width={activeCardWidth} /> : null}
//     </DragOverlay>
//   );

//   return (
//     <DndContext
//       sensors={sensors}
//       collisionDetection={closestCorners}
//       onDragStart={handleDragStart}
//       onDragEnd={handleDragEnd}
//       onDragCancel={handleDragCancel}
//     >
//       <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-4 pr-2">
//         {KANBAN_STATUSES.map((status, index) => (
//           <motion.div
//             key={status}
//             initial={{ opacity: 0, y: 20, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             transition={{
//               delay: index * 0.08,
//               duration: 0.4,
//               type: 'spring',
//               stiffness: 100,
//               damping: 15
//             }}
//             className="shrink-0"
//           >
//             <KanbanColumn
//               status={status}
//               tasks={byStatus[status] || []}
//               readOnly={readOnly}
//               activeTaskId={activeTask?.task_id}
//               onOpenTask={openTask}
//             />
//           </motion.div>
//         ))}
//       </div>
//       {typeof document === 'undefined' ? dragOverlay : createPortal(dragOverlay, document.body)}
//     </DndContext>
//   );
// };

// const getDropStatus = (over) => {
//   if (!over) return null;
//   if (KANBAN_STATUSES.includes(over.id)) return over.id;
//   return over.data.current?.status || null;
// };

// export default KanbanBoard;