import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Layers, 
  ListOrdered, 
  Sparkles, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Film, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Loading from '../common/Loading';
import ErrorState from '../common/ErrorState';
import RewatchDagGraph from './RewatchDagGraph';
import RewatchRoadmap from './RewatchRoadmap';
import { getRewatchOrder, updateMovie } from '../../api/movies';
import { formatRuntime, formatYear } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';
import { parseApiError } from '../../utils/errorHandlers';

export default function RewatchGraphModal({
  isOpen,
  onClose,
  targetMovie = null, // The movie object that was clicked
  allMovies = [], // Full movie catalog
  onMovieStatusUpdated, // Callback to update parent movies list if status changes
}) {
  const toast = useToast();

  const [rewatchData, setRewatchData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState('dag'); // 'dag' | 'roadmap'

  // Fetch topological rewatch order from backend
  const fetchOrder = useCallback(async (movieId) => {
    if (!movieId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRewatchOrder(movieId);
      setRewatchData(data);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && targetMovie) {
      fetchOrder(targetMovie.id);
    } else {
      setRewatchData(null);
      setError(null);
    }
  }, [isOpen, targetMovie, fetchOrder]);

  // Handle toggling watched status directly in the graph
  const handleToggleWatched = async (movieId, currentStatus) => {
    setIsUpdating(true);
    const newStatus = !currentStatus;

    // Optimistically update local rewatchData
    if (rewatchData) {
      const updatedMovies = rewatchData.movies.map((m) =>
        m.id === movieId ? { ...m, watched: newStatus } : m
      );
      const watchedCount = updatedMovies.filter((m) => m.watched).length;
      const unwatchedCount = updatedMovies.length - watchedCount;
      const unwatchedRuntime = updatedMovies
        .filter((m) => !m.watched)
        .reduce((sum, m) => sum + (m.runtime || 0), 0);

      setRewatchData({
        ...rewatchData,
        movies: updatedMovies,
        summary: {
          ...rewatchData.summary,
          watched_count: watchedCount,
          unwatched_count: unwatchedCount,
          unwatched_runtime: unwatchedRuntime,
        },
      });
    }

    try {
      await updateMovie(movieId, { watched: newStatus });
      toast.success(newStatus ? 'Marked as watched' : 'Marked as unwatched');
      onMovieStatusUpdated?.(movieId, newStatus);
      // Re-fetch to guarantee backend consistency
      fetchOrder(targetMovie.id);
    } catch (err) {
      toast.error(parseApiError(err));
      fetchOrder(targetMovie.id);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !targetMovie) return null;

  const totalPrereqs = rewatchData?.summary?.total_movies || 0;
  const watchedCount = rewatchData?.summary?.watched_count || 0;
  const unwatchedCount = rewatchData?.summary?.unwatched_count || 0;
  const unwatchedRuntime = rewatchData?.summary?.unwatched_runtime || 0;
  const progressPercent =
    totalPrereqs > 0 ? Math.round((watchedCount / totalPrereqs) * 100) : 100;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-5xl bg-card rounded-2xl border border-charcoal-200 shadow-modal z-10 flex flex-col my-auto max-h-[92vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:px-6 border-b border-charcoal-200 bg-white">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="primary" size="sm">
                  MCU Rewatch Planner
                </Badge>
                <span className="text-xs text-charcoal-400">•</span>
                <span className="text-xs text-charcoal-500 font-medium">
                  {formatYear(targetMovie.release_year)} • {formatRuntime(targetMovie.runtime)}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 tracking-tight">
                {targetMovie.title}
              </h2>
            </div>

            {/* View Switcher & Close */}
            <div className="flex items-center gap-2.5 self-end sm:self-center">
              {totalPrereqs > 0 && (
                <div className="inline-flex rounded-lg border border-charcoal-200 bg-charcoal-100 p-0.5 text-xs shadow-subtle">
                  <button
                    type="button"
                    onClick={() => setViewMode('dag')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                      viewMode === 'dag'
                        ? 'bg-white text-charcoal-900 shadow-subtle'
                        : 'text-charcoal-600 hover:text-charcoal-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>DAG Graph</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('roadmap')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                      viewMode === 'roadmap'
                        ? 'bg-white text-charcoal-900 shadow-subtle'
                        : 'text-charcoal-600 hover:text-charcoal-900'
                    }`}
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span>Roadmap Flow</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-100 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-5 bg-charcoal-50/20">
            {isLoading ? (
              <Loading message="Calculating prerequisite dependency graph..." />
            ) : error ? (
              <ErrorState
                title="Could not load rewatch graph"
                message={error}
                onRetry={() => fetchOrder(targetMovie.id)}
              />
            ) : totalPrereqs === 0 ? (
              /* Zero Prerequisites Celebratory State */
              <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-xl border border-charcoal-200 bg-white shadow-card my-2">
                <div className="p-4 rounded-full bg-status-successBg text-status-success mb-4 shadow-subtle">
                  <Sparkles className="w-8 h-8 stroke-[2]" />
                </div>
                <h3 className="text-xl font-bold text-charcoal-900 mb-2">
                  You're all caught up!
                </h3>
                <p className="text-sm text-charcoal-600 max-w-md mb-6 leading-relaxed">
                  No prerequisite movies are needed before <strong>{targetMovie.title}</strong>. You can watch this movie directly with zero background viewing required!
                </p>
                <Button variant="outline" size="md" onClick={onClose}>
                  Back to Movies
                </Button>
              </div>
            ) : (
              <>
                {/* Summary Metrics Bar */}
                <div className="bg-white border border-charcoal-200 rounded-xl p-4 sm:p-5 shadow-card flex flex-col gap-4">
                  {/* Progress Line */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="text-charcoal-500 uppercase tracking-wider">
                        Prerequisite Watch Progress
                      </span>
                      <span className="text-charcoal-900">
                        {watchedCount} of {totalPrereqs} completed ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-charcoal-100 rounded-full overflow-hidden">
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

                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-charcoal-100">
                    <div className="p-2.5 rounded-lg bg-charcoal-50/80 border border-charcoal-200/60">
                      <span className="text-[11px] font-medium text-charcoal-400 block mb-0.5">
                        Total Prereqs
                      </span>
                      <span className="text-lg font-bold text-charcoal-900">
                        {totalPrereqs} movies
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-status-successBg/40 border border-status-success/20">
                      <span className="text-[11px] font-medium text-status-success block mb-0.5">
                        Watched
                      </span>
                      <span className="text-lg font-bold text-status-success">
                        {watchedCount} completed
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-charcoal-50/80 border border-charcoal-200/60">
                      <span className="text-[11px] font-medium text-charcoal-400 block mb-0.5">
                        Remaining
                      </span>
                      <span className="text-lg font-bold text-charcoal-700">
                        {unwatchedCount} to watch
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-primary-light/40 border border-primary/20">
                      <span className="text-[11px] font-medium text-primary block mb-0.5">
                        Time Remaining
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {formatRuntime(unwatchedRuntime)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Graph / Roadmap Visualizer */}
                {viewMode === 'dag' ? (
                  <RewatchDagGraph
                    movies={rewatchData.movies}
                    targetMovie={targetMovie}
                    allMovies={allMovies}
                    onToggleWatched={handleToggleWatched}
                    isUpdating={isUpdating}
                  />
                ) : (
                  <RewatchRoadmap
                    movies={rewatchData.movies}
                    targetMovie={targetMovie}
                    onToggleWatched={handleToggleWatched}
                    isUpdating={isUpdating}
                  />
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
