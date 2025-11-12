import '@/styles/globals.css';

export const metadata = {
    title: 'Driving School Management System',
    description: 'Complete driving school management solution',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body className="bg-gray-100">
        {children}
        </body>
        </html>
    );
}