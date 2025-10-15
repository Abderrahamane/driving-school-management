'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();
    const links = [
        { name: 'Dashboard', path: '/' },
        { name: 'Students', path: '/students' },
        { name: 'Instructors', path: '/instructors' },
        { name: 'Vehicles', path: '/vehicles' },
        { name: 'Schedules', path: '/schedules' },
        { name: 'Payments', path: '/payments' },
        { name: 'Reports', path: '/reports' },
    ];

    return (
        <aside className="w-60 bg-white shadow-md p-4">
            <h2 className="text-xl font-bold mb-6">Driving School</h2>
            <nav className="flex flex-col gap-3">
                {links.map(link => (
                    <Link
                        key={link.path}
                        href={link.path}
                        className={`p-2 rounded hover:bg-blue-100 ${
                            pathname === link.path ? 'bg-blue-200' : ''
                        }`}
                    >
                        {link.name}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
