import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { 
    initSocket, 
    subscribeToProductUpdates, 
    subscribeToCategoryUpdates,
    subscribeToOrderUpdates,
    disconnectSocket 
} from '@/lib/socket';
import { fetchAllFilteredProducts } from '@/store/shop/products-slice';
import { fetchShopCategories } from '@/store/shop/category-slice';

/**
 * Hook to subscribe to real-time product updates
 * Automatically refreshes product list when changes occur
 */
export const useRealtimeProducts = (filters = {}, sortBy = 'price-lowtohigh') => {
    const dispatch = useDispatch();
    const isSubscribed = useRef(false);

    useEffect(() => {
        // Initialize socket connection
        initSocket();

        if (!isSubscribed.current) {
            isSubscribed.current = true;

            // Subscribe to product updates
            const unsubscribe = subscribeToProductUpdates((data) => {
                console.log('🔄 Refreshing products due to update:', data);
                // Refresh products when update received
                dispatch(fetchAllFilteredProducts({ 
                    filterParams: filters, 
                    sortParams: sortBy 
                }));
            });

            return () => {
                unsubscribe();
                isSubscribed.current = false;
            };
        }
    }, [dispatch, filters, sortBy]);
};

/**
 * Hook to subscribe to real-time category updates
 * Automatically refreshes category list when changes occur
 */
export const useRealtimeCategories = () => {
    const dispatch = useDispatch();
    const isSubscribed = useRef(false);

    useEffect(() => {
        // Initialize socket connection
        initSocket();

        if (!isSubscribed.current) {
            isSubscribed.current = true;

            // Subscribe to category updates
            const unsubscribe = subscribeToCategoryUpdates((data) => {
                console.log('🔄 Refreshing categories due to update:', data);
                // Refresh categories when update received
                dispatch(fetchShopCategories());
            });

            return () => {
                unsubscribe();
                isSubscribed.current = false;
            };
        }
    }, [dispatch]);
};

/**
 * Hook to subscribe to real-time order updates
 * Can be used in admin panel to refresh orders
 */
export const useRealtimeOrders = (onUpdate) => {
    const isSubscribed = useRef(false);

    useEffect(() => {
        // Initialize socket connection
        initSocket();

        if (!isSubscribed.current) {
            isSubscribed.current = true;

            // Subscribe to order updates
            const unsubscribe = subscribeToOrderUpdates((data) => {
                console.log('🔄 Order update received:', data);
                if (onUpdate) {
                    onUpdate(data);
                }
            });

            return () => {
                unsubscribe();
                isSubscribed.current = false;
            };
        }
    }, [onUpdate]);
};

/**
 * Hook to initialize and manage socket connection
 * Use this in App.jsx to maintain socket connection
 */
export const useSocketConnection = () => {
    useEffect(() => {
        const socket = initSocket();
        
        return () => {
            // Optional: disconnect on app unmount
            // disconnectSocket();
        };
    }, []);
};

export default useRealtimeProducts;
