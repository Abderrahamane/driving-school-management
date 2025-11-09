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
            setData(response.data);
        } catch (err) {
            console.error('Fetch error:', err); // Debug log
            const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
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