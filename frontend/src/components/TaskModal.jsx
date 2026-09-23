import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, MessageSquareText, X, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import TaskForm from './TaskForm';
import TaskAttachments from './TaskAttachments';
import TaskCommentsThread from './TaskCommentsThread';
import RemarksFilter from './RemarksFilter';
import { getErrorMessage } from '../services/api';
import { taskService } from '../services/taskService';

const TaskModal = ({ open, task, users, projects, isAdmin, readOnly = false, onClose, onSaved }) => {
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState('');
  const [remarksOpen, setRemarksOpen] = useState(false);
  const [remarkDate, setRemarkDate] = useState(todayInputDate());
  const [remarkText, setRemarkText] = useState('');
  const [editingRemarkId, setEditingRemarkId] = useState(null);
  const [remarksPage, setRemarksPage] = useState(1);
  const [remarksFilter, setRemarksFilter] = useState({
    type: 'all',
    date: '',
    dateFrom: '',
    dateTo: '',
    month: ''
  });
  const [activityPage, setActivityPage] = useState(1);
  const REMARKS_PER_PAGE = 5;
  const ACTIVITY_PER_PAGE = 5;

  useEffect(() => {
    const load = async () => {
      if (!open || !task?.task_id) {
        setDetail(null);
        setRemarksOpen(false);
        return;
      }

      try {
        setDetail(await taskService.get(task.task_id));
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    };

    load();
  }, [open, task]);

  useEffect(() => {
    if (!open) {
      setRemarksOpen(false);
      setRemarkText('');
      setRemarkDate(todayInputDate());
      setEditingRemarkId(null);
      setRemarksPage(1);
      setRemarksFilter({ type: 'all', date: '', dateFrom: '', dateTo: '', month: '' });
      setActivityPage(1);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const activeTask = detail?.task || task;
  const dailyRemarks = detail?.daily_remarks || [];
  const activityHistory = detail?.history || [];
  
  const filteredRemarks = dailyRemarks.filter(r => {
    if (remarksFilter.type === 'all') return true;
    const rDate = formatDateOnlyForInput(r.remark_date);
    if (remarksFilter.type === 'date') {
      return !remarksFilter.date || rDate === remarksFilter.date;
    }
    if (remarksFilter.type === 'range') {
      if (remarksFilter.dateFrom && rDate < remarksFilter.dateFrom) return false;
      if (remarksFilter.dateTo && rDate > remarksFilter.dateTo) return false;
      return true;
    }
    if (remarksFilter.type === 'month') {
      return !remarksFilter.month || rDate.startsWith(remarksFilter.month);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRemarks.length / REMARKS_PER_PAGE) || 1;
  const paginatedRemarks = filteredRemarks.slice((remarksPage - 1) * REMARKS_PER_PAGE, remarksPage * REMARKS_PER_PAGE);

  const totalActivityPages = Math.ceil(activityHistory.length / ACTIVITY_PER_PAGE) || 1;
  const paginatedHistory = activityHistory.slice((activityPage - 1) * ACTIVITY_PER_PAGE, activityPage * ACTIVITY_PER_PAGE);

  const handleSubmit = async (payload) => {
    if (readOnly) return;
    setSaving(true);
    try {
      const saved = activeTask?.task_id
        ? await taskService.update(activeTask.task_id, payload)
        : await taskService.create(payload);
      toast.success('Task saved');
      onSaved(saved);
      if (!activeTask?.task_id) onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const addComment = async () => {
    if (readOnly) return;
    if (!comment.trim() || !activeTask?.task_id) return;
    try {
      await taskService.addComment(activeTask.task_id, comment.trim());
      setComment('');
      setDetail(await taskService.get(activeTask.task_id));
      toast.success('Comment added');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const submitRemark = async () => {
    if (readOnly) return;
    if (!remarkText.trim() || !activeTask?.task_id) return;
    try {
      if (editingRemarkId) {
        await taskService.updateRemark(activeTask.task_id, editingRemarkId, {
          remark_date: remarkDate,
          remark_text: remarkText.trim()
        });
        toast.success('Remark updated');
      } else {
        await taskService.addRemark(activeTask.task_id, {
          remark_date: remarkDate,
          remark_text: remarkText.trim()
        });
        toast.success('Remark added');
      }
      setRemarkText('');
      setRemarkDate(todayInputDate());
      setEditingRemarkId(null);
      setDetail(await taskService.get(activeTask.task_id));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEditRemark = (item) => {
    setEditingRemarkId(item.remark_id);
    setRemarkDate(formatDateOnlyForInput(item.remark_date));
    setRemarkText(item.remark_text);
  };

  const cancelEditRemark = () => {
    setEditingRemarkId(null);
    setRemarkDate(todayInputDate());
    setRemarkText('');
  };

  const handleDeleteRemark = async (remarkId) => {
    if (readOnly) return;
    if (!confirm('Are you sure you want to delete this update?')) return;
    try {
      await taskService.deleteRemark(activeTask.task_id, remarkId);
      toast.success('Remark deleted');
      setDetail(await taskService.get(activeTask.task_id));
      
      const newTotalRemarks = dailyRemarks.length - 1;
      const newTotalPages = Math.ceil(newTotalRemarks / REMARKS_PER_PAGE) || 1;
      if (remarksPage > newTotalPages) {
         setRemarksPage(newTotalPages);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-black/75 backdrop-blur-md">
      <div className="flex min-h-full items-start justify-center py-4 sm:py-8 lg:items-center pb-24">
        <div className="modal-glass w-full max-w-5xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">{activeTask?.task_id ? `Task #${activeTask.task_id}` : 'New task'}</p>
              <h2 className="text-lg font-bold text-white">{activeTask?.task_title || 'Create task'}</h2>
            </div>
            <button className="btn-secondary px-3" onClick={onClose} title="Close">
              <X size={17} />
            </button>
          </div>

          <div className="grid max-h-[calc(100vh-7rem)] gap-5 overflow-y-auto p-5 lg:grid-cols-[1.5fr_0.85fr]">
            {readOnly ? (
              <div className="lg:col-span-2 rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200">
                Presenter mode is view-only. You can review tasks, comments, and activity without changing data.
              </div>
            ) : null}
            <TaskForm
              initialTask={activeTask}
              users={users}
              projects={projects}
              isAdmin={isAdmin}
              readOnly={readOnly}
              loading={saving}
              remarksCount={dailyRemarks.length}
              canOpenRemarks={Boolean(activeTask?.task_id)}
              onOpenRemarks={() => setRemarksOpen(true)}
              onSubmit={handleSubmit}
              onCancel={onClose}
            />

            <aside className="space-y-4">
              {activeTask?.task_id ? (
                <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <TaskAttachments taskId={activeTask.task_id} readOnly={readOnly} />
                </section>
              ) : null}
              {activeTask?.task_id ? (
                <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <TaskCommentsThread taskId={activeTask.task_id} readOnly={readOnly} />
                </section>
              ) : null}

              <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <h3 className="font-semibold text-white">Activity</h3>
                <div className="mt-3 space-y-3">
                  {paginatedHistory.length ? (
                    paginatedHistory.map((item) => (
                      <div key={item.history_id} className="border-l border-cyan-400/40 pl-3">
                        <p className="text-sm text-slate-200">{item.change_description}</p>
                        <p className="text-xs text-slate-500">
                          {item.changed_by_name || 'System'} · {formatDateTime(item.changed_at)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No activity yet.</p>
                  )}
                </div>
                {totalActivityPages > 1 && (
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                    <button
                      className="btn-secondary px-2 py-1 text-xs"
                      disabled={activityPage === 1}
                      onClick={() => setActivityPage(p => p - 1)}
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Page {activityPage} of {totalActivityPages}</span>
                    <button
                      className="btn-secondary px-2 py-1 text-xs"
                      disabled={activityPage === totalActivityPages}
                      onClick={() => setActivityPage(p => p + 1)}
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </section>
            </aside>
          </div>
        </div>
      </div>

      {remarksOpen ? (
        <div className="fixed inset-0 z-[60] overflow-y-auto p-4 sm:p-6" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.5) 70%, transparent 100%)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
          <div className="flex min-h-full items-center justify-center pb-24">
            <section className="modal-glass w-full max-w-3xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 p-2 text-cyan-200">
                    <MessageSquareText size={18} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Daily remarks</p>
                    <h3 className="text-lg font-bold text-white">{activeTask?.task_title || 'Task remarks'}</h3>
                  </div>
                </div>
                <button className="btn-secondary px-3" type="button" onClick={() => setRemarksOpen(false)} title="Close remarks">
                  <X size={17} />
                </button>
              </div>

              <div className="grid max-h-[calc(100vh-8rem)] gap-5 overflow-y-auto p-5 lg:grid-cols-[0.9fr_1.1fr]">
                {!readOnly ? (
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <h4 className="font-semibold text-white">{editingRemarkId ? 'Edit update' : 'Add update'}</h4>
                    <label className="mt-4 block">
                      <span className="label">Date</span>
                      <input
                        className="input-field mt-1"
                        type="date"
                        value={remarkDate}
                        onChange={(event) => setRemarkDate(event.target.value)}
                      />
                    </label>
                    <label className="mt-4 block">
                      <span className="label">Remark</span>
                      <textarea
                        className="input-field mt-1 min-h-36 resize-y"
                        value={remarkText}
                        onChange={(event) => setRemarkText(event.target.value)}
                      />
                    </label>
                    <div className="mt-4 flex gap-2">
                      {editingRemarkId && (
                        <button className="btn-secondary w-full" type="button" onClick={cancelEditRemark}>
                          Cancel
                        </button>
                      )}
                      <button className="btn-primary w-full" type="button" onClick={submitRemark} disabled={!remarkText.trim()}>
                        {editingRemarkId ? 'Update' : 'Add'}
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className={readOnly ? 'lg:col-span-2' : ''}>
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-400 shrink-0">
                      <CalendarDays size={16} className="text-cyan-300" />
                      <span>{filteredRemarks.length} date-wise updates</span>
                    </div>
                    <div className="flex justify-end">
                      <RemarksFilter 
                        filter={remarksFilter} 
                        onChange={(newFilter) => {
                          setRemarksFilter(newFilter);
                          setRemarksPage(1);
                        }} 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {paginatedRemarks.length ? (
                      paginatedRemarks.map((item) => (
                        <article key={item.remark_id} className="group relative rounded-lg border border-white/[0.08] bg-[#141417] p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold text-cyan-200">{formatDateOnly(item.remark_date)}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-slate-500">
                                {item.full_name} · {formatDateTime(item.created_at)}
                              </p>
                              {!readOnly && (
                                <div className="ml-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                  <button type="button" className="text-slate-400 hover:text-cyan-300" onClick={() => handleEditRemark(item)} title="Edit">
                                    <Edit2 size={14} />
                                  </button>
                                  <button type="button" className="text-slate-400 hover:text-rose-400" onClick={() => handleDeleteRemark(item.remark_id)} title="Delete">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-200">{item.remark_text}</p>
                        </article>
                      ))
                    ) : (
                      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 text-center text-sm text-slate-500">
                        No remarks yet.
                      </div>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                      <button
                        className="btn-secondary px-2 py-1 text-sm"
                        disabled={remarksPage === 1}
                        onClick={() => setRemarksPage(p => p - 1)}
                      >
                        <ChevronLeft size={16} /> Prev
                      </button>
                      <span className="text-xs text-slate-500">Page {remarksPage} of {totalPages}</span>
                      <button
                        className="btn-secondary px-2 py-1 text-sm"
                        disabled={remarksPage === totalPages}
                        onClick={() => setRemarksPage(p => p + 1)}
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>,
    document.body
  );
};

const todayInputDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const formatDateOnly = (value) => {
  if (!value) return '';
  const datePart = typeof value === 'string' ? value.slice(0, 10) : new Date(value).toISOString().slice(0, 10);
  return new Date(`${datePart}T00:00:00`).toLocaleDateString();
};

const formatDateOnlyForInput = (value) => {
  if (!value) return '';
  return typeof value === 'string' ? value.slice(0, 10) : new Date(value).toISOString().slice(0, 10);
};

const formatDateTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString();
};

export default TaskModal;
