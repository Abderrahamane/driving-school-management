// frontend/src/hooks/useFetch.js
'use client';

import { useState, useEffect, useCallback } from 'react';

export const useFetch = (fetchFn, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching data...'); // Debug log
            const response = await fetchFn();
            console.log('Response received:', response); // Debug log

            // Ensure response has the expected structure
            if (response && response.data) {
                setData(response.data);
            } else {
                console.warn('Unexpected response structure:', response);
                setData(null);
            }
        } catch (err) {
            console.error('Fetch error:', err); // Debug log

            // Better error message extraction
            let errorMessage = 'An error occurred';

            if (err.response) {
                // Server responded with error
                errorMessage = err.response.data?.error ||
                              err.response.data?.message ||
                              `Server error: ${err.response.status}`;
            } else if (err.request) {
                // Request made but no response
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                // Error setting up request
                errorMessage = err.message || 'Request failed';
            }

            setError(errorMessage);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [fetchFn]);

    useEffect(() => {
        refetch();
    }, dependencies);

    return { data, loading, error, refetch };
};