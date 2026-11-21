import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Film, ListOrdered } from 'lucide-react';
import { formatRuntime } from '../../utils/formatters';

export default function RewatchSummary({ summary, targetTitle }) {
  const { total_movies, watched_count, unwatched_count, unwatched_runtime } = summary;

  const progressPercent =
    total_movies > 0 ? Math.round((watched_count / total_movies) * 100) : 100;

  return (
    <div className="bg-card border border-charcoal-200 rounded-xl p-5 shadow-card flex flex-col gap-5">
      {/* Target Heading & Progress Bar */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-400">
              Prerequisite Roadmap for
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
              {targetTitle}
            </h2>
          </div>
          <div className="text-sm font-semibold text-charcoal-700">
            {watched_count} of {total_movies} completed ({progressPercent}%)
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-2.5 bg-charcoal-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`h-full rounded-full transition-colors ${
              progressPercent === 100 ? 'bg-status-success' : 'bg-primary'
            }`}
          />
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-charcoal-100">
        <div className="p-3 rounded-lg bg-charcoal-50/70 border border-charcoal-200/60">
          <div className="flex items-center gap-1.5 text-xs text-charcoal-500 font-medium mb-1">
            <ListOrdered className="w-3.5 h-3.5 text-charcoal-400" />
            <span>Total Needed</span>
          </div>
          <p className="text-xl font-bold text-charcoal-900">{total_movies}</p>
        </div>

        <div className="p-3 rounded-lg bg-charcoal-50/70 border border-charcoal-200/60">
          <div className="flex items-center gap-1.5 text-xs text-status-success font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
          <p className="text-xl font-bold text-status-success">{watched_count}</p>
        </div>

        <div className="p-3 rounded-lg bg-charcoal-50/70 border border-charcoal-200/60">
          <div className="flex items-center gap-1.5 text-xs text-charcoal-500 font-medium mb-1">
            <Film className="w-3.5 h-3.5 text-charcoal-400" />
            <span>Remaining</span>
          </div>
          <p className="text-xl font-bold text-charcoal-800">{unwatched_count}</p>
        </div>

        <div className="p-3 rounded-lg bg-charcoal-50/70 border border-charcoal-200/60">
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Time Left</span>
          </div>
          <p className="text-xl font-bold text-charcoal-900">
            {formatRuntime(unwatched_runtime)}
          </p>
        </div>
      </div>
    </div>
  );
}
