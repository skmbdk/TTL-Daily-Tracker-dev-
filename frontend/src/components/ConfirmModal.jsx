import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const ConfirmModal = ({ open, title, message, confirmText = 'Confirm', onCancel, onConfirm }) => {
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="modal-glass relative w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow accent */}
            <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-cyan-500/20 via-transparent to-blue-500/20 opacity-50" />

            <div className="relative">
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{message}</p>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-secondary" onClick={onCancel}>
                  Cancel
                </button>
                <button className="btn-danger" onClick={onConfirm}>
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ConfirmModal;
