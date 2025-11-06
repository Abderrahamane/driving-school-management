'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, redirectByRole } from '@/lib/auth';
import Loader from '@/components/Loader';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth();
        if (auth) {
            router.push(redirectByRole(auth.user.role));
        } else {
            router.push('/login');
        }
    }, [router]);

    return <Loader fullScreen />;
}