// frontend/src/components/settings/SecuritySettings.js
'use client';

import { useEffect, useState } from 'react';
import { authAPI, settingsAPI } from '@/lib/api';
import { Lock, Eye, EyeOff, Shield, Key, CheckCircle, AlertTriangle, Smartphone, Clock } from 'lucide-react';
import Loader from '@/components/Loader';

export default function SecuritySettings({ user, setToast, setHasUnsavedChanges }) {
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [loadingSecurity, setLoadingSecurity] = useState(true);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        const loadSecuritySettings = async () => {
            try {
                const response = await settingsAPI.getSecuritySettings();
                const data = response.data.data;
                setTwoFactorEnabled(Boolean(data.twoFactorEnabled));
                setSessions(data.activeSessions || []);
            } catch (error) {
                const message = error.response?.data?.error || 'Failed to load security settings';
                setToast({ type: 'error', message });
            } finally {
                setLoadingSecurity(false);
            }
        };

        loadSecuritySettings();
    }, [setToast]);

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
        setHasUnsavedChanges(true);

        if (name === 'newPassword') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        setPasswordStrength(strength);
    };

    const getPasswordStrengthLabel = () => {
        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-blue-600', 'text-green-600'];
        return {
            label: labels[passwordStrength] || 'Very Weak',
            color: colors[passwordStrength] || 'text-red-600',
        };
    };

    const getPasswordStrengthWidth = () => `${(passwordStrength / 5) * 100}%`;

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setToast({ type: 'error', message: 'New passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setToast({ type: 'error', message: 'Password must be at least 6 characters' });
            return;
        }

        if (passwordStrength < 2) {
            setToast({ type: 'warning', message: 'Please use a stronger password' });
            return;
        }

        setUpdatingPassword(true);
        try {
            await authAPI.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setToast({ type: 'success', message: 'Password updated successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordStrength(0);
            setHasUnsavedChanges(false);
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to update password';
            setToast({ type: 'error', message });
        } finally {
            setUpdatingPassword(false);
        }
    };

    const handleToggleTwoFactor = async () => {
        try {
            const response = await settingsAPI.toggleTwoFactor(!twoFactorEnabled);
            setTwoFactorEnabled(response.data.data.twoFactorEnabled);
            setToast({ type: 'success', message: response.data.message });
        } catch (error) {
            const message = error.response?.data?.error || 'Unable to update two-factor authentication setting';
            setToast({ type: 'error', message });
        }
    };

    const handleEndSession = async (sessionId) => {
        try {
            await settingsAPI.endSession(sessionId);
            setSessions((prev) => prev.filter((session) => session._id !== sessionId));
            setToast({ type: 'success', message: 'Session terminated successfully' });
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to terminate session';
            setToast({ type: 'error', message });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Security Settings</h2>
                <p className="text-gray-600">Manage your password and authentication settings</p>
            </div>

            {/* Change Password */}
            <form onSubmit={handlePasswordSubmit} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Lock size={20} className="text-blue-600" />
                    Change Password
                </h3>

                <div className="p-4 bg-blue-100 border border-blue-200 rounded-lg mb-6">
                    <div className="flex items-start gap-3">
                        <Shield className="text-blue-600 mt-1" size={20} />
                        <div>
                            <p className="text-sm font-semibold text-blue-800">Password Requirements</p>
                            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                                <li>At least 8 characters long (12+ recommended)</li>
                                <li>Mix of uppercase and lowercase letters</li>
                                <li>Include numbers and special characters</li>
                                <li>Avoid common words and patterns</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength={6}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {passwordData.newPassword && (
                            <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-600">Password Strength</span>
                                    <span className={`font-semibold ${getPasswordStrengthLabel().color}`}>
                                        {getPasswordStrengthLabel().label}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${
                                            passwordStrength <= 1
                                                ? 'bg-red-500'
                                                : passwordStrength === 2
                                                    ? 'bg-yellow-500'
                                                    : passwordStrength === 3
                                                        ? 'bg-blue-500'
                                                        : 'bg-green-500'
                                        }`}
                                        style={{ width: getPasswordStrengthWidth() }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength={6}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <AlertTriangle size={12} />
                                Passwords do not match
                            </p>
                        )}
                        {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <CheckCircle size={12} />
                                Passwords match
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        type="submit"
                        disabled={updatingPassword}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-all disabled:opacity-50 shadow-lg"
                    >
                        {updatingPassword ? (
                            <>
                                <Loader size="sm" />
                                <span>Updating...</span>
                            </>
                        ) : (
                            <>
                                <Lock size={18} />
                                <span>Update Password</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Two-Factor Authentication */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Smartphone size={20} className="text-blue-600" />
                            Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Add an extra layer of security to your account
                        </p>
                    </div>
                    {loadingSecurity ? (
                        <Loader size="sm" />
                    ) : (
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={twoFactorEnabled}
                                onChange={handleToggleTwoFactor}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    )}
                </div>
                {twoFactorEnabled && !loadingSecurity && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                            Two-factor authentication is enabled. You'll need to enter a code from your authenticator app when signing in.
                        </p>
                    </div>
                )}
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-blue-600" />
                    Active Sessions
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                    These devices are currently signed into your account
                </p>
                <div className="space-y-3">
                    {loadingSecurity && (
                        <div className="flex items-center justify-center py-6">
                            <Loader size="sm" />
                        </div>
                    )}

                    {!loadingSecurity && sessions.length === 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                            No active sessions found.
                        </div>
                    )}

                    {sessions.map((session) => (
                        <div key={session._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Smartphone className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                                        {session.device || 'Unknown device'}
                                        {session.current && (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                                Current
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-600">{session.location || 'Location unavailable'}</p>
                                    <p className="text-xs text-gray-500">
                                        Last active: {session.lastActive ? new Date(session.lastActive).toLocaleString() : 'Unknown'}
                                    </p>
                                </div>
                            </div>
                            {!session.current && (
                                <button
                                    onClick={() => handleEndSession(session._id)}
                                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm font-medium"
                                >
                                    End Session
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
