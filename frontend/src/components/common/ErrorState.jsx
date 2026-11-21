import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-charcoal-200 bg-status-errorBg/30 ${className}`}
    >
      <div className="p-3.5 rounded-full bg-status-errorBg text-status-error mb-4">
        <AlertCircle className="w-7 h-7 stroke-[1.75]" />
      </div>
      <h3 className="text-base font-semibold text-charcoal-900 mb-1.5">{title}</h3>
      <p className="text-sm text-charcoal-600 max-w-md mb-5 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="md"
          icon={RotateCcw}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
