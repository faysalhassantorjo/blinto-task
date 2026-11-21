import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Calendar, Sparkles, Film, ArrowRight, PlayCircle } from 'lucide-react';
import Badge from '../common/Badge';
import { formatRuntime, formatYear } from '../../utils/formatters';

export default function RewatchRoadmap({
  movies = [],
  targetMovie,
  onToggleWatched,
  isUpdating,
}) {
  let cumulativeMinutes = 0;
  const allWatched = movies.length > 0 && movies.every((m) => m.watched);

  return (
    <div className="flex flex-col gap-3 py-2">
      {/* Intro banner */}
      <div className="flex items-center justify-between text-xs text-charcoal-500 pb-2 border-b border-charcoal-200">
        <span className="font-semibold uppercase tracking-wider text-charcoal-600">
          Chronological Storyline Flow ({movies.length} steps)
        </span>
        <span>Topological ordering strictly preserved</span>
      </div>

      {/* Pipeline List */}
      <div className="space-y-3 pt-2">
        {movies.map((movie, index) => {
          cumulativeMinutes += movie.runtime || 0;
          const isWatched = Boolean(movie.watched);
          const stepNumber = String(index + 1).padStart(2, '0');

          return (
            <motion.div
              key={movie.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className={`rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card ${
                isWatched
                  ? 'bg-status-successBg/20 border-status-success/30'
                  : 'bg-white border-charcoal-200 hover:border-charcoal-300'
              }`}
            >
              {/* Left Info */}
              <div className="flex items-start sm:items-center gap-3.5">
                {/* Step badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isWatched
                      ? 'bg-status-success text-white shadow-subtle'
                      : 'bg-charcoal-100 text-charcoal-700 border border-charcoal-200'
                  }`}
                >
                  {isWatched ? <Check className="w-4 h-4 stroke-[2.5]" /> : stepNumber}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
                      Step {index + 1} of {movies.length}
                    </span>
                    {isWatched && (
                      <Badge variant="success" size="sm">
                        Completed
                      </Badge>
                    )}
                  </div>

                  <h4
                    className={`text-sm sm:text-base font-bold transition-colors ${
                      isWatched
                        ? 'text-charcoal-600 line-through decoration-charcoal-400'
                        : 'text-charcoal-900'
                    }`}
                  >
                    {movie.title}
                  </h4>

                  <div className="flex items-center gap-3 text-xs text-charcoal-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-charcoal-400" />
                      {formatYear(movie.release_year)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-charcoal-400" />
                      {formatRuntime(movie.runtime)}
                    </span>
                    <span className="text-charcoal-400 hidden sm:inline">•</span>
                    <span className="text-charcoal-400 text-[11px] hidden sm:inline">
                      Cumulative watch: {formatRuntime(cumulativeMinutes)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action */}
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => onToggleWatched(movie.id, isWatched)}
                className={`self-start sm:self-auto px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border shrink-0 ${
                  isWatched
                    ? 'border-charcoal-200 bg-white text-charcoal-600 hover:bg-charcoal-50'
                    : 'border-primary bg-primary text-white hover:bg-primary-hover shadow-subtle'
                }`}
              >
                {isWatched ? 'Mark Unwatched' : 'Mark as Watched'}
              </button>
            </motion.div>
          );
        })}

        {/* Target Destination Final Card */}
        <div
          className={`rounded-xl border p-5 transition-all mt-4 shadow-card ${
            allWatched
              ? 'bg-gradient-to-r from-primary-light/50 to-white border-primary/50'
              : 'bg-charcoal-900 text-white border-charcoal-900'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    allWatched
                      ? 'bg-primary text-white'
                      : 'bg-charcoal-800 text-primary-light border border-charcoal-700'
                  }`}
                >
                  Final Destination
                </span>
                <span className={`text-xs ${allWatched ? 'text-charcoal-500' : 'text-charcoal-400'}`}>
                  Target Movie
                </span>
              </div>
              <h3 className={`text-lg font-bold ${allWatched ? 'text-charcoal-900' : 'text-white'}`}>
                {targetMovie?.title}
              </h3>
              <p className={`text-xs mt-1 ${allWatched ? 'text-charcoal-600' : 'text-charcoal-300'}`}>
                {allWatched
                  ? '🎉 All prerequisite movies have been watched! You are 100% ready for this movie.'
                  : 'Watch all prerequisites above to understand the full lore and character arcs before this movie.'}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {allWatched ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-status-success bg-status-successBg px-3 py-1.5 rounded-lg border border-status-success/30">
                  <Sparkles className="w-4 h-4" />
                  <span>Ready for Watch Party!</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal-400 bg-charcoal-800 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Total Marathon: {formatRuntime(cumulativeMinutes)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
