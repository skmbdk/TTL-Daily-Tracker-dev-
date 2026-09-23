import { useEffect, useState, useMemo } from 'react';
import {
  MessageSquareText,
  Send,
  Reply,
  X,
  ShieldCheck,
  User,
  Loader2,
  CornerDownRight,
  HelpCircle,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { taskService } from '../services/taskService';
import { useTheme } from '../context/ThemeContext';
import { getErrorMessage } from '../services/api';
import clsx from 'clsx';

const THREADS_PER_PAGE = 4;

const getUserInitials = (name = '') => {
  if (!name.trim()) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0][0].toUpperCase();
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const TaskCommentsThread = ({ taskId, readOnly = false, onCommentAdded }) => {
  const { isLight } = useTheme();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null); // { comment_id, full_name }
  const [page, setPage] = useState(1);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Inline Editing State
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Current session user
  const currentUser = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('zira_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const loadComments = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const data = await taskService.comments(taskId);
      setComments(data || []);
      setPage(1);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load comments'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [taskId]);

  // Group comments into root comments and their child replies
  const groupedComments = useMemo(() => {
    const rootComments = [];
    const repliesMap = new Map();

    comments.forEach((c) => {
      if (c.parent_comment_id) {
        const existing = repliesMap.get(c.parent_comment_id) || [];
        repliesMap.set(c.parent_comment_id, [...existing, c]);
      } else {
        rootComments.push(c);
      }
    });

    return rootComments.map((root) => ({
      ...root,
      replies: repliesMap.get(root.comment_id) || []
    }));
  }, [comments]);

  // Pagination calculation
  const totalPages = Math.ceil(groupedComments.length / THREADS_PER_PAGE) || 1;
  const paginatedThreads = useMemo(() => {
    const start = (page - 1) * THREADS_PER_PAGE;
    return groupedComments.slice(start, start + THREADS_PER_PAGE);
  }, [groupedComments, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !taskId || readOnly) return;

    setSubmitting(true);
    try {
      const newComment = await taskService.addComment(
        taskId,
        commentText.trim(),
        replyTo?.comment_id || null
      );

      setComments((prev) => [...prev, newComment]);
      setCommentText('');
      setReplyTo(null);
      toast.success(replyTo ? 'Reply posted' : 'Comment posted');
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to post comment'));
    } finally {
      setSubmitting(false);
    }
  };

  const startReply = (comment) => {
    if (readOnly) return;
    setReplyTo({ comment_id: comment.comment_id, full_name: comment.full_name });
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const startEdit = (comment) => {
    setEditingId(comment.comment_id);
    setEditText(comment.comment_text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async (commentId) => {
    if (!editText.trim() || readOnly) return;
    setSavingEdit(true);
    try {
      const updated = await taskService.updateComment(taskId, commentId, editText.trim());
      setComments((prev) =>
        prev.map((c) => (c.comment_id === commentId ? { ...c, comment_text: updated.comment_text } : c))
      );
      setEditingId(null);
      setEditText('');
      toast.success('Comment updated');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update comment'));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (readOnly) return;
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await taskService.deleteComment(taskId, commentId);
      setComments((prev) => prev.filter((c) => c.comment_id !== commentId && c.parent_comment_id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete comment'));
    }
  };

  const canManageComment = (comment) => {
    if (readOnly) return false;
    if (!currentUser) return true;
    return currentUser.role_name === 'admin' || Number(currentUser.user_id) === Number(comment.user_id);
  };

  return (
    <div className="space-y-3">
      {/* Header Label */}
      <div
        className={clsx(
          'flex items-center justify-between border-b pb-2.5 cursor-pointer select-none',
          isLight ? 'border-slate-200' : 'border-white/10'
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <MessageSquareText size={16} className={isLight ? 'text-cyan-600' : 'text-cyan-400'} />
          <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-white'}`}>
            Admin & Team Discussion ({comments.length})
          </h4>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <span className={`flex items-center gap-1 text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            <HelpCircle size={12} />
            Direct Q&A
          </span>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1 rounded-md transition ${
              isLight ? 'hover:bg-slate-200/80 text-slate-600' : 'hover:bg-white/10 text-slate-300'
            }`}
            title={isCollapsed ? 'Expand Discussion' : 'Collapse Discussion'}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>

      {/* Discussion List */}
      {loading ? (
        <div className="flex items-center justify-center py-6 text-slate-400">
          <Loader2 className="animate-spin" size={18} />
        </div>
      ) : paginatedThreads.length ? (
        <div className="space-y-3">
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {paginatedThreads.map((comment) => {
              const isAdmin = comment.user_role === 'admin';
              const isEditingThis = editingId === comment.comment_id;

              return (
                <div
                  key={comment.comment_id}
                  className={clsx(
                    'rounded-xl border p-3 transition-all duration-200 space-y-2.5',
                    isLight
                      ? 'border-slate-200/90 bg-white text-slate-800 shadow-sm hover:border-slate-300'
                      : 'border-white/[0.08] bg-[#18181b] text-zinc-100 hover:border-white/20'
                  )}
                >
                  {/* Main Root Comment */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={clsx(
                        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5',
                        isAdmin
                          ? isLight
                            ? 'bg-cyan-100 text-cyan-800 border border-cyan-300 shadow-sm'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                          : isLight
                            ? 'bg-slate-100 text-slate-700 border border-slate-300 shadow-sm'
                            : 'bg-slate-800/80 text-slate-200 border border-slate-700'
                      )}
                    >
                      {getUserInitials(comment.full_name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                            {comment.full_name}
                          </span>

                          {isAdmin ? (
                            <span
                              className={clsx(
                                'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                                isLight
                                  ? 'border border-cyan-300 bg-cyan-50 text-cyan-800 shadow-2xs'
                                  : 'border border-cyan-400/40 bg-cyan-400/15 text-cyan-300'
                              )}
                            >
                              <ShieldCheck size={10} />
                              Admin
                            </span>
                          ) : (
                            <span
                              className={clsx(
                                'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                                isLight
                                  ? 'border border-slate-200 bg-slate-100 text-slate-600'
                                  : 'border border-slate-700 bg-slate-800/60 text-slate-400'
                              )}
                            >
                              <User size={10} />
                              User
                            </span>
                          )}
                        </div>

                        <span className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>

                      {/* Comment Body / Inline Edit */}
                      {isEditingThis ? (
                        <div className="mt-2 space-y-2">
                          <input
                            type="text"
                            className="input-field w-full text-xs py-1.5"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              className="btn-secondary px-2 py-0.5 text-[11px]"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={savingEdit || !editText.trim()}
                              className="btn-primary px-2.5 py-0.5 text-[11px] flex items-center gap-1"
                              onClick={() => handleSaveEdit(comment.comment_id)}
                            >
                              {savingEdit ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className={`mt-1 text-xs leading-relaxed whitespace-pre-wrap ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                          {comment.comment_text}
                        </p>
                      )}

                      {/* Comment Actions: Reply, Edit, Delete */}
                      {!readOnly && !isEditingThis && (
                        <div className="mt-2 flex items-center justify-end gap-3">
                          {canManageComment(comment) && (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(comment)}
                                className={clsx(
                                  'flex items-center gap-1 text-[11px] font-semibold transition-colors',
                                  isLight ? 'text-slate-500 hover:text-cyan-700' : 'text-slate-400 hover:text-cyan-300'
                                )}
                                title="Edit comment"
                              >
                                <Edit2 size={12} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment.comment_id)}
                                className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-400 transition-colors"
                                title="Delete comment"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => startReply(comment)}
                            className={clsx(
                              'flex items-center gap-1 text-[11px] font-semibold transition-colors',
                              isLight ? 'text-slate-500 hover:text-cyan-700' : 'text-slate-400 hover:text-cyan-300'
                            )}
                          >
                            <Reply size={12} />
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nested Child Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className={clsx('ml-5 border-l-2 pl-3 space-y-2.5 pt-1', isLight ? 'border-cyan-600' : 'border-cyan-400/80')}>
                      {comment.replies.map((reply) => {
                        const isReplyAdmin = reply.user_role === 'admin';
                        const isEditingReply = editingId === reply.comment_id;

                        return (
                          <div
                            key={reply.comment_id}
                            className={clsx(
                              'rounded-lg border p-2.5 transition-all',
                              isLight
                                ? 'border-slate-200/90 bg-slate-50/90 text-slate-800'
                                : 'border-white/[0.08] bg-[#141417] text-zinc-200'
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <CornerDownRight size={13} className={clsx('shrink-0 mt-0.5', isLight ? 'text-cyan-600' : 'text-cyan-400 opacity-70')} />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                                      {reply.full_name}
                                    </span>

                                    {isReplyAdmin ? (
                                      <span
                                        className={clsx(
                                          'inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider',
                                          isLight
                                            ? 'border border-cyan-300 bg-cyan-50 text-cyan-800 shadow-2xs'
                                            : 'border border-cyan-400/40 bg-cyan-400/15 text-cyan-300'
                                        )}
                                      >
                                        Admin
                                      </span>
                                    ) : (
                                      <span
                                        className={clsx(
                                          'inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider',
                                          isLight
                                            ? 'border border-slate-200 bg-slate-100 text-slate-600'
                                            : 'border border-slate-700 bg-slate-800/60 text-slate-400'
                                        )}
                                      >
                                        User
                                      </span>
                                    )}
                                  </div>

                                  <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {formatTimeAgo(reply.created_at)}
                                  </span>
                                </div>

                                {isEditingReply ? (
                                  <div className="mt-2 space-y-2">
                                    <input
                                      type="text"
                                      className="input-field w-full text-xs py-1"
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        type="button"
                                        className="btn-secondary px-2 py-0.5 text-[10px]"
                                        onClick={cancelEdit}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        disabled={savingEdit || !editText.trim()}
                                        className="btn-primary px-2 py-0.5 text-[10px] flex items-center gap-1"
                                        onClick={() => handleSaveEdit(reply.comment_id)}
                                      >
                                        {savingEdit ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className={`mt-1 text-xs leading-relaxed whitespace-pre-wrap ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                                    {reply.comment_text}
                                  </p>
                                )}

                                {!readOnly && !isEditingReply && (
                                  <div className="mt-1.5 flex items-center justify-end gap-2.5">
                                    {canManageComment(reply) && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => startEdit(reply)}
                                          className={clsx(
                                            'flex items-center gap-1 text-[10px] font-medium transition-colors',
                                            isLight ? 'text-slate-500 hover:text-cyan-700' : 'text-slate-400 hover:text-cyan-300'
                                          )}
                                          title="Edit reply"
                                        >
                                          <Edit2 size={11} />
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteComment(reply.comment_id)}
                                          className="flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-rose-400 transition-colors"
                                          title="Delete reply"
                                        >
                                          <Trash2 size={11} />
                                          Delete
                                        </button>
                                      </>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => startReply(comment)}
                                      className={clsx(
                                        'flex items-center gap-1 text-[10px] font-semibold transition-colors',
                                        isLight
                                          ? 'text-slate-500 hover:text-cyan-700'
                                          : 'text-slate-400 hover:text-cyan-300'
                                      )}
                                    >
                                      <Reply size={11} />
                                      Reply
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className={clsx('flex items-center justify-between border-t pt-2 text-xs', isLight ? 'border-slate-200' : 'border-white/10')}>
              <button
                type="button"
                className="btn-secondary px-2 py-1 text-[11px] flex items-center gap-1"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={13} /> Prev
              </button>
              <span className={`text-[10px] uppercase tracking-wider font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn-secondary px-2 py-1 text-[11px] flex items-center gap-1"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={`rounded-xl border p-4 text-center text-xs ${isLight ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-white/5 bg-white/[0.02] text-slate-400'}`}>
          No comments yet. Start a discussion or ask Admin a question.
        </div>
      )}

      {/* Input Form & Active Reply Banner */}
      {!readOnly && (
        <form onSubmit={handleSubmit} className="space-y-2 pt-1">
          {replyTo && (
            <div
              className={clsx(
                'flex items-center justify-between rounded-lg border px-2.5 py-1 text-xs transition-all',
                isLight
                  ? 'border-cyan-300 bg-cyan-50/90 text-cyan-800 shadow-xs'
                  : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
              )}
            >
              <span className="flex items-center gap-1 font-semibold">
                <CornerDownRight size={12} />
                Replying to <strong className="font-bold">{replyTo.full_name}</strong>
              </span>
              <button
                type="button"
                onClick={cancelReply}
                className={clsx(
                  'rounded p-0.5 transition-colors',
                  isLight ? 'hover:bg-cyan-200/60 text-cyan-800' : 'hover:bg-cyan-500/20 text-cyan-300'
                )}
                title="Cancel reply"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              required
              className="input-field flex-1 text-xs py-2"
              placeholder={
                replyTo
                  ? `Write a reply to ${replyTo.full_name}...`
                  : 'Ask Admin a question or add a comment...'
              }
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="btn-primary py-2 px-3 text-xs flex items-center justify-center gap-1 shrink-0"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Send size={14} />
              )}
              {replyTo ? 'Reply' : 'Post'}
            </button>
          </div>
        </form>
      )}
        </>
      )}
    </div>
  );
};

export default TaskCommentsThread;
