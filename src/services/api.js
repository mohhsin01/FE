import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get seller summary by ID
 * @param {number} sellerId - The seller ID
 * @returns {Promise} API response with seller summary data
 */
export const getSellerSummary = async (sellerId) => {
  try {
    const response = await api.get(`/seller/${sellerId}/summary`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        error: error.response.data.error || 'Server error',
        message: error.response.data.message || 'An error occurred',
        status: error.response.status,
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        success: false,
        error: 'Network error',
        message: 'Unable to connect to the server. Please check if the backend is running.',
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: 'Error',
        message: error.message || 'An unexpected error occurred',
      };
    }
  }
};

/**
 * Get list of all sellers
 * @returns {Promise} API response with sellers list
 */
export const getSellers = async () => {
  try {
    // TODO: Update this endpoint when backend adds /api/sellers endpoint
    const response = await api.get('/sellers');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    // If endpoint doesn't exist, return empty array (frontend can work with hardcoded list)
    return {
      success: false,
      error: 'Sellers endpoint not available',
      data: [],
    };
  }
};

/**
 * Check backend health
 * @returns {Promise} API response
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Backend not available',
      message: 'Cannot connect to backend server',
    };
  }
};

export default api;

