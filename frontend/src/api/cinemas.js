import apiClient from './client';

/**
 * Fetch all cinemas with their bundle sizes.
 */
export async function getCinemas() {
  const response = await apiClient.get('/cinemas/');
  return response.data;
}

/**
 * Fetch a single cinema by ID.
 */
export async function getCinema(id) {
  const response = await apiClient.get(`/cinemas/${id}/`);
  return response.data;
}

/**
 * Create a new cinema.
 * @param {Object} data - { name: string, bundle_sizes: number[] }
 */
export async function createCinema(data) {
  const response = await apiClient.post('/cinemas/', data);
  return response.data;
}

/**
 * Update an existing cinema.
 * @param {number} id - Cinema ID
 * @param {Object} data - { name?: string, bundle_sizes?: number[] }
 */
export async function updateCinema(id, data) {
  const response = await apiClient.patch(`/cinemas/${id}/`, data);
  return response.data;
}

/**
 * Delete a cinema by ID.
 * @param {number} id - Cinema ID
 */
export async function deleteCinema(id) {
  const response = await apiClient.delete(`/cinemas/${id}/`);
  return response.data;
}
