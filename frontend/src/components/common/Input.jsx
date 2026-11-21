import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    id,
    type = 'text',
    className = '',
    inputClassName = '',
    required = false,
    icon: Icon,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-charcoal-700 select-none"
        >
          {label} {required && <span className="text-status-error">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-charcoal-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'w-full bg-white border border-charcoal-200 rounded-lg px-3 py-2 text-sm text-charcoal-900 placeholder:text-charcoal-400 transition-colors',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-ring',
            'disabled:bg-charcoal-50 disabled:text-charcoal-400 disabled:cursor-not-allowed',
            error && 'border-status-error focus:border-status-error focus:ring-red-100',
            Icon && 'pl-9',
            inputClassName
          )}
          {...props}
        />
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-status-error font-medium">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="text-xs text-charcoal-500">{helperText}</p>
      )}
    </div>
  );
});

export default Input;
