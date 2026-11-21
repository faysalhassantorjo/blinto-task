/**
 * Parses and formats backend API error responses into clean, user-friendly messages.
 */
export function parseApiError(error) {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Network error or server not running
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return 'Unable to connect to the server. Please check your network and make sure the backend is running.';
  }

  const { status, data } = error.response;

  // Handle circular dependency (HTTP 409 or explicit error code)
  if (
    status === 409 ||
    data?.code === 'CIRCULAR_DEPENDENCY' ||
    data?.error === 'CIRCULAR_DEPENDENCY' ||
    (typeof data?.detail === 'string' && data.detail.toLowerCase().includes('circular dependency'))
  ) {
    return 'This movie relationship creates a circular dependency. Please review your prerequisite selections.';
  }

  // Backend error format: { error: "CODE", message: "..." }
  if (data?.message) {
    return data.message;
  }

  // DRF detail format: { detail: "..." }
  if (data?.detail) {
    if (typeof data.detail === 'string') {
      return data.detail;
    }
  }

  // DRF field-specific validation errors: { fieldName: ["error message"] }
  if (typeof data === 'object' && data !== null) {
    const errorMessages = [];
    for (const [key, val] of Object.entries(data)) {
      if (Array.isArray(val)) {
        errorMessages.push(`${capitalize(key)}: ${val.join(' ')}`);
      } else if (typeof val === 'string') {
        errorMessages.push(`${capitalize(key)}: ${val}`);
      }
    }
    if (errorMessages.length > 0) {
      return errorMessages.join(' ');
    }
  }

  if (status === 404) {
    return 'The requested resource was not found.';
  }

  if (status >= 500) {
    return 'A server error occurred. Please try again later.';
  }

  return error.message || 'Something went wrong. Please try again.';
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}
