'use client';

import { useAuth } from '@/hooks/useAuth';
import { useFetch } from '@/hooks/useFetch';
import { studentsAPI, instructorsAPI, vehiclesAPI, lessonsAPI, paymentsAPI } from '@/lib/api';
import Loader from '@/components/Loader';
import Card from '@/components/Card';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Users, Car, Calendar, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth(true, ['admin', 'super-admin']);

    const { data: studentsStats } = useFetch(() => studentsAPI.getStats());
    const { data: vehiclesStats } = useFetch(() => vehiclesAPI.getStats());
    const { data: lessonsStats } = useFetch(() => lessonsAPI.getStats());
    const { data: paymentsStats } = useFetch(() => paymentsAPI.getStats());

    if (authLoading) return <Loader fullScreen />;

    const stats = [
        {
            title: 'Total Students',
            value: studentsStats?.data?.total || 0,
            icon: <Users size={24} />,
            color: 'blue',
        },
        {
            title: 'Total Vehicles',
            value: vehiclesStats?.data?.total || 0,
            icon: <Car size={24} />,
            color: 'green',
        },
        {
            title: 'Scheduled Lessons',
            value: lessonsStats?.data?.scheduled || 0,
            icon: <Calendar size={24} />,
            color: 'yellow',
        },
        {
            title: 'Total Revenue',
            value: `$${paymentsStats?.data?.totalRevenue?.toLocaleString() || 0}`,
            icon: <DollarSign size={24} />,
            color: 'purple',
        },
    ];

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar userRole={user?.role} />
            <main className="flex-1 p-6">
                <Navbar user={user} />

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
                    <p className="text-gray-600">Welcome back, {user?.name}!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {stats.map((stat, index) => (
                        <Card key={index} {...stat} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Students</h3>
                        <p className="text-sm text-gray-600">{studentsStats?.data?.recentlyRegistered || 0} new students in the last 30 days</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Lessons</h3>
                        <p className="text-sm text-gray-600">{lessonsStats?.data?.upcoming || 0} lessons scheduled for next week</p>
                    </div>
                </div>
            </main>
        </div>
    );
}