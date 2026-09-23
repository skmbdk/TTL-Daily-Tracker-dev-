import { useEffect, useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon,
  File as FileIcon,
  Download,
  Trash2,
  Loader2,
  Paperclip,
  Globe,
  ExternalLink,
  Plus,
  Link2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Share2,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { taskService } from '../services/taskService';
import { useTheme } from '../context/ThemeContext';
import { getErrorMessage } from '../services/api';
import FolderInteraction from './ui/folder-interaction';

const ATTACHMENTS_PER_PAGE = 5;

const isUrlAttachment = (attachment) => {
  if (!attachment) return false;
  if (attachment.mime_type === 'url' || attachment.file_name === 'link') return true;
  const rawPath = (attachment.file_path || '').trim();
  if (!rawPath) return false;
  if (/^https?:\/\//i.test(rawPath) || /^www\./i.test(rawPath)) return true;
  const cleanPath = rawPath.replace(/\\/g, '/');
  if (!cleanPath.startsWith('uploads/')) return true;
  return false;
};

const getBackendOrigin = () => {
  const envApiUrl = import.meta.env.VITE_API_URL?.trim();
  if (envApiUrl && /^https?:\/\//i.test(envApiUrl)) {
    return envApiUrl.replace(/\/api\/?$/i, '');
  }

  const protocol = window.location.protocol || 'http:';
  const hostname = window.location.hostname || 'localhost';
  let port = window.location.port;

  if (port === '5173' || !port) {
    port = '5000';
  }

  return `${protocol}//${hostname}:${port}`;
};

const getShareableUrl = (attachment) => {
  if (!attachment) return '#';
  const rawPath = (attachment.file_path || '').trim();
  if (!rawPath) return '#';

  if (isUrlAttachment(attachment)) {
    if (/^https?:\/\//i.test(rawPath)) return rawPath;
    return `https://${rawPath}`;
  }

  const backendOrigin = getBackendOrigin();
  const normalizedPath = rawPath.replace(/\\/g, '/').replace(/^\//, '');

  return `${backendOrigin}/${normalizedPath}`;
};

const getFileIcon = (mimeType = '', fileName = '', filePath = '') => {
  const isUrl = mimeType === 'url' || fileName === 'link' || (filePath && (!filePath.replace(/\\/g, '/').startsWith('uploads/') || /^https?:\/\//i.test(filePath)));
  if (isUrl) {
    return <Globe className="text-cyan-400" size={20} />;
  }
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(ext)) {
    return <ImageIcon className="text-emerald-400" size={20} />;
  }
  if (mimeType.includes('pdf') || ext === 'pdf') {
    return <FileText className="text-rose-400" size={20} />;
  }
  if (mimeType.includes('sheet') || mimeType.includes('excel') || ['xlsx', 'xls', 'csv'].includes(ext)) {
    return <FileSpreadsheet className="text-emerald-400" size={20} />;
  }
  if (mimeType.includes('zip') || mimeType.includes('compressed') || ['zip', 'rar', 'tar', 'gz'].includes(ext)) {
    return <FileArchive className="text-amber-400" size={20} />;
  }
  return <FileIcon className="text-blue-400" size={20} />;
};

const formatBytes = (bytes) => {
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const TaskAttachments = ({ taskId, readOnly = false }) => {
  const { isLight } = useTheme();
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'link'
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [addingLink, setAddingLink] = useState(false);
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const fileInputRef = useRef(null);

  const loadAttachments = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const data = await taskService.getAttachments(taskId);
      setAttachments(data || []);
      setPage(1);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [taskId]);

  const totalPages = Math.ceil(attachments.length / ATTACHMENTS_PER_PAGE) || 1;
  const paginatedAttachments = attachments.slice((page - 1) * ATTACHMENTS_PER_PAGE, page * ATTACHMENTS_PER_PAGE);

  const handleFileUpload = async (file) => {
    if (!file || readOnly) return;
    setUploading(true);
    try {
      const newAtt = await taskService.uploadAttachment(taskId, file);
      setAttachments((prev) => [newAtt, ...prev]);
      setPage(1);
      toast.success(`Uploaded ${file.name}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Upload failed'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!linkUrl.trim() || readOnly) return;
    setAddingLink(true);
    try {
      const newAtt = await taskService.addLinkAttachment(taskId, linkUrl.trim(), linkTitle.trim() || linkUrl.trim());
      setAttachments((prev) => [newAtt, ...prev]);
      setLinkUrl('');
      setLinkTitle('');
      setPage(1);
      toast.success('Link attached successfully!');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add link'));
    } finally {
      setAddingLink(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!readOnly) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (readOnly) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleCopyLink = async (attachment) => {
    const shareUrl = getShareableUrl(attachment);
    if (!shareUrl || shareUrl === '#') {
      toast.error('Shareable link unavailable');
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(attachment.attachment_id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success('Shareable link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleDownload = async (attachment) => {
    if (isUrlAttachment(attachment)) {
      const shareUrl = getShareableUrl(attachment);
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      toast.loading(`Downloading ${attachment.original_name}...`, { id: `dl-${attachment.attachment_id}` });
      await taskService.downloadAttachment(attachment.attachment_id, attachment.original_name);
      toast.success('Downloaded!', { id: `dl-${attachment.attachment_id}` });
    } catch (error) {
      toast.error(getErrorMessage(error), { id: `dl-${attachment.attachment_id}` });
    }
  };

  const handleDelete = async (attachmentId, fileName) => {
    if (readOnly) return;
    try {
      await taskService.deleteAttachment(attachmentId);
      setAttachments((prev) => {
        const next = prev.filter((item) => item.attachment_id !== attachmentId);
        const newTotalPages = Math.ceil(next.length / ATTACHMENTS_PER_PAGE) || 1;
        if (page > newTotalPages) setPage(newTotalPages);
        return next;
      });
      toast.success(`Deleted ${fileName}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-3">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <Paperclip size={16} className={isLight ? 'text-slate-600' : 'text-slate-400'} />
          <h4 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
            Attachments ({attachments.length})
          </h4>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {!readOnly && !isCollapsed && (
            <div className={`flex items-center rounded-lg border p-0.5 text-xs ${isLight ? 'border-slate-200 bg-slate-100/80' : 'border-white/10 bg-white/5'}`}>
              <button
                type="button"
                onClick={() => setActiveTab('file')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition cursor-pointer ${
                  activeTab === 'file'
                    ? isLight ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'bg-white/15 text-white font-bold'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <UploadCloud size={13} />
                File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('link')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition cursor-pointer ${
                  activeTab === 'link'
                    ? isLight ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'bg-white/15 text-white font-bold'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Link2 size={13} />
                URL Link
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1 rounded-md transition ${
              isLight ? 'hover:bg-slate-200/80 text-slate-600' : 'hover:bg-white/10 text-slate-300'
            }`}
            title={isCollapsed ? 'Expand Attachments' : 'Collapse Attachments'}
          >
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* 3D Interactive Folder Animation */}
          <FolderInteraction
            attachments={attachments}
            onDownload={handleDownload}
            onCopyLink={handleCopyLink}
            copiedId={copiedId}
            readOnly={readOnly}
          />

          {!readOnly && activeTab === 'file' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : isLight
                  ? 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                  e.target.value = '';
                }}
              />
              {uploading ? (
                <div className="flex items-center gap-2 py-2 text-cyan-400">
                  <Loader2 className="animate-spin" size={20} />
                  <span className="text-xs font-semibold">Uploading file...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <UploadCloud size={24} className={isLight ? 'text-slate-400 group-hover:text-cyan-600' : 'text-slate-500 group-hover:text-cyan-400'} />
                  <p className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Drop file here or <span className="text-cyan-400 underline">click to upload</span>
                  </p>
                  <p className="text-[11px] text-slate-500">PDF, Images, Office Docs, Zips (Max 25MB)</p>
                </div>
              )}
            </div>
          )}

      {!readOnly && activeTab === 'link' && (
        <form onSubmit={handleAddLink} className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Server / Web URL *</label>
            <input
              type="text"
              required
              placeholder="e.g. https://my-app.staging-server.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="input-field w-full text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Title / Label (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Staging Server Link"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              className="input-field w-full text-xs"
            />
          </div>
          <button
            type="submit"
            disabled={addingLink || !linkUrl.trim()}
            className="btn-primary w-full py-1.5 text-xs flex items-center justify-center gap-1.5"
          >
            {addingLink ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Plus size={14} />
            )}
            Attach URL Link
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-4 text-slate-400">
          <Loader2 className="animate-spin" size={18} />
        </div>
      ) : attachments.length ? (
        <div className="space-y-2">
          <div className="space-y-2">
            {paginatedAttachments.map((item) => {
              const isUrl = isUrlAttachment(item);
              const formattedSize = formatBytes(item.file_size);
              const shareUrl = getShareableUrl(item);

              return (
                <div
                  key={item.attachment_id}
                  className={`flex items-center justify-between rounded-xl border p-2.5 transition ${
                    isLight
                      ? 'border-slate-200 bg-white shadow-sm hover:border-slate-300'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">{getFileIcon(item.mime_type, item.original_name, item.file_path)}</div>
                    <div className="min-w-0 flex-1">
                      {isUrl ? (
                        <a
                          href={shareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-1 truncate text-xs font-semibold text-cyan-400 hover:underline"
                          title={shareUrl}
                        >
                          <span className="truncate">{item.original_name || item.file_path}</span>
                          <ExternalLink size={12} className="shrink-0 opacity-70 group-hover:opacity-100" />
                        </a>
                      ) : (
                        <p className={`truncate text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`} title={item.original_name}>
                          {item.original_name}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500">
                        {isUrl ? 'URL Link' : formattedSize} • {item.uploaded_by_name || 'User'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(item)}
                      className={`rounded-lg p-1.5 transition ${
                        isLight
                          ? 'text-slate-500 hover:bg-slate-100 hover:text-cyan-600'
                          : 'text-slate-400 hover:bg-white/10 hover:text-cyan-300'
                      }`}
                      title="Copy shareable link"
                    >
                      {copiedId === item.attachment_id ? (
                        <Check size={15} className="text-emerald-400" />
                      ) : (
                        <Share2 size={15} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      className={`rounded-lg p-1.5 transition ${
                        isLight
                          ? 'text-slate-500 hover:bg-slate-100 hover:text-cyan-600'
                          : 'text-slate-400 hover:bg-white/10 hover:text-cyan-300'
                      }`}
                      title={isUrl ? 'Open link in new tab' : 'Download attachment'}
                    >
                      {isUrl ? <ExternalLink size={15} /> : <Download size={15} />}
                    </button>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.attachment_id, item.original_name)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"
                        title="Delete attachment"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs">
              <button
                type="button"
                className="btn-secondary px-2 py-1 text-xs"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-[10px] uppercase tracking-wider text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn-secondary px-2 py-1 text-xs"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="py-2 text-center text-xs text-slate-500">No files or links attached to this task yet.</p>
      )}
        </>
      )}
    </div>
  );
};

export default TaskAttachments;
