import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import GuaridaTabs from './GuaridaTabs';
import { useBackToClose } from '../hooks/useBackToClose';

interface GuaridaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuaridaModal({ isOpen, onClose }: GuaridaModalProps) {
  // Handle native back button to close modal
  useBackToClose(isOpen, onClose);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/95 backdrop-blur-xl"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-surface border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-50 p-3 bg-background/50 hover:bg-background text-white/70 hover:text-white rounded-full transition-all border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pt-8 pb-8">
              <GuaridaTabs onClose={onClose} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
