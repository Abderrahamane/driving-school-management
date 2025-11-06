import { Home, Users, UserCheck, Car, Calendar, DollarSign, FileText, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar({ userRole }) {
    const pathname = usePathname();

    const adminMenuItems = [
        { icon: <Home size={20} />, label: 'Dashboard', href: '/dashboard/admin' },
        { icon: <Users size={20} />, label: 'Students', href: '/dashboard/admin/students' },
        { icon: <UserCheck size={20} />, label: 'Instructors', href: '/dashboard/admin/instructors' },
        { icon: <Car size={20} />, label: 'Vehicles', href: '/dashboard/admin/vehicles' },
        { icon: <Calendar size={20} />, label: 'Lessons', href: '/dashboard/admin/lessons' },
        { icon: <DollarSign size={20} />, label: 'Payments', href: '/dashboard/admin/payments' },
        { icon: <FileText size={20} />, label: 'Reports', href: '/dashboard/admin/reports' },
        { icon: <Settings size={20} />, label: 'Settings', href: '/dashboard/admin/settings' },
    ];

    const menuItems = userRole === 'admin' || userRole === 'super-admin' ? adminMenuItems : [];

    return (
        <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white min-h-screen shadow-2xl">
            {/* Logo Section */}
            <div className="p-6 border-b border-blue-700">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Car className="text-blue-900" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Drive School</h2>
                        <p className="text-xs text-blue-300">Management System</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="p-4 space-y-2">
                {menuItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                isActive
                                    ? 'bg-white text-blue-900 shadow-lg transform scale-105'
                                    : 'hover:bg-blue-700 hover:translate-x-1'
                            }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Role Badge */}
            <div className="absolute bottom-6 left-4 right-4">
                <div className="bg-blue-700 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-300">Logged in as</p>
                    <p className="font-semibold capitalize">{userRole}</p>
                </div>
            </div>
        </aside>
    );
}