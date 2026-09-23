import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon,
  File as FileIcon,
  Globe,
  Download,
  Share2,
  Check,
  Paperclip,
  Folder,
  FolderOpen
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import clsx from 'clsx';

const pageVariants = {
  spring: { type: 'spring', duration: 0.55 },
};

export function FolderInteraction({
  attachments = [],
  onDownload,
  onCopyLink,
  copiedId,
  readOnly = false
}) {
  const { isLight } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Take up to 3 attachments for the 3D folder cards
  const folderItems = attachments.slice(0, 3);
  const totalCount = attachments.length;

  const cardPositions = [
    {
      initial: { rotate: -3, x: -24, y: 2 },
      open: { rotate: -8, x: -46, y: -34 },
      transition: {
        ...pageVariants.spring,
        bounce: 0.15,
        stiffness: 170,
        damping: 22,
      },
      className: 'z-10 shadow-md',
    },
    {
      initial: { rotate: 0, x: 0, y: 0 },
      open: { rotate: 1, x: 0, y: -44 },
      transition: {
        ...pageVariants.spring,
        duration: 0.5,
        bounce: 0.12,
        stiffness: 190,
        damping: 24,
      },
      className: 'z-20 shadow-lg',
    },
    {
      initial: { rotate: 3.5, x: 26, y: 1 },
      open: { rotate: 9, x: 48, y: -36 },
      transition: {
        ...pageVariants.spring,
        duration: 0.52,
        bounce: 0.17,
        stiffness: 170,
        damping: 21,
      },
      className: 'z-10 shadow-md',
    },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center my-2 py-1">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'text-[11px] font-semibold mb-2 flex items-center gap-1.5 transition-colors cursor-pointer select-none',
          isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-white'
        )}
      >
        {isOpen ? <FolderOpen size={13} className={isLight ? 'text-slate-700' : 'text-zinc-200'} /> : <Folder size={13} className={isLight ? 'text-slate-700' : 'text-zinc-200'} />}
        <span>{isOpen ? 'Close preview' : 'Interactive 3D Vault'}</span>
        <span className={clsx(
          'text-[10px] px-2 py-0.5 rounded-full font-bold border ml-1',
          isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-zinc-800 text-zinc-300 border-white/10'
        )}>
          {totalCount} {totalCount === 1 ? 'file' : 'files'}
        </span>
      </button>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-52 sm:w-60 h-32 sm:h-36 relative wrapper cursor-pointer select-none group"
      >
        {/* Folder Back Container */}
        <div
          className={clsx(
            'folder relative w-[88%] mx-auto items-center h-full flex justify-center border transition-all duration-300',
            isLight
              ? 'bg-slate-100/90 border-slate-300/80 shadow-md shadow-slate-200/40'
              : 'bg-[#141417] border-white/10 shadow-xl shadow-black/40'
          )}
          style={{
            boxShadow: isLight
              ? '0px 0px 10px 10px rgba(203, 213, 225, 0.3) inset'
              : '0px 0px 12px 12px rgba(39, 39, 42, 0.4) inset',
            borderRadius: 14,
          }}
        >
          {/* Animated Document Cards */}
          {(folderItems.length > 0
            ? folderItems
            : [
                { original_name: 'No files', mime_type: 'empty' },
                { original_name: 'Drop here', mime_type: 'empty' },
                { original_name: 'Attach file', mime_type: 'empty' }
              ]
          ).map((att, i) => {
            const config = cardPositions[i % cardPositions.length];
            return (
              <motion.div
                key={att.attachment_id || `card-${i}`}
                initial={config.initial}
                animate={isOpen ? config.open : config.initial}
                transition={config.transition}
                className={`absolute top-1.5 w-24 sm:w-28 h-26 sm:h-28 rounded-lg overflow-hidden border ${config.className} ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-800 shadow-slate-300/50'
                    : 'bg-[#242427] border-white/15 text-zinc-100 shadow-black/80'
                }`}
                onClick={(e) => {
                  if (isOpen && att.attachment_id && onDownload) {
                    e.stopPropagation();
                    onDownload(att);
                  }
                }}
              >
                <FolderCardContent
                  attachment={att}
                  onDownload={onDownload}
                  onCopyLink={onCopyLink}
                  isCopied={copiedId === att.attachment_id}
                  isLight={isLight}
                />
              </motion.div>
            );
          })}
        </div>

        {/* 3D Folder Front Flap */}
        <motion.div
          animate={{ rotateX: isOpen ? -38 : 0 }}
          transition={{ type: 'spring', duration: 0.45, bounce: 0.18 }}
          className="absolute -left-[1px] -right-[1px] -bottom-[1px] z-30 h-28 sm:h-32 rounded-2xl origin-bottom flex justify-center items-center overflow-visible"
        >
          <svg
            className="w-full h-full overflow-visible drop-shadow-md"
            viewBox="0 0 235 121"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              id="Vector"
              d="M104.615 0.350494L33.1297 0.838776C32.7542 0.841362 32.3825 0.881463 32.032 0.918854C31.6754 0.956907 31.3392 0.992086 31.0057 0.992096H31.0047C30.6871 0.99235 30.3673 0.962051 30.0272 0.929596C29.6927 0.897686 29.3384 0.863802 28.9803 0.866119L13.2693 0.967682H13.2527L13.2352 0.969635C13.1239 0.981406 13.0121 0.986674 12.9002 0.986237H9.91388C8.33299 0.958599 6.76052 1.22345 5.27423 1.76651H5.27325C4.33579 2.11246 3.48761 2.66213 2.7879 3.37393L2.49689 3.68839L2.492 3.69424C1.62667 4.73882 1.00023 5.96217 0.656067 7.27725C0.653324 7.28773 0.654065 7.29886 0.652161 7.30948C0.3098 8.62705 0.257231 10.0048 0.499817 11.3446L12.2147 114.399L12.2156 114.411L12.2176 114.423C12.6046 116.568 13.7287 118.508 15.3934 119.902C17.058 121.297 19.1572 122.056 21.3231 122.049V122.05H215.379C217.76 122.02 220.064 121.192 221.926 119.698V119.697C223.657 118.384 224.857 116.485 225.305 114.35L225.307 114.339L235.914 53.3798L235.968 53.1093L235.97 53.0985L235.971 53.0888C236.134 51.8978 236.044 50.685 235.705 49.5321C235.307 48.1669 234.63 46.9005 233.717 45.8144L233.383 45.4296C232.58 44.5553 231.614 43.8449 230.539 43.3398C229.311 42.7628 227.971 42.4685 226.616 42.4774H146.746C144.063 42.4705 141.423 41.8004 139.056 40.5263C136.691 39.2522 134.671 37.4127 133.175 35.1689L113.548 5.05948L113.544 5.05362L113.539 5.04776C112.545 3.65165 111.238 2.51062 109.722 1.72061C108.266 0.886502 106.627 0.422235 104.952 0.365143V0.364166L104.633 0.350494H104.615Z"
              fill="url(#paint0_linear_folder_theme)"
              fillOpacity={isLight ? "0.95" : "0.9"}
              stroke="url(#paint1_linear_folder_theme)"
              strokeWidth="0.8"
            />
            <defs>
              <linearGradient
                id="paint0_linear_folder_theme"
                x1="114.7"
                y1="0.7"
                x2="114.7"
                y2="121.7"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor={isLight ? '#ffffff' : '#27272a'} />
                <stop offset="1" stopColor={isLight ? '#f1f5f9' : '#141417'} />
              </linearGradient>
              <linearGradient
                id="paint1_linear_folder_theme"
                x1="114.7"
                y1="0.7"
                x2="114.7"
                y2="121.7"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor={isLight ? '#cbd5e1' : '#ffffff'} stopOpacity={isLight ? "0.9" : "0.2"} />
                <stop offset="1" stopColor={isLight ? '#94a3b8' : '#ffffff'} stopOpacity={isLight ? "0.6" : "0.08"} />
              </linearGradient>
            </defs>
          </svg>
          <div className={clsx(
            'absolute inset-0 flex items-center justify-center gap-1.5 pointer-events-none font-bold text-[11px]',
            isLight ? 'text-slate-800' : 'text-zinc-100'
          )}>
            <Paperclip size={13} className={isLight ? 'text-slate-600' : 'text-zinc-300'} />
            <span>Vault Preview ({totalCount})</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FolderCardContent({ attachment, onDownload, onCopyLink, isCopied, isLight }) {
  if (attachment.mime_type === 'empty') {
    return (
      <div className="p-2 h-full flex flex-col justify-between select-none">
        <div className="space-y-1">
          <div className="w-full h-1 bg-slate-200 dark:bg-zinc-700 rounded-full" />
          <div className="w-3/4 h-1 bg-slate-200 dark:bg-zinc-700 rounded-full" />
        </div>
        <p className="text-[9px] font-semibold text-center text-slate-400 dark:text-zinc-500">
          {attachment.original_name}
        </p>
      </div>
    );
  }

  const isUrl = attachment.mime_type === 'url' || attachment.file_name === 'link';
  const name = attachment.original_name || attachment.file_name || 'File';
  const ext = name.split('.').pop()?.toLowerCase() || '';

  return (
    <div className="p-2 h-full flex flex-col justify-between group/card relative">
      <div className="flex items-center justify-between gap-1">
        <span className={clsx(
          'p-0.5 rounded border',
          isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-zinc-800 text-zinc-300 border-white/10'
        )}>
          {isUrl ? <Globe size={11} /> : ext === 'pdf' ? <FileText size={11} /> : <FileIcon size={11} />}
        </span>
        <span className={clsx(
          'text-[8px] font-extrabold uppercase tracking-wider px-1 py-0.5 rounded border',
          isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-zinc-800 text-zinc-400 border-white/10'
        )}>
          {isUrl ? 'LINK' : ext || 'FILE'}
        </span>
      </div>

      <div className="my-0.5">
        <p className="text-[10px] font-semibold line-clamp-2 leading-tight break-all" title={name}>
          {name}
        </p>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-white/10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onCopyLink) onCopyLink(attachment);
          }}
          className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          title="Copy Link"
        >
          {isCopied ? <Check size={11} className="text-emerald-500" /> : <Share2 size={11} />}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onDownload) onDownload(attachment);
          }}
          className={clsx(
            'p-0.5 rounded text-xs font-medium transition-colors cursor-pointer shadow-2xs',
            isLight ? 'bg-slate-800 text-white hover:bg-slate-900' : 'bg-zinc-100 text-zinc-900 hover:bg-white'
          )}
          title={isUrl ? 'Open Link' : 'Download File'}
        >
          <Download size={11} />
        </button>
      </div>
    </div>
  );
}

export default FolderInteraction;
