// frontend/src/components/settings/ProfileSettings.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { User, Mail, Building, Loader2 } from 'lucide-react';
import { settingsAPI } from '@/lib/api';
import { getAuth, setAuth } from '@/lib/auth';

export default function ProfileSettings({ user, setToast, setHasUnsavedChanges }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [originalData, setOriginalData] = useState(formData);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const normalizedFormData = useMemo(() => ({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
    }), [formData]);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await settingsAPI.getSettings();
                const profile = response.data.data.profile;
                const next = {
                    name: profile?.name || '',
                    email: profile?.email || '',
                };
                setFormData(next);
                setOriginalData(next);
            } catch (error) {
                const message = error.response?.data?.error || 'Failed to load profile information';
                setToast?.({ type: 'error', message });
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [setToast]);

    useEffect(() => {
        if (!user) {
            return;
        }
        const initial = {
            name: user.name || '',
            email: user.email || '',
        };
        setFormData(initial);
        setOriginalData(initial);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        const reference = {
            name: (originalData.name || '').trim(),
            email: (originalData.email || '').trim().toLowerCase(),
        };
        const hasChanges = JSON.stringify(normalizedFormData) !== JSON.stringify(reference);
        setHasUnsavedChanges(hasChanges);
    }, [normalizedFormData, originalData, setHasUnsavedChanges]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);

        try {
            const response = await settingsAPI.updateProfile(normalizedFormData);
            const updated = response.data.data;
            const next = { name: updated.name, email: updated.email };
            setFormData(next);
            setOriginalData(next);
            setToast({ type: 'success', message: response.data.message || 'Profile updated successfully!' });
            setHasUnsavedChanges(false);

            const auth = getAuth();
            if (auth?.token) {
                setAuth(auth.token, { ...auth.user, ...next });
            }
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to update profile information';
            setToast({ type: 'error', message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Settings</h2>
                <p className="text-gray-600">Update your personal information</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your full name"
                                required
                                minLength={2}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role
                        </label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={user?.role || 'admin'}
                                disabled
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 capitalize"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-60"
                    >
                        {saving && <Loader2 className="animate-spin" size={18} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            )}
        </div>
    );
}
