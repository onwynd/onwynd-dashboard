/**
 * Standardized API response parsing utility
 * Handles different response formats from the backend API
 */

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status?: number;
  success?: boolean;
}

/**
 * Extracts the actual data from an API response
 * Handles both nested data format ({ data: { data: T } }) and flat format ({ data: T })
 * 
 * @param response - The API response object
 * @returns The extracted data or the response itself if no nested data found
 */
export function parseApiResponse<T>(response: any): T {
  // If response is already the data we want, return it
  if (!response || typeof response !== 'object') {
    return response;
  }

  // Check for nested data structure: response.data.data
  if (response.data && response.data.data !== undefined) {
    return response.data.data;
  }

  // Check for flat data structure: response.data
  if (response.data !== undefined) {
    return response.data;
  }

  // If no data property found, return the response as-is
  return response;
}

/**
 * Extracts error message from API error response
 * Handles different error response formats
 * 
 * @param error - The error object
 * @returns The extracted error message
 */
export function parseApiError(error: any): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  // Handle axios error responses
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.response?.data?.errors) {
    if (Array.isArray(error.response.data.errors)) {
      return error.response.data.errors.join(', ');
    }
    return String(error.response.data.errors);
  }

  // Handle direct error messages
  if (error.message) {
    return error.message;
  }

  // Fallback to string conversion
  return String(error);
}

/**
 * Type-safe wrapper for API responses
 * Ensures consistent typing across the application
 */
export function createApiResponse<T>(data: T, message?: string, status = 200): ApiResponse<T> {
  return {
    data,
    message: message || 'Success',
    status,
    success: status >= 200 && status < 300,
  };
}