import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldErrorProps {
  error?: string;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error, className = '' }) => {
  if (!error) return null;
  return (
    <p className={`text-xs font-semibold text-red-500 mt-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-0.5 duration-150 ${className}`}>
      <AlertCircle className="w-3.5 h-3.5 shrink-0 stroke-[2.5] text-red-500" />
      <span>{error}</span>
    </p>
  );
};
