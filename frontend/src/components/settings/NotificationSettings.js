// frontend/src/components/settings/NotificationSettings.js
'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Calendar, DollarSign, Users, Car, FileText, Save } from 'lucide-react';

export default function NotificationSettings({ user, setToast, setHasUnsavedChanges }) {
    const [settings, setSettings] = useState({
        // Email Notifications
        emailEnabled: true,
        emailNewStudent: true,
        emailLessonReminder: true,
        emailPaymentReceived: true,
        emailSystemUpdate: false,
        emailWeeklyReport: true,

        // SMS Notifications
        smsEnabled: false,
        smsLessonReminder: false,
        smsPaymentDue: false,
        smsEmergency: true,

        // Push Notifications
        pushEnabled: true,
        pushNewStudent: true,
        pushLessonStart: true,
        pushPaymentReceived: true,
        pushSystemAlert: true,

        // In-App Notifications
        inAppEnabled: true,
        inAppNewStudent: true,
        inAppLessonUpdate: true,
        inAppPayment: true,
        inAppChat: true,
    });

    const [originalSettings, setOriginalSettings] = useState({});

    useEffect(() => {
        // Load saved settings from localStorage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('notification_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                setSettings(parsed);
                setOriginalSettings(parsed);
            } else {
                setOriginalSettings(settings);
            }
        }
    }, []);

    useEffect(() => {
        const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
        setHasUnsavedChanges(hasChanges);
    }, [settings, originalSettings, setHasUnsavedChanges]);

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('notification_settings', JSON.stringify(settings));
            setOriginalSettings(settings);
            setHasUnsavedChanges(false);
            setToast({ type: 'success', message: 'Notification preferences saved successfully!' });
        }
    };

    const notificationGroups = [
        {
            title: 'Email Notifications',
            icon: <Mail size={20} className="text-blue-600" />,
            description: 'Receive notifications via email',
            masterToggle: 'emailEnabled',
            items: [
                { key: 'emailNewStudent', label: 'New Student Registration', description: 'Get notified when a new student registers', icon: <Users size={16} /> },
                { key: 'emailLessonReminder', label: 'Lesson Reminders', description: 'Reminders about upcoming lessons', icon: <Calendar size={16} /> },
                { key: 'emailPaymentReceived', label: 'Payment Notifications', description: 'Alerts for payment received', icon: <DollarSign size={16} /> },
                { key: 'emailSystemUpdate', label: 'System Updates', description: 'Information about system maintenance', icon: <FileText size={16} /> },
                { key: 'emailWeeklyReport', label: 'Weekly Reports', description: 'Summary of weekly activities', icon: <FileText size={16} /> },
            ]
        },
        {
            title: 'SMS Notifications',
            icon: <MessageSquare size={20} className="text-green-600" />,
            description: 'Receive notifications via SMS',
            masterToggle: 'smsEnabled',
            items: [
                { key: 'smsLessonReminder', label: 'Lesson Reminders', description: 'SMS reminders 1 hour before lessons', icon: <Calendar size={16} /> },
                { key: 'smsPaymentDue', label: 'Payment Due', description: 'Reminders for pending payments', icon: <DollarSign size={16} /> },
                { key: 'smsEmergency', label: 'Emergency Alerts', description: 'Critical system alerts only', icon: <Bell size={16} /> },
            ]
        },
        {
            title: 'Push Notifications',
            icon: <Bell size={20} className="text-purple-600" />,
            description: 'Browser push notifications',
            masterToggle: 'pushEnabled',
            items: [
                { key: 'pushNewStudent', label: 'New Students', description: 'Instant notification for new registrations', icon: <Users size={16} /> },
                { key: 'pushLessonStart', label: 'Lesson Starting', description: 'Notify when lesson is about to start', icon: <Calendar size={16} /> },
                { key: 'pushPaymentReceived', label: 'Payments', description: 'Real-time payment notifications', icon: <DollarSign size={16} /> },
                { key: 'pushSystemAlert', label: 'System Alerts', description: 'Important system notifications', icon: <FileText size={16} /> },
            ]
        },
        {
            title: 'In-App Notifications',
            icon: <Bell size={20} className="text-orange-600" />,
            description: 'Notifications within the application',
            masterToggle: 'inAppEnabled',
            items: [
                { key: 'inAppNewStudent', label: 'Student Activities', description: 'New students and updates', icon: <Users size={16} /> },
                { key: 'inAppLessonUpdate', label: 'Lesson Updates', description: 'Changes to lesson schedules', icon: <Calendar size={16} /> },
                { key: 'inAppPayment', label: 'Payment Events', description: 'Payment status changes', icon: <DollarSign size={16} /> },
                { key: 'inAppChat', label: 'Messages', description: 'New messages and replies', icon: <MessageSquare size={16} /> },
            ]
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Notification Preferences</h2>
                <p className="text-gray-600">Choose how and when you want to be notified</p>
            </div>

            {/* Notification Groups */}
            <div className="space-y-6">
                {notificationGroups.map((group, groupIndex) => {
                    const masterEnabled = settings[group.masterToggle];

                    return (
                        <div key={groupIndex} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            {/* Group Header */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white rounded-lg shadow-sm">
                                            {group.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">{group.title}</h3>
                                            <p className="text-sm text-gray-600">{group.description}</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={masterEnabled}
                                            onChange={() => handleToggle(group.masterToggle)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Group Items */}
                            <div className={`p-6 space-y-4 ${!masterEnabled ? 'opacity-50' : ''}`}>
                                {group.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${
                                                masterEnabled && settings[item.key] ? 'bg-blue-100' : 'bg-gray-100'
                                            }`}>
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
                                                checked={settings[item.key]}
                                                onChange={() => handleToggle(item.key)}
                                                disabled={!masterEnabled}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quiet Hours */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Bell size={20} className="text-purple-600" />
                    Quiet Hours
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    Set a time range when you don't want to receive notifications (except emergency alerts)
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                        <input
                            type="time"
                            defaultValue="22:00"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                        <input
                            type="time"
                            defaultValue="08:00"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-all shadow-lg"
                >
                    <Save size={18} />
                    Save Preferences
                </button>
            </div>
        </div>
    );
}