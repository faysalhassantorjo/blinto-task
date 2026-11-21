import apiClient from './client';

/**
 * Fetch all movies with their details and prerequisites.
 */
export async function getMovies() {
  const response = await apiClient.get('/movies/');
  return response.data;
}

/**
 * Fetch a single movie by its ID.
 */
export async function getMovie(id) {
  const response = await apiClient.get(`/movies/${id}/`);
  return response.data;
}

/**
 * Create a new movie.
 * @param {Object} data - { title, release_year, runtime, prerequisites, watched }
 */
export async function createMovie(data) {
  const response = await apiClient.post('/movies/', data);
  return response.data;
}

/**
 * Partially update a movie.
 * @param {number} id - Movie ID
 * @param {Object} data - fields to update
 */
export async function updateMovie(id, data) {
  const response = await apiClient.patch(`/movies/${id}/`, data);
  return response.data;
}

/**
 * Delete a movie by ID.
 * @param {number} id - Movie ID
 */
export async function deleteMovie(id) {
  const response = await apiClient.delete(`/movies/${id}/`);
  return response.data;
}

/**
 * Fetch the topological rewatch order and summary for a target movie.
 * @param {number} id - Movie ID
 */
export async function getRewatchOrder(id) {
  const response = await apiClient.get(`/movies/${id}/rewatch-order/`);
  return response.data;
}
