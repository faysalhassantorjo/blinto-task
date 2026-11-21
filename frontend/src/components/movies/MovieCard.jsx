import React from 'react';
import { 
  Clock, 
  Calendar, 
  Layers, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Circle,
  Network
} from 'lucide-react';
import Badge from '../common/Badge';
import { formatRuntime, formatYear } from '../../utils/formatters';

export default function MovieCard({
  movie,
  allMovies = [],
  onEdit,
  onDelete,
  onToggleWatched,
  onOpenGraph,
}) {
  const prereqCount = movie.prerequisites ? movie.prerequisites.length : 0;

  // Resolve titles of prerequisites for tooltip/details
  const prereqTitles = (movie.prerequisites || [])
    .map((id) => allMovies.find((m) => m.id === id)?.title)
    .filter(Boolean);

  return (
    <div
      onClick={() => onOpenGraph?.(movie)}
      className="group bg-card border border-charcoal-200 rounded-xl p-4 sm:p-5 shadow-card hover:border-primary/50 hover:shadow-elevated transition-all flex flex-col justify-between cursor-pointer relative"
    >
      {/* Top Details */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-bold text-sm sm:text-base text-charcoal-900 group-hover:text-primary transition-colors line-clamp-1">
            {movie.title}
          </h3>

          {/* Watched Status Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatched(movie.id, movie.watched);
            }}
            title={movie.watched ? 'Click to mark as unwatched' : 'Click to mark as watched'}
            className="shrink-0 transition-transform active:scale-95"
          >
            {movie.watched ? (
              <Badge variant="success" size="sm" icon={CheckCircle2}>
                Watched
              </Badge>
            ) : (
              <Badge variant="default" size="sm" icon={Circle}>
                Unwatched
              </Badge>
            )}
          </button>
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
            <span>{formatYear(movie.release_year)}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-charcoal-400" />
            <span>{formatRuntime(movie.runtime)}</span>
          </div>
        </div>

        {/* Prerequisites Info */}
        <div className="text-xs text-charcoal-500 mb-4">
          {prereqCount === 0 ? (
            <span className="text-charcoal-400 italic">No prerequisites</span>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 font-medium text-charcoal-700">
                <Layers className="w-3.5 h-3.5 text-charcoal-400" />
                {prereqCount} {prereqCount === 1 ? 'prerequisite' : 'prerequisites'}
              </span>
              {prereqTitles.length > 0 && (
                <span className="text-[11px] text-charcoal-400 line-clamp-1">
                  ({prereqTitles.slice(0, 2).join(', ')}{prereqTitles.length > 2 ? '...' : ''})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-charcoal-100 flex items-center justify-between gap-2">
        {/* Interactive Rewatch Graph Pill */}
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline"
        >
          <Network className="w-3.5 h-3.5" />
          <span>Rewatch Graph &rarr;</span>
        </span>

        {/* Actions (Edit / Delete) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(movie);
            }}
            className="p-1.5 rounded-md text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-100 transition-colors"
            title="Edit movie"
            aria-label={`Edit ${movie.title}`}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(movie);
            }}
            className="p-1.5 rounded-md text-charcoal-400 hover:text-status-error hover:bg-status-errorBg transition-colors"
            title="Delete movie"
            aria-label={`Delete ${movie.title}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
