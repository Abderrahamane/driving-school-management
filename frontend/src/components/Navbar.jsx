'use client';

import { Bell, User } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="bg-white shadow-sm rounded-xl mb-6 px-6 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Driving School Management</h2>

            <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full hover:bg-gray-100">
                    <Bell size={20} />
                </button>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={18} />
                    </div>
                    <span className="text-gray-700 text-sm">Admin</span>
                </div>
            </div>
        </nav>
    );
}
