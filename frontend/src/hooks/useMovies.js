import { useState, useEffect, useCallback } from 'react';
import { getMovies, updateMovie } from '../api/movies';
import { useToast } from './useToast';
import { parseApiError } from '../utils/errorHandlers';

export function useMovies() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMovies();
      setMovies(data);
    } catch (err) {
      const errorMsg = parseApiError(err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Optimistic/reactive toggle watched status
  const toggleWatched = useCallback(async (movieId, currentStatus) => {
    const newStatus = !currentStatus;
    // Optimistically update local state
    setMovies((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, watched: newStatus } : m))
    );

    try {
      const updated = await updateMovie(movieId, { watched: newStatus });
      setMovies((prev) =>
        prev.map((m) => (m.id === movieId ? updated : m))
      );
      toast.success(
        newStatus ? 'Marked as watched' : 'Marked as unwatched'
      );
      return updated;
    } catch (err) {
      // Revert optimistic update on error
      setMovies((prev) =>
        prev.map((m) => (m.id === movieId ? { ...m, watched: currentStatus } : m))
      );
      toast.error(parseApiError(err));
      throw err;
    }
  }, [toast]);

  return {
    movies,
    setMovies,
    isLoading,
    error,
    refetch: fetchMovies,
    toggleWatched,
  };
}
