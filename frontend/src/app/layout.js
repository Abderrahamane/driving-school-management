import '../styles/globals.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export const metadata = {
    title: 'Driving School Admin',
    description: 'Admin Dashboard for Driving School Management System',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6">
            <Navbar />
            {children}
        </main>
        </body>
        </html>
    );
}
