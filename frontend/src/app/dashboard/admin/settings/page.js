// frontend/src/app/dashboard/admin/settings/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
import ProfileSettings from '@/components/settings/ProfileSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import SystemSettings from '@/components/settings/SystemSettings';
import BackupSettings from '@/components/settings/BackupSettings';
import {
    User, Lock, Bell, Palette, Database, Shield,
    HardDrive, Users, Settings as SettingsIcon
} from 'lucide-react';

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth(true, ['admin', 'super-admin']);
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Load saved preferences
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTab = localStorage.getItem('settings_active_tab');
            if (savedTab) setActiveTab(savedTab);
        }
    }, []);

    // Save tab preference
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('settings_active_tab', activeTab);
        }
    }, [activeTab]);

    // Warn about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    if (authLoading) return <Loader fullScreen />;

    const tabs = [
        {
            id: 'profile',
            label: 'Profile',
            icon: <User size={20} />,
            description: 'Manage your personal information'
        },
        {
            id: 'security',
            label: 'Security',
            icon: <Lock size={20} />,
            description: 'Password and authentication settings'
        },
        {
            id: 'notifications',
            label: 'Notifications',
            icon: <Bell size={20} />,
            description: 'Configure notification preferences'
        },
        {
            id: 'appearance',
            label: 'Appearance',
            icon: <Palette size={20} />,
            description: 'Customize the look and feel'
        },
        {
            id: 'backup',
            label: 'Backup & Restore',
            icon: <HardDrive size={20} />,
            description: 'Data backup and recovery options'
        },
        {
            id: 'system',
            label: 'System',
            icon: <Database size={20} />,
            description: 'System information and diagnostics'
        },
    ];

    // Only show advanced tabs for super-admin
    const visibleTabs = user?.role === 'super-admin'
        ? tabs
        : tabs.filter(t => !['system', 'backup'].includes(t.id));

    return (
        <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <Sidebar userRole={user?.role} />
            <main className="flex-1 p-6 overflow-y-auto">
                <Navbar user={user} />

                {toast && <Toast {...toast} onClose={() => setToast(null)} />}

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                            <SettingsIcon className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                            <p className="text-gray-600">Manage your account settings and preferences</p>
                        </div>
                    </div>
                </div>

                {/* Unsaved Changes Warning */}
                {hasUnsavedChanges && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                        <Shield className="text-yellow-600" size={24} />
                        <div>
                            <p className="font-semibold text-yellow-800">You have unsaved changes</p>
                            <p className="text-sm text-yellow-700">Make sure to save your changes before switching tabs</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-6">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                                <h2 className="text-white font-semibold">Settings Menu</h2>
                            </div>
                            <nav className="p-2">
                                {visibleTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            if (hasUnsavedChanges) {
                                                if (!confirm('You have unsaved changes. Are you sure you want to switch tabs?')) {
                                                    return;
                                                }
                                                setHasUnsavedChanges(false);
                                            }
                                            setActiveTab(tab.id);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                            activeTab === tab.id
                                                ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-semibold shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg ${
                                            activeTab === tab.id ? 'bg-blue-100' : 'bg-gray-100'
                                        }`}>
                                            {tab.icon}
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="text-sm font-medium">{tab.label}</p>
                                            {activeTab === tab.id && (
                                                <p className="text-xs text-gray-600 mt-0.5">{tab.description}</p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </nav>

                            {/* Quick Stats */}
                            <div className="p-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-2">Account Status</p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Role</span>
                                        <span className="font-semibold text-gray-800 capitalize">{user?.role}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Status</span>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                            Active
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Last Login</span>
                                        <span className="text-xs text-gray-500">
                                            {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[600px]">
                            {activeTab === 'profile' && (
                                <ProfileSettings
                                    user={user}
                                    setToast={setToast}
                                    setHasUnsavedChanges={setHasUnsavedChanges}
                                />
                            )}

                            {activeTab === 'security' && (
                                <SecuritySettings
                                    user={user}
                                    setToast={setToast}
                                    setHasUnsavedChanges={setHasUnsavedChanges}
                                />
                            )}

                            {activeTab === 'notifications' && (
                                <NotificationSettings
                                    user={user}
                                    setToast={setToast}
                                    setHasUnsavedChanges={setHasUnsavedChanges}
                                />
                            )}

                            {activeTab === 'appearance' && (
                                <AppearanceSettings
                                    user={user}
                                    setToast={setToast}
                                    setHasUnsavedChanges={setHasUnsavedChanges}
                                />
                            )}

                            {activeTab === 'backup' && user?.role === 'super-admin' && (
                                <BackupSettings
                                    user={user}
                                    setToast={setToast}
                                />
                            )}

                            {activeTab === 'system' && user?.role === 'super-admin' && (
                                <SystemSettings
                                    user={user}
                                    setToast={setToast}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}