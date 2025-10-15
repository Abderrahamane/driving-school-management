export default function Navbar() {
    return (
        <header className="flex justify-end mb-4">
            <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium">Admin</span>
                <button className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
            </div>
        </header>
    );
}
