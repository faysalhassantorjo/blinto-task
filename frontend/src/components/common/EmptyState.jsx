import React from 'react';
import { Film } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Film,
  title = 'No items found',
  description = 'Get started by creating your first entry.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-charcoal-300 bg-white/60 ${className}`}
    >
      <div className="p-3.5 rounded-full bg-charcoal-100 text-charcoal-500 mb-4 shadow-subtle">
        <Icon className="w-7 h-7 stroke-[1.75]" />
      </div>
      <h3 className="text-base font-semibold text-charcoal-900 mb-1.5">{title}</h3>
      <p className="text-sm text-charcoal-500 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
