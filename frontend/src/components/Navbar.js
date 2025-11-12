'use client';

import { Bell, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clearAuth } from '@/lib/auth';

export default function Navbar({ user }) {
    const router = useRouter();

    const handleLogout = () => {
        clearAuth();
        router.push('/login');
    };

    return (
        <nav className="bg-white shadow-sm rounded-xl mb-6 px-6 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Driving School Management</h2>

            <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full hover:bg-gray-100 relative">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User size={18} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role || 'Admin'}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-red-50 text-red-600"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </nav>
    );
}