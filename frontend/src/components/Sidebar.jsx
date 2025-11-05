'use client';

import { useState } from 'react';
import { Home, Users, Car, Calendar, CreditCard, Menu } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);

    const menuItems = [
        { name: 'Dashboard', icon: <Home size={18} />, path: '/' },
        { name: 'Students', icon: <Users size={18} />, path: '/students' },
        { name: 'Instructors', icon: <Users size={18} />, path: '/instructors' },
        { name: 'Vehicles', icon: <Car size={18} />, path: '/vehicles' },
        { name: 'Schedules', icon: <Calendar size={18} />, path: '/schedules' },
        { name: 'Payments', icon: <CreditCard size={18} />, path: '/payments' },
    ];

    return (
        <aside className={`bg-white shadow-md transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} flex flex-col`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                {isOpen && <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>}
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-gray-100">
                    <Menu size={20} />
                </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-2 space-y-1">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.path}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                    >
                        {item.icon}
                        {isOpen && <span>{item.name}</span>}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
