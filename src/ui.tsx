import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from './utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass =
    size === 'lg'
      ? 'max-w-2xl'
      : size === 'sm'
      ? 'max-w-sm'
      : 'max-w-md';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm fade-in"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-white w-full rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col',
          sizeClass
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// Confirm dialog
export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}> = ({
  open,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  onConfirm,
  onCancel,
  danger,
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm fade-in p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-white font-semibold',
              danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-600 hover:bg-teal-700'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast
export const Toast: React.FC<{ message: string }> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="fixed top-4 inset-x-0 z-[70] flex justify-center pointer-events-none">
      <div className="bg-slate-900 text-white px-5 py-3 rounded-full shadow-lg text-sm font-medium fade-in">
        {message}
      </div>
    </div>
  );
};

// Empty state
export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ icon, title, subtitle, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-14 px-6">
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
    {subtitle && (
      <p className="text-sm text-slate-500 max-w-xs mb-4">{subtitle}</p>
    )}
    {action}
  </div>
);

// Field component
export const Field: React.FC<{
  label: string;
  children: React.ReactNode;
  required?: boolean;
}> = ({ label, children, required }) => (
  <label className="block mb-4">
    <span className="block text-sm font-semibold text-slate-700 mb-1.5">
      {label}
      {required && <span className="text-rose-500 mr-1">*</span>}
    </span>
    {children}
  </label>
);

// Input / TextArea shared styles
export const inputClass =
  'w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-slate-800 text-sm transition-colors';
export const selectClass = inputClass;

// Kind toggle (two buttons: debt / payment)
export const KindToggle: React.FC<{
  aLabel: string;
  bLabel: string;
  value: string;
  onChange: (v: string) => void;
  aColor?: string;
  bColor?: string;
}> = ({ aLabel, bLabel, value, onChange, aColor = 'bg-rose-600', bColor = 'bg-emerald-600' }) => {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-4">
      <button
        type="button"
        onClick={() => {
          setV('a');
          onChange('a');
        }}
        className={cn(
          'py-2.5 rounded-lg text-sm font-bold transition-colors',
          v === 'a'
            ? `${aColor} text-white shadow-sm`
            : 'bg-transparent text-slate-600'
        )}
      >
        {aLabel}
      </button>
      <button
        type="button"
        onClick={() => {
          setV('b');
          onChange('b');
        }}
        className={cn(
          'py-2.5 rounded-lg text-sm font-bold transition-colors',
          v === 'b'
            ? `${bColor} text-white shadow-sm`
            : 'bg-transparent text-slate-600'
        )}
      >
        {bLabel}
      </button>
    </div>
  );
};

// Summary Card
export const SummaryCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  onClick?: () => void;
}> = ({ title, value, subtitle, icon, gradient, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-right rounded-2xl p-5 text-white shadow-lg ${gradient} hover:shadow-xl transition-shadow relative overflow-hidden`}
  >
    <div className="absolute -left-6 -bottom-6 opacity-10 pointer-events-none">
      <div className="w-28 h-28 rounded-full bg-white" />
    </div>
    <div className="flex items-start justify-between mb-3">
      <span className="text-white/90 text-sm font-semibold">{title}</span>
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
        {icon}
      </div>
    </div>
    <div className="text-2xl font-extrabold num mb-1">{value}</div>
    {subtitle && (
      <div className="text-xs text-white/80 font-medium">{subtitle}</div>
    )}
  </button>
);

// Section heading
export const SectionHeading: React.FC<{
  title: string;
  action?: React.ReactNode;
}> = ({ title, action }) => (
  <div className="flex items-center justify-between mb-3 mt-6 first:mt-0">
    <h2 className="text-base font-bold text-slate-800">{title}</h2>
    {action}
  </div>
);

// Search bar
export const SearchBar: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = 'بحث...' }) => (
  <div className="relative mb-4">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
    />
    <svg
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  </div>
);

// Floating action button
export const FAB: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  label?: string;
}> = ({ onClick, children, label }) => (
  <button
    onClick={onClick}
    className="fixed bottom-24 left-5 z-30 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-2xl flex items-center gap-2 px-5 py-3.5 font-bold transition-all active:scale-95"
    aria-label={label}
  >
    {children}
    {label && <span className="text-sm">{label}</span>}
  </button>
);

// Page header (with optional back button)
export const PageHeader: React.FC<{
  title: string;
  onBack?: () => void;
  action?: React.ReactNode;
}> = ({ title, onBack, action }) => (
  <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 px-4 py-3 flex items-center gap-3">
    {onBack && (
      <button
        onClick={onBack}
        className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 -mr-1"
        aria-label="رجوع"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    )}
    <h1 className="text-lg font-bold text-slate-800 flex-1">{title}</h1>
    {action}
  </div>
);
