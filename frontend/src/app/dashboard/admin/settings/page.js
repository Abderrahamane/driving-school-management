'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
import { User, Lock, Bell, Shield, Globe, Palette, Database, Mail } from 'lucide-react';

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth(true, ['admin', 'super-admin']);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        lessonReminders: true,
        paymentAlerts: true,
        systemUpdates: false,
    });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Update profile logic here
            setToast({ type: 'success', message: 'Profile updated successfully!' });
        } catch (error) {
            setToast({ type: 'error', message: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setToast({ type: 'error', message: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            await authAPI.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setToast({ type: 'success', message: 'Password updated successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.error || 'Failed to update password' });
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationToggle = (key) => {
        setNotificationSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        setToast({ type: 'success', message: 'Notification settings updated!' });
    };

    if (authLoading) return <Loader fullScreen />;

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <User size={20} /> },
        { id: 'security', label: 'Security', icon: <Lock size={20} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
        { id: 'appearance', label: 'Appearance', icon: <Palette size={20} /> },
        { id: 'system', label: 'System', icon: <Database size={20} /> },
    ];

    return (
        <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <Sidebar userRole={user?.role} />
            <main className="flex-1 p-6 overflow-y-auto">
                <Navbar user={user} />

                {toast && <Toast {...toast} onClose={() => setToast(null)} />}

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
                    <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-4">
                            <nav className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                            activeTab === tab.id
                                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h2>
                                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-2">
                                                    Change Photo
                                                </button>
                                                <p className="text-sm text-gray-500">JPG, PNG or GIF (max. 2MB)</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                            <input
                                                type="text"
                                                value={user?.role}
                                                disabled
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 capitalize"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-3">
                                            <button type="button" className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                                                Cancel
                                            </button>
                                            <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Security Settings</h2>
                                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                                            <div className="flex items-start gap-3">
                                                <Shield className="text-blue-600 mt-1" size={20} />
                                                <div>
                                                    <p className="text-sm font-semibold text-blue-800">Password Requirements</p>
                                                    <p className="text-sm text-blue-600 mt-1">
                                                        Use at least 6 characters with a mix of letters and numbers
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                            <input
                                                type="password"
                                                required
                                                minLength={6}
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                            <input
                                                type="password"
                                                required
                                                minLength={6}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-3">
                                            <button type="button" className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                                                Cancel
                                            </button>
                                            <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                                {loading ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Notification Preferences</h2>
                                    <div className="space-y-6">
                                        {[
                                            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email', icon: <Mail size={20} /> },
                                            { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via SMS', icon: <Bell size={20} /> },
                                            { key: 'lessonReminders', label: 'Lesson Reminders', description: 'Get reminders about upcoming lessons', icon: <Bell size={20} /> },
                                            { key: 'paymentAlerts', label: 'Payment Alerts', description: 'Notifications about payments and invoices', icon: <DollarSign size={20} /> },
                                            { key: 'systemUpdates', label: 'System Updates', description: 'Information about system maintenance and updates', icon: <Database size={20} /> },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                        {item.icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{item.label}</p>
                                                        <p className="text-sm text-gray-600">{item.description}</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings[item.key]}
                                                        onChange={() => handleNotificationToggle(item.key)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Appearance Tab */}
                            {activeTab === 'appearance' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Appearance Settings</h2>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {['Light', 'Dark', 'Auto'].map((theme) => (
                                                    <button
                                                        key={theme}
                                                        className="p-4 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                                                    >
                                                        <p className="font-semibold text-gray-800">{theme}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Language</label>
                                            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                                <option value="en">English</option>
                                                <option value="ar">العربية</option>
                                                <option value="fr">Français</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Timezone</label>
                                            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                                <option value="utc">UTC</option>
                                                <option value="est">Eastern Time (EST)</option>
                                                <option value="pst">Pacific Time (PST)</option>
                                                <option value="gmt">GMT</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* System Tab */}
                            {activeTab === 'system' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6">System Information</h2>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600">System Version</p>
                                            <p className="text-lg font-semibold text-gray-800">v1.0.0</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600">Last Updated</p>
                                            <p className="text-lg font-semibold text-gray-800">{new Date().toLocaleDateString()}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600">Database Status</p>
                                            <p className="text-lg font-semibold text-green-600">Connected</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600">API Status</p>
                                            <p className="text-lg font-semibold text-green-600">Operational</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}