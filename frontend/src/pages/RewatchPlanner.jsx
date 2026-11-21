import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Compass, CheckCircle2, Film, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import RewatchSummary from '../components/rewatch/RewatchSummary';
import RewatchTimeline from '../components/rewatch/RewatchTimeline';
import { getMovies, getRewatchOrder, updateMovie } from '../api/movies';
import { useToast } from '../hooks/useToast';
import { parseApiError } from '../utils/errorHandlers';

export default function RewatchPlanner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const targetParam = searchParams.get('target');
  const toast = useToast();

  const [moviesList, setMoviesList] = useState([]);
  const [isMoviesLoading, setIsMoviesLoading] = useState(true);
  const [moviesError, setMoviesError] = useState(null);

  const [selectedTargetId, setSelectedTargetId] = useState(targetParam ? Number(targetParam) : null);
  const [rewatchData, setRewatchData] = useState(null);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Load all movies for the selector
  useEffect(() => {
    async function loadMovies() {
      setIsMoviesLoading(true);
      try {
        const data = await getMovies();
        setMoviesList(data);
        // If no target query param and we have movies, default to the last movie or one with prereqs
        if (!targetParam && data.length > 0) {
          const withPrereqs = data.find((m) => m.prerequisites && m.prerequisites.length > 0);
          setSelectedTargetId(withPrereqs ? withPrereqs.id : data[0].id);
        }
      } catch (err) {
        setMoviesError(parseApiError(err));
      } finally {
        setIsMoviesLoading(false);
      }
    }
    loadMovies();
  }, [targetParam]);

  // Sync state if URL query param changes
  useEffect(() => {
    if (targetParam) {
      setSelectedTargetId(Number(targetParam));
    }
  }, [targetParam]);

  // Fetch rewatch order for selected target movie
  const fetchRewatchOrder = useCallback(async (targetId) => {
    if (!targetId) {
      setRewatchData(null);
      return;
    }
    setIsOrderLoading(true);
    setOrderError(null);
    try {
      const data = await getRewatchOrder(targetId);
      setRewatchData(data);
    } catch (err) {
      setOrderError(parseApiError(err));
    } finally {
      setIsOrderLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTargetId) {
      fetchRewatchOrder(selectedTargetId);
    }
  }, [selectedTargetId, fetchRewatchOrder]);

  // Handle target change
  const handleSelectTarget = (id) => {
    const numId = Number(id);
    setSelectedTargetId(numId);
    setSearchParams({ target: String(numId) });
  };

  // Handle toggle watched
  const handleToggleWatched = async (movieId, currentStatus) => {
    setIsUpdatingStatus(true);
    const newStatus = !currentStatus;

    // Optimistically update the list in rewatchData
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
      // Re-fetch from backend to guarantee exact backend consistency
      fetchRewatchOrder(selectedTargetId);
    } catch (err) {
      toast.error(parseApiError(err));
      // Revert by re-fetching
      fetchRewatchOrder(selectedTargetId);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const selectedMovieObj = moviesList.find((m) => m.id === selectedTargetId);

  return (
    <PageContainer>
      {/* Header */}
      <div className="pb-6 border-b border-charcoal-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal-900">
          Your MCU Rewatch Plan
        </h1>
        <p className="mt-1 text-sm text-charcoal-500">
          Everything you need to watch before the big day.
        </p>
      </div>

      {/* Target Selector Bar */}
      <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:max-w-lg">
          <label
            htmlFor="target-movie-select"
            className="text-xs font-semibold uppercase tracking-wider text-charcoal-700 shrink-0"
          >
            Target Movie:
          </label>
          <div className="relative w-full">
            <select
              id="target-movie-select"
              value={selectedTargetId || ''}
              onChange={(e) => handleSelectTarget(e.target.value)}
              disabled={isMoviesLoading || moviesList.length === 0}
              className="w-full bg-white border border-charcoal-200 rounded-lg px-3.5 py-2 text-sm font-medium text-charcoal-900 shadow-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer disabled:bg-charcoal-50 disabled:text-charcoal-400"
            >
              {moviesList.length === 0 ? (
                <option value="">No movies found in catalog</option>
              ) : (
                moviesList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.release_year})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <Link
          to="/movies"
          className="text-xs font-semibold text-charcoal-600 hover:text-primary transition-colors flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Manage movies & prerequisites</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* Main Rewatch Order Content */}
      {isMoviesLoading ? (
        <Loading message="Loading MCU movies catalog..." />
      ) : moviesError ? (
        <ErrorState message={moviesError} onRetry={() => window.location.reload()} />
      ) : moviesList.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No movies found"
          description="You need to add movies to your catalog before you can build a rewatch plan."
          actionLabel="Add Movies"
          onAction={() => (window.location.href = '/movies')}
        />
      ) : isOrderLoading ? (
        <Loading message="Calculating prerequisite graph..." />
      ) : orderError ? (
        <ErrorState
          title="Could not load rewatch plan"
          message={orderError}
          onRetry={() => fetchRewatchOrder(selectedTargetId)}
        />
      ) : !rewatchData ? null : rewatchData.movies.length === 0 ? (
        /* Empty State when selected movie has no prerequisites */
        <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-xl border border-charcoal-200 bg-card shadow-card my-4">
          <div className="p-4 rounded-full bg-status-successBg text-status-success mb-4 shadow-subtle">
            <Sparkles className="w-8 h-8 stroke-[2]" />
          </div>
          <h3 className="text-lg font-bold text-charcoal-900 mb-2">
            You're all caught up!
          </h3>
          <p className="text-sm text-charcoal-600 max-w-md mb-6 leading-relaxed">
            No prerequisite movies are needed before <strong>{selectedMovieObj?.title}</strong>. You can watch this movie directly!
          </p>
          <div className="flex items-center gap-3">
            <Link to="/cinemas">
              <Button variant="primary" size="md">
                Plan Opening Night Party
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Rewatch Order Results */
        <div className="flex flex-col gap-6">
          {/* Summary Section */}
          <RewatchSummary
            summary={rewatchData.summary}
            targetTitle={rewatchData.target?.title || selectedMovieObj?.title}
          />

          {/* Timeline Section */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-charcoal-500">
                Topological Watch Sequence
              </h3>
              <span className="text-xs text-charcoal-400">
                {rewatchData.movies.length} {rewatchData.movies.length === 1 ? 'film' : 'films'} to watch in order
              </span>
            </div>

            <RewatchTimeline
              movies={rewatchData.movies}
              targetMovie={rewatchData.target || selectedMovieObj}
              onToggleWatched={handleToggleWatched}
              isUpdating={isUpdatingStatus}
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
