import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  FileCheck,
  ChevronRight,
  Layers,
  Users,
  Briefcase,
  ListChecks,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { importService } from '../services/importService';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

const BulkImportModal = ({ open, onClose, onImportSuccess }) => {
  const { isLight } = useTheme();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1: Upload, 2: Preview & Validate, 3: Success Result
  const [file, setFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'projects' | 'users'
  const [importSummary, setImportSummary] = useState(null);

  if (!open) return null;

  const handleDownloadTemplate = async () => {
    try {
      toast.loading('Preparing Excel template...', { id: 'template-dl' });
      await importService.downloadTemplate();
      toast.success('Template downloaded successfully!', { id: 'template-dl' });
    } catch (error) {
      toast.error(error.message || 'Failed to download template', { id: 'template-dl' });
    }
  };

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;
    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      toast.error('Please upload a valid Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setFile(selectedFile);
    setValidating(true);
    try {
      toast.loading('Analyzing & validating rows...', { id: 'val-loader' });
      const data = await importService.validateFile(selectedFile);
      setValidationData(data);
      setStep(2);
      toast.success('File validated successfully!', { id: 'val-loader' });
    } catch (error) {
      toast.error(error.message || 'Validation failed. Please check your Excel format.', { id: 'val-loader' });
    } finally {
      setValidating(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleCommit = async () => {
    if (!validationData) return;
    setCommitting(true);
    try {
      toast.loading('Importing data into database...', { id: 'commit-loader' });
      const res = await importService.commitImport({
        users: validationData.users || [],
        projects: validationData.projects || [],
        tasks: validationData.tasks || []
      });

      setImportSummary(res.summary);
      setStep(3);
      toast.success('Bulk Import completed successfully!', { id: 'commit-loader' });
      if (onImportSuccess) onImportSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to commit import data', { id: 'commit-loader' });
    } finally {
      setCommitting(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setFile(null);
    setValidationData(null);
    setImportSummary(null);
    setActiveTab('tasks');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const summary = validationData?.summary;

  return createPortal(
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-slate-950/75 backdrop-blur-md p-4 sm:p-6 transition-all duration-300">
      <div className="flex min-h-full items-center justify-center">
        <div
          className={clsx(
            'w-full max-w-4xl overflow-hidden rounded-2xl border shadow-2xl transition-all duration-300',
            isLight
              ? 'border-slate-200 bg-white text-slate-900 shadow-slate-300/40'
              : 'border-[var(--border-soft)] bg-[var(--panel)] text-[var(--text-primary)] shadow-black/60'
          )}
        >
          {/* Header */}
          <div
            className={clsx(
              'flex items-center justify-between border-b px-6 py-4.5',
              isLight ? 'border-slate-200 bg-slate-50/90' : 'border-[var(--border-soft)] bg-[var(--panel-soft)]'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  'flex h-10 w-10 items-center justify-center rounded-xl border transition-colors',
                  isLight
                    ? 'border-blue-200 bg-blue-50 text-blue-600'
                    : 'border-blue-500/30 bg-blue-500/10 text-cyan-400'
                )}
              >
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">Data Synchronization</p>
                <h3 className="text-lg font-bold">Bulk Excel & CSV Data Import</h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className={clsx(
                'rounded-full p-2 transition-colors',
                isLight ? 'text-slate-400 hover:bg-slate-200 hover:text-slate-700' : 'text-slate-400 hover:bg-white/10 hover:text-white'
              )}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6">
            {/* Step 1: Upload File & Template Download */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Download Template Banner */}
                <div
                  className={clsx(
                    'flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 transition-all',
                    isLight
                      ? 'border-blue-200 bg-blue-50/60'
                      : 'border-blue-500/25 bg-blue-500/10'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FileCheck size={24} className="text-cyan-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold">Need the standard Excel format?</h4>
                      <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                        Download our pre-formatted template with sample rows for Tasks, Projects, and Users.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-2 shrink-0"
                  >
                    <Download size={15} />
                    Download Template
                  </button>
                </div>

                {/* Drag & Drop Upload Box */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={clsx(
                    'group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer',
                    validating
                      ? 'opacity-50 pointer-events-none'
                      : isLight
                        ? 'border-slate-300 bg-slate-50/50 hover:border-blue-500 hover:bg-blue-50/30'
                        : 'border-[var(--border-soft)] bg-[var(--input-bg)] hover:border-cyan-400/60 hover:bg-blue-500/5'
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />

                  <div
                    className={clsx(
                      'flex h-14 w-14 items-center justify-center rounded-2xl border transition-all group-hover:scale-110 mb-4',
                      isLight
                        ? 'border-blue-200 bg-white text-blue-600 shadow-sm'
                        : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                    )}
                  >
                    {validating ? (
                      <Loader2 size={24} className="animate-spin text-cyan-400" />
                    ) : (
                      <Upload size={24} />
                    )}
                  </div>

                  <h4 className="text-base font-bold">
                    {validating ? 'Analyzing file contents...' : 'Click or Drag & Drop Excel File'}
                  </h4>
                  <p className={`text-xs mt-1 max-w-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv) files up to 15MB.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Validation Preview Table */}
            {step === 2 && validationData && (
              <div className="space-y-4">
                {/* Summary Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className={`rounded-xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[var(--border-soft)] bg-[var(--panel-soft)]'}`}>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Analyzed</p>
                    <p className="text-xl font-black mt-0.5">{summary?.totalRows || 0} Rows</p>
                  </div>

                  <div className={`rounded-xl border p-3 ${isLight ? 'border-emerald-200 bg-emerald-50' : 'border-emerald-500/30 bg-emerald-500/10'}`}>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Valid Rows</p>
                    <p className="text-xl font-black text-emerald-400 mt-0.5">{summary?.validRowsCount || 0}</p>
                  </div>

                  <div className={`rounded-xl border p-3 ${isLight ? 'border-amber-200 bg-amber-50' : 'border-amber-500/30 bg-amber-500/10'}`}>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Warnings (Linking)</p>
                    <p className="text-xl font-black text-amber-400 mt-0.5">{summary?.warningRowsCount || 0}</p>
                  </div>

                  <div className={`rounded-xl border p-3 ${isLight ? 'border-rose-200 bg-rose-50' : 'border-rose-500/30 bg-rose-500/10'}`}>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Errors (Skipped)</p>
                    <p className="text-xl font-black text-rose-400 mt-0.5">{summary?.errorRowsCount || 0}</p>
                  </div>
                </div>

                {/* Sub-sheet Tabs */}
                <div className="flex border-b border-inherit gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('tasks')}
                    className={clsx(
                      'flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-bold transition-all',
                      activeTab === 'tasks'
                        ? 'border-cyan-400 text-cyan-400'
                        : 'border-transparent text-slate-400 hover:text-white'
                    )}
                  >
                    <ListChecks size={15} />
                    Tasks ({validationData.tasks?.length || 0})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('projects')}
                    className={clsx(
                      'flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-bold transition-all',
                      activeTab === 'projects'
                        ? 'border-cyan-400 text-cyan-400'
                        : 'border-transparent text-slate-400 hover:text-white'
                    )}
                  >
                    <Briefcase size={15} />
                    Projects ({validationData.projects?.length || 0})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('users')}
                    className={clsx(
                      'flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-bold transition-all',
                      activeTab === 'users'
                        ? 'border-cyan-400 text-cyan-400'
                        : 'border-transparent text-slate-400 hover:text-white'
                    )}
                  >
                    <Users size={15} />
                    Users ({validationData.users?.length || 0})
                  </button>
                </div>

                {/* Tabular Rows Preview */}
                <div className="max-h-72 overflow-y-auto rounded-xl border border-inherit">
                  {activeTab === 'tasks' && (
                    <table className="w-full text-left text-xs">
                      <thead className={`sticky top-0 font-bold border-b ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[var(--panel-soft)] border-[var(--border-soft)]'}`}>
                        <tr>
                          <th className="p-2.5">Row</th>
                          <th className="p-2.5">Task Title</th>
                          <th className="p-2.5">Project</th>
                          <th className="p-2.5">Assignee</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Validation Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit">
                        {validationData.tasks?.length ? (
                          validationData.tasks.map((row, idx) => (
                            <tr key={idx} className={row.statusType === 'ERROR' ? 'bg-rose-500/10' : row.statusType === 'WARNING' ? 'bg-amber-500/10' : ''}>
                              <td className="p-2.5 font-mono opacity-70">#{row.rowNumber}</td>
                              <td className="p-2.5 font-semibold">{row.title || '—'}</td>
                              <td className="p-2.5 opacity-80">{row.projectName || '—'}</td>
                              <td className="p-2.5 opacity-80">{row.assignedEmail || 'Unassigned'}</td>
                              <td className="p-2.5">
                                <span
                                  className={clsx(
                                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                                    row.statusType === 'ERROR'
                                      ? 'bg-rose-500/20 text-rose-300'
                                      : row.statusType === 'WARNING'
                                        ? 'bg-amber-500/20 text-amber-300'
                                        : 'bg-emerald-500/20 text-emerald-300'
                                  )}
                                >
                                  {row.statusType}
                                </span>
                              </td>
                              <td className="p-2.5 opacity-90">{row.message}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={6} className="p-4 text-center opacity-60">No task rows found in sheet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {activeTab === 'projects' && (
                    <table className="w-full text-left text-xs">
                      <thead className={`sticky top-0 font-bold border-b ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[var(--panel-soft)] border-[var(--border-soft)]'}`}>
                        <tr>
                          <th className="p-2.5">Row</th>
                          <th className="p-2.5">Project Name</th>
                          <th className="p-2.5">Parent Project</th>
                          <th className="p-2.5">Validation Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit">
                        {validationData.projects?.length ? (
                          validationData.projects.map((row, idx) => (
                            <tr key={idx} className={row.statusType === 'ERROR' ? 'bg-rose-500/10' : row.statusType === 'WARNING' ? 'bg-amber-500/10' : ''}>
                              <td className="p-2.5 font-mono opacity-70">#{row.rowNumber}</td>
                              <td className="p-2.5 font-semibold">{row.projectName || '—'}</td>
                              <td className="p-2.5 opacity-80">{row.parentProjectName || '—'}</td>
                              <td className="p-2.5 opacity-90">{row.message}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={4} className="p-4 text-center opacity-60">No project rows found in sheet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {activeTab === 'users' && (
                    <table className="w-full text-left text-xs">
                      <thead className={`sticky top-0 font-bold border-b ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[var(--panel-soft)] border-[var(--border-soft)]'}`}>
                        <tr>
                          <th className="p-2.5">Row</th>
                          <th className="p-2.5">Full Name</th>
                          <th className="p-2.5">Email</th>
                          <th className="p-2.5">Role</th>
                          <th className="p-2.5">Validation Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit">
                        {validationData.users?.length ? (
                          validationData.users.map((row, idx) => (
                            <tr key={idx} className={row.status === 'ERROR' ? 'bg-rose-500/10' : row.status === 'WARNING' ? 'bg-amber-500/10' : ''}>
                              <td className="p-2.5 font-mono opacity-70">#{row.rowNumber}</td>
                              <td className="p-2.5 font-semibold">{row.fullName || '—'}</td>
                              <td className="p-2.5 opacity-80">{row.email || '—'}</td>
                              <td className="p-2.5 uppercase font-bold text-[10px]">{row.role}</td>
                              <td className="p-2.5 opacity-90">{row.message}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={5} className="p-4 text-center opacity-60">No user rows found in sheet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Success Confirmation */}
            {step === 3 && importSummary && (
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Import Completed Successfully!</h3>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    All valid records have been synced with the database.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
                  <div className={`rounded-xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[var(--border-soft)] bg-[var(--panel-soft)]'}`}>
                    <p className="text-xs font-bold text-slate-400">Users Created</p>
                    <p className="text-2xl font-black text-cyan-400 mt-1">{importSummary.usersCreated || 0}</p>
                  </div>
                  <div className={`rounded-xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[var(--border-soft)] bg-[var(--panel-soft)]'}`}>
                    <p className="text-xs font-bold text-slate-400">Projects Created</p>
                    <p className="text-2xl font-black text-indigo-400 mt-1">{importSummary.projectsCreated || 0}</p>
                  </div>
                  <div className={`rounded-xl border p-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[var(--border-soft)] bg-[var(--panel-soft)]'}`}>
                    <p className="text-xs font-bold text-slate-400">Tasks Created</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">{importSummary.tasksCreated || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div
            className={clsx(
              'flex items-center justify-between border-t px-6 py-4',
              isLight ? 'border-slate-200 bg-slate-50/90' : 'border-[var(--border-soft)] bg-[var(--panel-soft)]'
            )}
          >
            {step === 2 ? (
              <button
                type="button"
                onClick={resetModal}
                className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                Upload Different File
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              {step === 2 && (
                <button
                  type="button"
                  disabled={committing || summary?.validRowsCount === 0}
                  onClick={handleCommit}
                  className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {committing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  Commit & Import ({summary?.validRowsCount || 0} Valid Rows)
                </button>
              )}

              {step === 3 && (
                <button type="button" onClick={handleClose} className="btn-primary px-6 py-2 text-xs font-bold">
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BulkImportModal;
