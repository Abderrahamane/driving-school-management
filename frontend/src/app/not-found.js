export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-lg text-gray-600 mb-8">
                Oops! The page you are looking for doesn’t exist.
            </p>
            <a
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
                Go Home
            </a>
        </div>
    );
}
