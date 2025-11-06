'use client';

import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export default function Toast({ type = 'success', message, onClose, duration = 3000 }) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const types = {
        success: {
            bg: 'bg-green-50 border-green-200',
            icon: <CheckCircle className="text-green-600" size={20} />,
            text: 'text-green-800',
        },
        error: {
            bg: 'bg-red-50 border-red-200',
            icon: <XCircle className="text-red-600" size={20} />,
            text: 'text-red-800',
        },
        warning: {
            bg: 'bg-yellow-50 border-yellow-200',
            icon: <AlertCircle className="text-yellow-600" size={20} />,
            text: 'text-yellow-800',
        },
    };

    const config = types[type];

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${config.bg} ${config.text} animate-slide-in`}>
            {config.icon}
            <p className="font-medium">{message}</p>
            <button onClick={onClose} className="ml-2 hover:opacity-70">
                <X size={18} />
            </button>
        </div>
    );
}