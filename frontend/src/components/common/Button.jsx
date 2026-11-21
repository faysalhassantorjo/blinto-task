import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary shadow-subtle',
    secondary: 'bg-charcoal-100 text-charcoal-900 hover:bg-charcoal-200 focus:ring-charcoal-400',
    outline: 'border border-charcoal-200 bg-white text-charcoal-900 hover:bg-charcoal-50 hover:border-charcoal-300 focus:ring-charcoal-300 shadow-subtle',
    ghost: 'text-charcoal-700 hover:bg-charcoal-100 hover:text-charcoal-900 focus:ring-charcoal-300',
    danger: 'bg-status-error text-white hover:bg-red-700 focus:ring-red-400 shadow-subtle',
    subtleDanger: 'text-status-error hover:bg-status-errorBg focus:ring-red-300',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-3.5 py-2 gap-2 h-9',
    lg: 'text-sm px-5 py-2.5 gap-2.5 h-11',
  };

  return (
    <motion.button
      type={type}
      whileHover={disabled || isLoading ? undefined : { scale: 1.01 }}
      whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.15 }}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </motion.button>
  );
}
