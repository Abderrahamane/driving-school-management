'use client';

import { useState } from 'react';
import { Home, Users, Car, Calendar, CreditCard, Menu, BookOpen, BarChart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ userRole = 'admin' }) {
    const [isOpen, setIsOpen] = useState(true);
    const pathname = usePathname();

    const adminMenu = [
        { name: 'Dashboard', icon: <Home size={18} />, path: '/dashboard/admin' },
        { name: 'Students', icon: <Users size={18} />, path: '/dashboard/admin/students' },
        { name: 'Instructors', icon: <Users size={18} />, path: '/dashboard/admin/instructors' },
        { name: 'Vehicles', icon: <Car size={18} />, path: '/dashboard/admin/vehicles' },
        { name: 'Lessons', icon: <Calendar size={18} />, path: '/dashboard/admin/lessons' },
        { name: 'Payments', icon: <CreditCard size={18} />, path: '/dashboard/admin/payments' },
    ];

    const instructorMenu = [
        { name: 'Dashboard', icon: <Home size={18} />, path: '/dashboard/instructor' },
        { name: 'My Students', icon: <Users size={18} />, path: '/dashboard/instructor/students' },
        { name: 'Lessons', icon: <Calendar size={18} />, path: '/dashboard/instructor/lessons' },
    ];

    const studentMenu = [
        { name: 'Dashboard', icon: <Home size={18} />, path: '/dashboard/student' },
        { name: 'My Lessons', icon: <BookOpen size={18} />, path: '/dashboard/student/lessons' },
        { name: 'Progress', icon: <BarChart size={18} />, path: '/dashboard/student/progress' },
    ];

    const menuItems = userRole === 'instructor' ? instructorMenu : userRole === 'student' ? studentMenu : adminMenu;

    return (
        <aside className={`bg-white shadow-md transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} flex flex-col`}>
            <div className="flex items-center justify-between p-4 border-b">
                {isOpen && <h1 className="text-xl font-semibold text-gray-800">Driving School</h1>}
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-gray-100">
                    <Menu size={20} />
                </button>
            </div>

            <nav className="flex-1 p-2 space-y-1">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.path}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition ${
                            pathname === item.path
                                ? 'bg-blue-100 text-blue-600 font-semibold'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {item.icon}
                        {isOpen && <span>{item.name}</span>}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}