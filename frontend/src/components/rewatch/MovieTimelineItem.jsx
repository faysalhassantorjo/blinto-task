import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Calendar } from 'lucide-react';
import Badge from '../common/Badge';
import { formatRuntime, formatYear } from '../../utils/formatters';

export default function MovieTimelineItem({
  movie,
  index,
  isLast,
  onToggleWatched,
  isUpdating,
}) {
  const isWatched = movie.watched;

  return (
    <div className="relative flex items-start gap-4 sm:gap-6 group">
      {/* Timeline spine line */}
      {!isLast && (
        <div
          className={`absolute left-[17px] sm:left-[21px] top-10 bottom-0 w-0.5 transition-colors ${
            isWatched ? 'bg-status-success/30' : 'bg-charcoal-200'
          }`}
        />
      )}

      {/* Sequence Circle / Checkmark Button */}
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => onToggleWatched(movie.id, isWatched)}
        title={isWatched ? 'Click to mark as unwatched' : 'Click to mark as watched'}
        className={`relative z-10 shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isWatched
            ? 'bg-status-success text-white ring-2 ring-status-success/20 shadow-subtle'
            : 'bg-white text-charcoal-700 border-2 border-charcoal-300 group-hover:border-primary group-hover:text-primary shadow-subtle'
        }`}
      >
        {isWatched ? (
          <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        ) : (
          <span>{index + 1}</span>
        )}
      </button>

      {/* Card Content */}
      <motion.div
        layout
        className={`flex-1 rounded-xl p-4 sm:p-5 border transition-all mb-4 ${
          isWatched
            ? 'bg-status-successBg/20 border-status-success/30 text-charcoal-600'
            : 'bg-card border-charcoal-200 text-charcoal-900 shadow-card hover:border-charcoal-300'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">
                Step #{index + 1}
              </span>
              {isWatched && (
                <Badge variant="success" size="sm">
                  Watched
                </Badge>
              )}
            </div>
            <h4
              className={`text-base font-bold transition-colors ${
                isWatched ? 'text-charcoal-700 line-through decoration-charcoal-400' : 'text-charcoal-900'
              }`}
            >
              {movie.title}
            </h4>
          </div>

          {/* Toggle Button */}
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onToggleWatched(movie.id, isWatched)}
            className={`self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              isWatched
                ? 'border-charcoal-200 bg-white text-charcoal-600 hover:bg-charcoal-50'
                : 'border-primary bg-primary text-white hover:bg-primary-hover shadow-subtle'
            }`}
          >
            {isWatched ? 'Mark Unwatched' : 'Mark as Watched'}
          </button>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-charcoal-500 mt-3 pt-3 border-t border-charcoal-100/80">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
            <span>{formatYear(movie.release_year)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-charcoal-400" />
            <span>{formatRuntime(movie.runtime)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
