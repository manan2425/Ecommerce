import api from '@/lib/api';
import { store } from '@/store/store';

/**
 * Log user activities (login, product view, etc.)
 * @param {string} activityType - Type of activity (login, product_view, product_add_to_cart, product_purchase)
 * @param {string} productId - Optional product ID
 * @param {object} details - Optional additional details
 */
export const logActivity = async (activityType, productId = null, details = null) => {
  try {
    // Get user ID from Redux auth state
    const state = store.getState();
    const userId = state?.auth?.user?.id || state?.auth?.user?._id;

    if (!userId) {
      console.log('No user ID found for activity logging');
      return null;
    }

    const payload = {
      userId,
      activityType,
      productId,
      details
    };

    // Log activity using api client
    const response = await api.post('/admin/analytics/log-activity', payload);

    return response.data;
  } catch (error) {
    console.log('Error logging activity:', error);
    // Don't throw - activity logging should not break functionality
    return null;
  }
};

/**
 * Log product view
 */
export const logProductView = (productId) => {
  return logActivity('product_view', productId);
};

/**
 * Log product add to cart
 */
export const logProductAddToCart = (productId) => {
  return logActivity('product_add_to_cart', productId);
};

/**
 * Log product purchase
 */
export const logProductPurchase = (productId, quantity) => {
  return logActivity('product_purchase', productId, { quantity });
};

/**
 * Log user login
 */
export const logUserLogin = () => {
  return logActivity('login');
};

/**
 * Log user logout
 */
export const logUserLogout = () => {
  return logActivity('logout');
};
