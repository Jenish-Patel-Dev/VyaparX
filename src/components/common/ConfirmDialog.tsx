import React from 'react';
import { AlertTriangle, X, Check, Trash2, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmIcon?: React.ReactNode;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmIcon,
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  const { palette } = useTheme();
  if (!isOpen) return null;

  const isLogout =
    title.toLowerCase().includes('logout') ||
    title.toLowerCase().includes('log out') ||
    confirmText.toLowerCase().includes('logout') ||
    confirmText.toLowerCase().includes('log out') ||
    confirmText === 'लॉग आउट' ||
    confirmText === 'લૉગ આઉટ';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 dark:bg-black/70 backdrop-blur-md animate-in fade-in"
    >
      <div 
        className="w-full max-w-sm bg-[#E8EDF3] dark:bg-[#262B36] rounded-3xl shadow-neu-raised-lg p-6 animate-in zoom-in-95 duration-150 border border-[#D5DDE7] dark:border-[#303746]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3.5 mb-3">
          {isLogout ? (
            <div className="w-11 h-11 rounded-2xl bg-[#DEE4ED] dark:bg-[#1B1F27] border border-rose-500/30 dark:border-rose-500/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-neu-inset-sm">
              <LogOut className="w-5 h-5 stroke-[2.2]" />
            </div>
          ) : isDestructive ? (
            <div className="w-11 h-11 rounded-2xl bg-[#DEE4ED] dark:bg-[#1B1F27] border border-rose-500/30 dark:border-rose-500/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-neu-inset-sm">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
          ) : null}
          <h3 className="text-lg font-black text-[#263244] dark:text-[#F0F3F8] tracking-tight break-words min-w-0 flex-1">{title}</h3>
        </div>

        <p className="text-xs text-[#68758A] dark:text-[#B3BDCD] mb-6 leading-relaxed font-medium break-words">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="neu-button-secondary flex-1 py-3 px-4 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>{cancelText}</span>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 font-bold rounded-2xl text-xs active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer ${
              isDestructive
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/25 border border-red-400/40'
                : 'neu-button-primary text-white'
            }`}
          >
            {confirmIcon ? (
              confirmIcon
            ) : isLogout ? (
              <LogOut className="w-4 h-4 stroke-[2.2]" />
            ) : isDestructive ? (
              <Trash2 className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
