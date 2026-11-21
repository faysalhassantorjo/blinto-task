import apiClient from './client';

/**
 * Request minimum-bundle quote calculation from backend DP algorithm.
 * @param {number} cinemaId - Cinema ID
 * @param {number} groupSize - Number of attendees (1 - 10000)
 */
export async function getBookingQuote(cinemaId, groupSize) {
  const response = await apiClient.post(`/cinemas/${cinemaId}/quote/`, {
    group_size: Number(groupSize),
  });
  return response.data;
}
