// frontend/src/components/settings/BackupSettings.js
'use client';

import { useEffect, useState } from 'react';
import { HardDrive, Download, Upload, Clock, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { settingsAPI } from '@/lib/api';

export default function BackupSettings({ user, setToast }) {
    const [backupHistory, setBackupHistory] = useState([]);
    const [preferences, setPreferences] = useState({ automatic: true, retentionDays: 30, lastBackupAt: null });
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const loadBackups = async () => {
            try {
                const response = await settingsAPI.getBackupSettings();
                setBackupHistory(response.data.data.backups || []);
                setPreferences(response.data.data.settings || preferences);
            } catch (error) {
                const message = error.response?.data?.error || 'Failed to load backup information';
                setToast({ type: 'error', message });
            } finally {
                setLoading(false);
            }
        };

        loadBackups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshBackups = async () => {
        try {
            const response = await settingsAPI.getBackupSettings();
            setBackupHistory(response.data.data.backups || []);
            setPreferences(response.data.data.settings || preferences);
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to refresh backups';
            setToast({ type: 'error', message });
        }
    };

    const handleCreateBackup = async () => {
        setProcessing(true);
        try {
            const response = await settingsAPI.createBackup({ type: 'manual' });
            setToast({ type: 'success', message: response.data.message || 'Backup created successfully' });
            await refreshBackups();
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to create backup';
            setToast({ type: 'error', message });
        } finally {
            setProcessing(false);
        }
    };

    const handleDownloadBackup = async (backupId) => {
        try {
            const response = await settingsAPI.downloadBackup(backupId);
            setToast({ type: 'success', message: response.data.message || 'Backup download ready' });
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to prepare backup download';
            setToast({ type: 'error', message });
        }
    };

    const handleRestoreBackup = async (backupId) => {
        if (!confirm('Are you sure you want to restore from this backup? This will replace current data.')) {
            return;
        }

        setProcessing(true);
        try {
            const response = await settingsAPI.restoreBackup(backupId);
            setToast({ type: 'warning', message: response.data.message || 'Backup restoration started' });
            await refreshBackups();
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to restore backup';
            setToast({ type: 'error', message });
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdatePreferences = async (next) => {
        try {
            const response = await settingsAPI.updateBackupPreferences(next);
            setPreferences(response.data.data || { ...preferences, ...next });
            setToast({ type: 'success', message: response.data.message || 'Backup preferences updated' });
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to update backup preferences';
            setToast({ type: 'error', message });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Backup & Restore</h2>
                <p className="text-gray-600">Manage your data backups and recovery options</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={handleCreateBackup}
                    disabled={processing || loading}
                    className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-60"
                >
                    <Download size={32} className="mx-auto mb-3" />
                    <p className="font-semibold text-lg">Create Backup</p>
                    <p className="text-sm text-blue-100 mt-1">Download all data</p>
                </button>
                <button
                    onClick={() => {
                        const mostRecent = backupHistory[0];
                        if (mostRecent?._id) {
                            handleRestoreBackup(mostRecent._id);
                        } else {
                            setToast({ type: 'info', message: 'No backups available to restore.' });
                        }
                    }}
                    disabled={processing || loading || backupHistory.length === 0}
                    className="p-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg disabled:opacity-60"
                >
                    <Upload size={32} className="mx-auto mb-3" />
                    <p className="font-semibold text-lg">Restore Backup</p>
                    <p className="text-sm text-purple-100 mt-1">Upload backup file</p>
                </button>
            </div>

            {/* Automatic Backups */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-blue-600" />
                    Automatic Backups
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-semibold text-gray-800">Enable Automatic Backups</p>
                            <p className="text-sm text-gray-600">
                                {preferences.lastBackupAt ? `Last backup: ${new Date(preferences.lastBackupAt).toLocaleString()}` : 'Daily backups at 2:00 AM'}
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={preferences.automatic}
                                onChange={(event) => {
                                    const automatic = event.target.checked;
                                    setPreferences((prev) => ({ ...prev, automatic }));
                                    handleUpdatePreferences({ automatic });
                                }}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Backup Retention</label>
                        <select
                            value={preferences.retentionDays}
                            onChange={(event) => {
                                const retentionDays = Number(event.target.value);
                                setPreferences((prev) => ({ ...prev, retentionDays }));
                                handleUpdatePreferences({ retentionDays });
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="7">Keep for 7 days</option>
                            <option value="14">Keep for 14 days</option>
                            <option value="30">Keep for 30 days</option>
                            <option value="90">Keep for 90 days</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Backup History */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Database size={20} className="text-blue-600" />
                    Backup History
                </h3>
                <div className="space-y-3">
                    {loading && (
                        <div className="flex items-center justify-center py-6 text-sm text-gray-600">
                            Loading backup history...
                        </div>
                    )}
                    {!loading && backupHistory.length === 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                            No backups have been created yet.
                        </div>
                    )}
                    {backupHistory.map((backup) => (
                        <div key={backup._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                    backup.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                                }`}>
                                    {backup.status === 'completed' ? (
                                        <CheckCircle className="text-green-600" size={20} />
                                    ) : (
                                        <Clock className="text-yellow-600" size={20} />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{new Date(backup.createdAt).toLocaleString()}</p>
                                    <p className="text-sm text-gray-600">
                                        {backup.sizeMB?.toFixed ? `${backup.sizeMB.toFixed(2)} MB` : `${backup.sizeMB} MB`} • {backup.type} backup
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDownloadBackup(backup._id)}
                                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                                Download
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
