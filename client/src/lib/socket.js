import { io } from 'socket.io-client';

// Get the server URL from environment or use default
const getSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) return apiUrl;
    
    // If in production and no URL, use same-origin
    if (import.meta.env.PROD) return '';
    
    return 'http://localhost:5001';
};

const SOCKET_URL = getSocketUrl();

// Create socket instance
let socket = null;

// Initialize socket connection
export const initSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            withCredentials: true,
            autoConnect: import.meta.env.DEV, // Only auto-connect in development
            reconnection: import.meta.env.DEV,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('🔌 Socket connected:', socket.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
            console.log('🔌 Socket connection error:', error.message);
        });
    }
    return socket;
};

// Get existing socket instance
export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Event types for consistency (matching server)
export const SOCKET_EVENTS = {
    // Product events
    PRODUCT_CREATED: 'product:created',
    PRODUCT_UPDATED: 'product:updated',
    PRODUCT_DELETED: 'product:deleted',
    
    // Category events
    CATEGORY_CREATED: 'category:created',
    CATEGORY_UPDATED: 'category:updated',
    CATEGORY_DELETED: 'category:deleted',
    
    // Order events
    ORDER_CREATED: 'order:created',
    ORDER_UPDATED: 'order:updated',
    
    // Cart events
    CART_UPDATED: 'cart:updated',
    
    // Stock events
    STOCK_UPDATED: 'stock:updated',
    
    // General refresh
    REFRESH_PRODUCTS: 'refresh:products',
    REFRESH_CATEGORIES: 'refresh:categories',
    REFRESH_ORDERS: 'refresh:orders'
};

// Subscribe to an event
export const subscribeToEvent = (event, callback) => {
    const sock = getSocket();
    sock.on(event, callback);
    return () => sock.off(event, callback);
};

// Subscribe to product updates
export const subscribeToProductUpdates = (callback) => {
    const sock = getSocket();
    
    const handleRefresh = (data) => {
        console.log('📦 Product update received:', data);
        callback(data);
    };
    
    sock.on(SOCKET_EVENTS.REFRESH_PRODUCTS, handleRefresh);
    sock.on(SOCKET_EVENTS.PRODUCT_CREATED, handleRefresh);
    sock.on(SOCKET_EVENTS.PRODUCT_UPDATED, handleRefresh);
    sock.on(SOCKET_EVENTS.PRODUCT_DELETED, handleRefresh);
    
    return () => {
        sock.off(SOCKET_EVENTS.REFRESH_PRODUCTS, handleRefresh);
        sock.off(SOCKET_EVENTS.PRODUCT_CREATED, handleRefresh);
        sock.off(SOCKET_EVENTS.PRODUCT_UPDATED, handleRefresh);
        sock.off(SOCKET_EVENTS.PRODUCT_DELETED, handleRefresh);
    };
};

// Subscribe to category updates
export const subscribeToCategoryUpdates = (callback) => {
    const sock = getSocket();
    
    const handleRefresh = (data) => {
        console.log('📁 Category update received:', data);
        callback(data);
    };
    
    sock.on(SOCKET_EVENTS.REFRESH_CATEGORIES, handleRefresh);
    sock.on(SOCKET_EVENTS.CATEGORY_CREATED, handleRefresh);
    sock.on(SOCKET_EVENTS.CATEGORY_UPDATED, handleRefresh);
    sock.on(SOCKET_EVENTS.CATEGORY_DELETED, handleRefresh);
    
    return () => {
        sock.off(SOCKET_EVENTS.REFRESH_CATEGORIES, handleRefresh);
        sock.off(SOCKET_EVENTS.CATEGORY_CREATED, handleRefresh);
        sock.off(SOCKET_EVENTS.CATEGORY_UPDATED, handleRefresh);
        sock.off(SOCKET_EVENTS.CATEGORY_DELETED, handleRefresh);
    };
};

// Subscribe to order updates
export const subscribeToOrderUpdates = (callback) => {
    const sock = getSocket();
    
    const handleRefresh = (data) => {
        console.log('📋 Order update received:', data);
        callback(data);
    };
    
    sock.on(SOCKET_EVENTS.REFRESH_ORDERS, handleRefresh);
    sock.on(SOCKET_EVENTS.ORDER_CREATED, handleRefresh);
    sock.on(SOCKET_EVENTS.ORDER_UPDATED, handleRefresh);
    
    return () => {
        sock.off(SOCKET_EVENTS.REFRESH_ORDERS, handleRefresh);
        sock.off(SOCKET_EVENTS.ORDER_CREATED, handleRefresh);
        sock.off(SOCKET_EVENTS.ORDER_UPDATED, handleRefresh);
    };
};

export default socket;
