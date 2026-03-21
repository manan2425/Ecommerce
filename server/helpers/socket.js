// Socket.io instance holder
let io = null;

export const setIO = (ioInstance) => {
    io = ioInstance;
};

export const getIO = () => {
    return io;
};

// Emit events for real-time updates
export const emitEvent = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

// Event types for consistency
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
    
    // Service events
    SERVICE_CREATED: 'service:created',
    SERVICE_UPDATED: 'service:updated',
    SERVICE_DELETED: 'service:deleted',
    
    // User events
    USER_UPDATED: 'user:updated',
    USER_DELETED: 'user:deleted',
    
    // Cart events
    CART_UPDATED: 'cart:updated',
    
    // Stock events
    STOCK_UPDATED: 'stock:updated',
    
    // General refresh
    REFRESH_PRODUCTS: 'refresh:products',
    REFRESH_CATEGORIES: 'refresh:categories',
    REFRESH_ORDERS: 'refresh:orders',
    REFRESH_SERVICES: 'refresh:services',
    REFRESH_USERS: 'refresh:users'
};
