// frontend/src/components/settings/ProfileSettings.js
'use client';

import { useState } from 'react';
import { User, Mail, Building } from 'lucide-react';

export default function ProfileSettings({ user, setToast, setHasUnsavedChanges }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setHasUnsavedChanges(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // API call would go here
        setToast({ type: 'success', message: 'Profile updated successfully!' });
        setHasUnsavedChanges(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Settings</h2>
                <p className="text-gray-600">Update your personal information</p>
            </div>

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
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
}

// frontend/src/components/settings/SecuritySettings.js
export function SecuritySettings({ user, setToast, setHasUnsavedChanges }) {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setHasUnsavedChanges(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setToast({ type: 'error', message: 'Passwords do not match!' });
            return;
        }
        setToast({ type: 'success', message: 'Password updated successfully!' });
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setHasUnsavedChanges(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Security Settings</h2>
                <p className="text-gray-600">Update your password and security preferences</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                    </label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                    </label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                    Update Password
                </button>
            </form>
        </div>
    );
}

// frontend/src/components/settings/NotificationSettings.js
export function NotificationSettings({ user, setToast, setHasUnsavedChanges }) {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        lessonReminders: true,
        paymentAlerts: false,
    });

    const handleToggle = (key) => {
        setSettings({ ...settings, [key]: !settings[key] });
        setHasUnsavedChanges(true);
    };

    const handleSave = () => {
        setToast({ type: 'success', message: 'Notification preferences saved!' });
        setHasUnsavedChanges(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Notification Settings</h2>
                <p className="text-gray-600">Manage how you receive notifications</p>
            </div>

            <div className="space-y-4">
                {Object.entries(settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <button
                            onClick={() => handleToggle(key)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                value ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    value ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
                Save Preferences
            </button>
        </div>
    );
}

// frontend/src/components/settings/AppearanceSettings.js
export function AppearanceSettings({ user, setToast, setHasUnsavedChanges }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Appearance Settings</h2>
                <p className="text-gray-600">Customize the look and feel</p>
            </div>
            <p className="text-gray-500">Theme customization coming soon...</p>
        </div>
    );
}

// frontend/src/components/settings/SystemSettings.js
export function SystemSettings({ user, setToast }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">System Information</h2>
                <p className="text-gray-600">View system details and diagnostics</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">System version: 1.0.0</p>
                <p className="text-sm text-gray-600">Last updated: 2025-11-08</p>
            </div>
        </div>
    );
}

// frontend/src/components/settings/BackupSettings.js
export function BackupSettings({ user, setToast }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Backup & Restore</h2>
                <p className="text-gray-600">Manage database backups</p>
            </div>
            <button
                onClick={() => setToast({ type: 'success', message: 'Backup started!' })}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
                Create Backup
            </button>
        </div>
    );
}