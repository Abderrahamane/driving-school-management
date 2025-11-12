'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/auth';
import Loader from '@/components/Loader';

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        const role = getUserRole();
        if (role === 'admin' || role === 'super-admin') {
            router.push('/dashboard/admin');
        } else if (role === 'instructor') {
            router.push('/dashboard/instructor');
        } else if (role === 'student') {
            router.push('/dashboard/student');
        } else {
            router.push('/login');
        }
    }, [router]);

    return <Loader fullScreen />;
}