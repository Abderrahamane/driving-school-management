// frontend/src/components/settings/BackupSettings.js
'use client';

import { useState } from 'react';
import { HardDrive, Download, Upload, Clock, Database, AlertCircle, CheckCircle } from 'lucide-react';

export default function BackupSettings({ user, setToast }) {
    const [backupHistory, setBackupHistory] = useState([
        { id: 1, date: '2025-11-07 10:30', size: '45.2 MB', status: 'completed', type: 'automatic' },
        { id: 2, date: '2025-11-06 10:30', size: '44.8 MB', status: 'completed', type: 'automatic' },
        { id: 3, date: '2025-11-05 15:45', size: '43.5 MB', status: 'completed', type: 'manual' },
    ]);

    const handleCreateBackup = () => {
        setToast({ type: 'success', message: 'Creating backup... This may take a few minutes.' });
        // Implement backup logic
    };

    const handleDownloadBackup = (backupId) => {
        setToast({ type: 'success', message: 'Downloading backup file...' });
        // Implement download logic
    };

    const handleRestoreBackup = () => {
        if (confirm('Are you sure you want to restore from backup? This will replace current data.')) {
            setToast({ type: 'warning', message: 'Restoring backup... Please wait.' });
            // Implement restore logic
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
                    className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                >
                    <Download size={32} className="mx-auto mb-3" />
                    <p className="font-semibold text-lg">Create Backup</p>
                    <p className="text-sm text-blue-100 mt-1">Download all data</p>
                </button>
                <button
                    onClick={handleRestoreBackup}
                    className="p-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
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
                            <p className="text-sm text-gray-600">Daily backups at 2:00 AM</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Backup Retention</label>
                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="7">Keep for 7 days</option>
                            <option value="14">Keep for 14 days</option>
                            <option value="30" selected>Keep for 30 days</option>
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
                    {backupHistory.map((backup) => (
                        <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
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
                                    <p className="font-semibold text-gray-800">{backup.date}</p>
                                    <p className="text-sm text-gray-600">
                                        {backup.size} • {backup.type} backup
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDownloadBackup(backup.id)}
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
