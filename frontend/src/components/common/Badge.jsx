import React from 'react';
import { cn } from '../../utils/cn';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon: Icon,
}) {
  const variants = {
    default: 'bg-charcoal-100 text-charcoal-700 border border-charcoal-200',
    primary: 'bg-primary-light text-primary border border-primary/20',
    success: 'bg-status-successBg text-status-success border border-status-success/20',
    warning: 'bg-status-warningBg text-status-warning border border-status-warning/20',
    error: 'bg-status-errorBg text-status-error border border-status-error/20',
    outline: 'border border-charcoal-200 text-charcoal-700 bg-white',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium rounded-md',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium rounded-md',
    lg: 'text-sm px-3 py-1.5 gap-1.5 font-medium rounded-lg',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center select-none shrink-0 transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
}
