import React from 'react';
import { motion } from 'framer-motion';
import { Film, Sparkles, CheckCircle2 } from 'lucide-react';
import MovieTimelineItem from './MovieTimelineItem';

export default function RewatchTimeline({
  movies = [],
  targetMovie,
  onToggleWatched,
  isUpdating,
}) {
  const allWatched = movies.length > 0 && movies.every((m) => m.watched);

  return (
    <div className="relative pt-4">
      {/* Movies in topological order */}
      {movies.map((movie, index) => (
        <MovieTimelineItem
          key={movie.id}
          movie={movie}
          index={index}
          isLast={false}
          onToggleWatched={onToggleWatched}
          isUpdating={isUpdating}
        />
      ))}

      {/* Target Movie Milestone Node */}
      <div className="relative flex items-start gap-4 sm:gap-6">
        <div
          className={`relative z-10 shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-subtle ${
            allWatched
              ? 'bg-primary text-white ring-4 ring-primary-light'
              : 'bg-charcoal-900 text-white'
          }`}
        >
          {allWatched ? (
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          ) : (
            <Film className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          )}
        </div>

        <div
          className={`flex-1 rounded-xl p-5 border shadow-card mb-2 ${
            allWatched
              ? 'bg-gradient-to-r from-primary-light/40 to-white border-primary/40'
              : 'bg-card border-charcoal-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Target Destination
            </span>
          </div>
          <h3 className="text-lg font-bold text-charcoal-900">
            {targetMovie?.title}
          </h3>
          <p className="text-xs text-charcoal-500 mt-1">
            {allWatched
              ? '🎉 All prerequisites watched! You are completely prepared for this movie!'
              : 'Complete all prerequisite steps above to be fully prepared.'}
          </p>
        </div>
      </div>
    </div>
  );
}
