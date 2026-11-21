import { useState, useEffect, useCallback } from 'react';
import { getCinemas } from '../api/cinemas';
import { parseApiError } from '../utils/errorHandlers';

export function useCinemas() {
  const [cinemas, setCinemas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCinemas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCinemas();
      setCinemas(data);
    } catch (err) {
      const errorMsg = parseApiError(err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCinemas();
  }, [fetchCinemas]);

  return {
    cinemas,
    setCinemas,
    isLoading,
    error,
    refetch: fetchCinemas,
  };
}
