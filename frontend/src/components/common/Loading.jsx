import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Basic shimmer skeleton element
 */
export function Skeleton({ className = '' }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-charcoal-200/70 rounded-md',
        className
      )}
    />
  );
}

/**
 * Centered spinner for general loading sections
 */
export default function Loading({ message = 'Loading...', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-charcoal-500">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 gap-2.5 text-charcoal-500">
      <Loader2 className="w-5 h-5 text-primary animate-spin" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

/**
 * Skeleton card grid loader
 */
export function CardSkeletonList({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-charcoal-200 rounded-xl p-5 flex flex-col gap-3 shadow-card"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-3/5" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-4/5" />
          <div className="flex items-center gap-2 mt-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
