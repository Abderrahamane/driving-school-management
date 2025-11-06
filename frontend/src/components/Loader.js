'use client';

export default function Loader({ size = 'md', fullScreen = false }) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    const spinner = (
        <div className={`${sizes[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}></div>
    );

    if (fullScreen) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                {spinner}
            </div>
        );
    }

    return spinner;
}