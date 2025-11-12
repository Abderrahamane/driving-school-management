'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, clearAuth, redirectByRole } from '@/lib/auth';
import { authAPI } from '@/lib/api';

export const useAuth = (requireAuth = false, allowedRoles = []) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const auth = getAuth();

            if (!auth) {
                if (requireAuth) {
                    router.push('/login');
                }
                setLoading(false);
                return;
            }

            try {
                const response = await authAPI.getMe();
                const userData = response.data.data;
                setUser(userData);

                if (allowedRoles.length > 0 && !allowedRoles.includes(userData.role)) {
                    router.push(redirectByRole(userData.role));
                    return;
                }
            } catch (error) {
                clearAuth();
                if (requireAuth) {
                    router.push('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [requireAuth, router, allowedRoles]);

    return { user, loading };
};