import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Film, 
  Plus, 
  Search, 
  SlidersHorizontal,
  Network
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { CardSkeletonList } from '../components/common/Loading';
import MovieCard from '../components/movies/MovieCard';
import MovieForm from '../components/movies/MovieForm';
import RewatchGraphModal from '../components/rewatch/RewatchGraphModal';
import { useMovies } from '../hooks/useMovies';
import { deleteMovie } from '../api/movies';
import { useToast } from '../hooks/useToast';
import { parseApiError } from '../utils/errorHandlers';

export default function Movies() {
  const { movies, setMovies, isLoading, error, refetch, toggleWatched } = useMovies();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'watched' | 'unwatched'
  const [sortBy, setSortBy] = useState('year-asc');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null); // Movie being edited
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Rewatch Graph Modal state
  const [graphTargetMovie, setGraphTargetMovie] = useState(null);

  // Auto-open graph modal if ?target=ID or ?graph=ID is in URL
  useEffect(() => {
    const targetId = searchParams.get('target') || searchParams.get('graph');
    if (targetId && movies.length > 0) {
      const found = movies.find((m) => m.id === Number(targetId));
      if (found) {
        setGraphTargetMovie(found);
      }
    }
  }, [searchParams, movies]);

  // Filter and sort movies
  const filteredAndSortedMovies = useMemo(() => {
    return movies
      .filter((movie) => {
        const matchesSearch = movie.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim());

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'watched' && movie.watched) ||
          (statusFilter === 'unwatched' && !movie.watched);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'year-asc':
            return a.release_year - b.release_year;
          case 'year-desc':
            return b.release_year - a.release_year;
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'title-desc':
            return b.title.localeCompare(a.title);
          case 'runtime-desc':
            return b.runtime - a.runtime;
          case 'runtime-asc':
            return a.runtime - b.runtime;
          default:
            return 0;
        }
      });
  }, [movies, searchQuery, statusFilter, sortBy]);

  const handleOpenAdd = () => {
    setSelectedMovie(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (movie) => {
    setSelectedMovie(movie);
    setIsFormOpen(true);
  };

  const handleOpenGraph = (movie) => {
    setGraphTargetMovie(movie);
  };

  const handleCloseGraph = () => {
    setGraphTargetMovie(null);
    // Clear URL query param if present
    if (searchParams.get('target') || searchParams.get('graph')) {
      setSearchParams({});
    }
  };

  const handleDeleteConfirm = async () => {
    if (!movieToDelete) return;
    setIsDeleting(true);
    try {
      await deleteMovie(movieToDelete.id);
      toast.success(`Deleted "${movieToDelete.title}"`);
      setMovieToDelete(null);
      refetch();
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // Sync status changes made inside the graph modal back to the main list
  const handleMovieStatusUpdated = (movieId, newStatus) => {
    setMovies((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, watched: newStatus } : m))
    );
  };

  const totalCount = movies.length;
  const watchedCount = movies.filter((m) => m.watched).length;

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-charcoal-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal-900">
              MCU Movie Library
            </h1>
            <Badge variant="primary" size="sm" icon={Network}>
              Click card to view Graph
            </Badge>
          </div>
          <p className="text-sm text-charcoal-500">
            Click on any movie card to inspect its prerequisite DAG rewatch graph and viewing roadmap.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={handleOpenAdd}
          className="self-start sm:self-auto"
        >
          Add Movie
        </Button>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies by title..."
            className="w-full bg-white border border-charcoal-200 rounded-lg pl-9 pr-3 py-1.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-subtle"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="inline-flex rounded-lg border border-charcoal-200 bg-white p-0.5 text-xs shadow-subtle">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-charcoal-100 text-charcoal-900 font-semibold'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('watched')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'watched'
                  ? 'bg-status-successBg text-status-success font-semibold'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              Watched ({watchedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('unwatched')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'unwatched'
                  ? 'bg-charcoal-100 text-charcoal-900 font-semibold'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              Unwatched ({totalCount - watchedCount})
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-charcoal-200 rounded-lg px-2.5 py-1 text-xs text-charcoal-700 shadow-subtle">
            <SlidersHorizontal className="w-3.5 h-3.5 text-charcoal-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-medium"
            >
              <option value="year-asc">Release: Oldest First</option>
              <option value="year-desc">Release: Newest First</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
              <option value="runtime-desc">Runtime: Longest</option>
              <option value="runtime-asc">Runtime: Shortest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content State */}
      {isLoading ? (
        <CardSkeletonList count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : totalCount === 0 ? (
        <EmptyState
          icon={Film}
          title="No movies in your catalog"
          description="Build your MCU library by adding your first movie and setting up its prerequisite story connections."
          actionLabel="Add Movie"
          onAction={handleOpenAdd}
        />
      ) : filteredAndSortedMovies.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching movies found"
          description={`No movies matched "${searchQuery}" with the current filter settings.`}
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setStatusFilter('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              allMovies={movies}
              onEdit={handleOpenEdit}
              onDelete={setMovieToDelete}
              onToggleWatched={toggleWatched}
              onOpenGraph={handleOpenGraph}
            />
          ))}
        </div>
      )}

      {/* Rewatch DAG Graph Modal */}
      <RewatchGraphModal
        isOpen={Boolean(graphTargetMovie)}
        onClose={handleCloseGraph}
        targetMovie={graphTargetMovie}
        allMovies={movies}
        onMovieStatusUpdated={handleMovieStatusUpdated}
      />

      {/* Add / Edit Form Modal */}
      <MovieForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        movie={selectedMovie}
        availableMovies={movies}
        onSuccess={refetch}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(movieToDelete)}
        onClose={() => setMovieToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${movieToDelete?.title}"?`}
        description="Are you sure you want to delete this movie? This will also remove it from any other movies that list it as a prerequisite. This action cannot be undone."
        confirmText="Delete Movie"
        isLoading={isDeleting}
      />
    </PageContainer>
  );
}
