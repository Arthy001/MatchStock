import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldErrorTooltipProps {
  message?: string;
  className?: string;
}

export const FieldErrorTooltip: React.FC<FieldErrorTooltipProps> = ({
  message,
  className = '',
}) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`absolute top-full left-0 mt-1.5 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 dark:bg-rose-700 text-white text-xs font-semibold shadow-xl shadow-rose-950/40 animate-in fade-in zoom-in-95 duration-150 pointer-events-none ${className}`}
    >
      {/* Top pointer arrow */}
      <div className="absolute -top-1 left-4 w-2 h-2 bg-rose-600 dark:bg-rose-700 transform rotate-45" />
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
};
