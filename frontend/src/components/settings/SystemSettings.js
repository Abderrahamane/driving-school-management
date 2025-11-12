// frontend/src/components/settings/SystemSettings.js
'use client';

import { useEffect, useState } from 'react';
import {
    Database, Server, Activity, HardDrive, Cpu, BarChart,
    AlertCircle, RefreshCw, Trash2, Download, CheckCircle,
    Clock, Users, Calendar, DollarSign, Zap
} from 'lucide-react';
import Loader from '@/components/Loader';
import { settingsAPI } from '@/lib/api';

export default function SystemSettings({ user, setToast }) {
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [infoLoading, setInfoLoading] = useState(true);
    const [systemInfo, setSystemInfo] = useState({
        version: 'v1.0.0',
        lastUpdate: null,
        dbStatus: 'Unknown',
        apiStatus: 'Unknown',
        uptime: '',
        totals: {
            users: 0,
            students: 0,
            lessons: 0,
            instructors: 0,
            vehicles: 0,
            paymentsAmount: 0,
        },
        storage: { used: 0, total: 0, unit: 'GB' },
        performance: {
            cpu: 0,
            memory: 0,
            disk: 0,
        },
        recentActivity: [],
    });

    const fetchSystemStatus = async () => {
        try {
            const response = await settingsAPI.getSystemStatus();
            setSystemInfo(response.data.data);
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to load system information';
            setToast({ type: 'error', message });
        } finally {
            setInfoLoading(false);
        }
    };

    useEffect(() => {
        fetchSystemStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRefreshStats = async () => {
        setRefreshing(true);
        try {
            await fetchSystemStatus();
            setToast({ type: 'success', message: 'System statistics refreshed successfully!' });
        } catch (error) {
            setToast({ type: 'error', message: 'Failed to refresh statistics' });
        } finally {
            setRefreshing(false);
        }
    };

    const handleClearCache = async () => {
        if (!confirm('Are you sure you want to clear the system cache? This may temporarily slow down the system.')) {
            return;
        }
        setLoading(true);
        try {
            const response = await settingsAPI.clearCache();
            setToast({ type: 'success', message: response.data.message || 'System cache cleared successfully!' });
        } catch (error) {
            setToast({ type: 'error', message: 'Failed to clear cache' });
        } finally {
            setLoading(false);
        }
    };

    const handleOptimizeDatabase = async () => {
        if (!confirm('Database optimization may take several minutes. Continue?')) {
            return;
        }
        setLoading(true);
        try {
            const response = await settingsAPI.optimizeDatabase();
            setToast({ type: 'success', message: response.data.message || 'Database optimized successfully! Performance improved.' });
        } catch (error) {
            setToast({ type: 'error', message: 'Failed to optimize database' });
        } finally {
            setLoading(false);
        }
    };

    const handleExportLogs = async () => {
        setLoading(true);
        try {
            const response = await settingsAPI.exportLogs();
            setToast({ type: 'success', message: response.data.message || 'System logs exported successfully!' });
        } catch (error) {
            setToast({ type: 'error', message: 'Failed to export logs' });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        return status === 'Connected' || status === 'Operational'
            ? 'text-green-600'
            : 'text-red-600';
    };

    const getPerformanceColor = (value) => {
        if (value < 50) return 'bg-green-600';
        if (value < 75) return 'bg-yellow-600';
        return 'bg-red-600';
    };

    return (
        <div className="space-y-6">
            {/* Header with Refresh Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">System Information</h2>
                    <p className="text-gray-600">Monitor system health, performance, and diagnostics</p>
                </div>
                <button
                    onClick={handleRefreshStats}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                    <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* System Status Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-green-600 rounded-lg">
                            <Database className="text-white" size={24} />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            systemInfo.dbStatus === 'Connected' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                        }`}>
                            {systemInfo.dbStatus}
                        </span>
                    </div>
                    <p className="text-sm text-green-800 mb-1">Database Status</p>
                    <p className={`text-2xl font-bold ${getStatusColor(systemInfo.dbStatus)}`}>
                        {systemInfo.dbStatus}
                    </p>
                    <p className="text-xs text-green-700 mt-2">MongoDB • Status monitored</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-blue-600 rounded-lg">
                            <Server className="text-white" size={24} />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            systemInfo.apiStatus === 'Operational' ? 'bg-blue-200 text-blue-800' : 'bg-red-200 text-red-800'
                        }`}>
                            {systemInfo.apiStatus}
                        </span>
                    </div>
                    <p className="text-sm text-blue-800 mb-1">API Status</p>
                    <p className={`text-2xl font-bold ${getStatusColor(systemInfo.apiStatus)}`}>
                        {systemInfo.apiStatus}
                    </p>
                    <p className="text-xs text-blue-700 mt-2">Node.js • Status monitored</p>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-blue-600" />
                    System Performance
                </h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600 flex items-center gap-2">
                                <Cpu size={16} />
                                CPU Usage
                            </span>
                            <span className="text-sm font-semibold text-gray-800">{systemInfo.performance.cpu}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all ${getPerformanceColor(systemInfo.performance.cpu)}`}
                                style={{ width: `${systemInfo.performance.cpu}%` }}
                            ></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600 flex items-center gap-2">
                                <Zap size={16} />
                                Memory Usage
                            </span>
                            <span className="text-sm font-semibold text-gray-800">{systemInfo.performance.memory}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all ${getPerformanceColor(systemInfo.performance.memory)}`}
                                style={{ width: `${systemInfo.performance.memory}%` }}
                            ></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600 flex items-center gap-2">
                                <HardDrive size={16} />
                                Disk Usage
                            </span>
                            <span className="text-sm font-semibold text-gray-800">{systemInfo.performance.disk}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all ${getPerformanceColor(systemInfo.performance.disk)}`}
                                style={{ width: `${systemInfo.performance.disk}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Metrics Grid */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart size={20} className="text-blue-600" />
                    System Metrics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">System Version</p>
                        <p className="text-lg font-semibold text-gray-800">{systemInfo.version}</p>
                        <p className="text-xs text-gray-500 mt-1">Latest</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Last Update</p>
                        <p className="text-lg font-semibold text-gray-800">
                            {systemInfo.lastUpdate ? new Date(systemInfo.lastUpdate).toLocaleDateString() : '—'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">4 days ago</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">System Uptime</p>
                        <p className="text-lg font-semibold text-gray-800">{systemInfo.uptime}</p>
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <CheckCircle size={12} />
                            Stable
                        </p>
                    </div>
                </div>
            </div>

            {/* Storage Usage */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <HardDrive size={20} className="text-blue-600" />
                    Storage Usage
                </h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600">Used Space</span>
                            <span className="text-sm font-semibold text-gray-800">
                                {systemInfo.storage.used} / {systemInfo.storage.total} {systemInfo.storage.unit}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-blue-600 h-3 rounded-full transition-all"
                                style={{ width: `${(systemInfo.storage.used / systemInfo.storage.total) * 100}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>Database: 1.5 GB</span>
                            <span>Files: 0.8 GB</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Database Statistics */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart size={20} className="text-blue-600" />
                    Database Statistics
                </h3>
                <div className="grid grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Users size={24} className="mx-auto text-blue-600 mb-2" />
                        <p className="text-2xl font-bold text-blue-900">{systemInfo.totals?.users ?? 0}</p>
                        <p className="text-xs text-blue-800 mt-1">System Users</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Users size={24} className="mx-auto text-green-600 mb-2" />
                        <p className="text-2xl font-bold text-green-900">{systemInfo.totals?.students ?? 0}</p>
                        <p className="text-xs text-green-800 mt-1">Students</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Calendar size={24} className="mx-auto text-purple-600 mb-2" />
                        <p className="text-2xl font-bold text-purple-900">{systemInfo.totals?.lessons ?? 0}</p>
                        <p className="text-xs text-purple-800 mt-1">Lessons</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <Users size={24} className="mx-auto text-orange-600 mb-2" />
                        <p className="text-2xl font-bold text-orange-900">{systemInfo.totals?.instructors ?? 0}</p>
                        <p className="text-xs text-orange-800 mt-1">Instructors</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <Activity size={24} className="mx-auto text-yellow-600 mb-2" />
                        <p className="text-2xl font-bold text-yellow-900">{systemInfo.totals?.vehicles ?? 0}</p>
                        <p className="text-xs text-yellow-800 mt-1">Vehicles</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-blue-600" />
                    Recent Activity
                </h3>
                <div className="space-y-3">
                    {infoLoading && (
                        <div className="flex items-center justify-center py-6 text-sm text-gray-600">
                            Loading recent activity...
                        </div>
                    )}
                    {!infoLoading && systemInfo.recentActivity.length === 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                            No recent activity available.
                        </div>
                    )}
                    {systemInfo.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                    activity.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                    <CheckCircle className={
                                        activity.status === 'success' ? 'text-green-600' : 'text-red-600'
                                    } size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{activity.action}</p>
                                    <p className="text-xs text-gray-500">
                                        {activity.time ? new Date(activity.time).toLocaleString() : '—'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* System Actions */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertCircle size={20} className="text-red-600" />
                    System Maintenance
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleClearCache}
                        disabled={loading}
                        className="p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-left disabled:opacity-50"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Trash2 className="text-orange-600" size={20} />
                            <p className="font-semibold text-gray-800">Clear System Cache</p>
                        </div>
                        <p className="text-sm text-gray-600">Remove temporary files and cached data</p>
                    </button>

                    <button
                        onClick={handleOptimizeDatabase}
                        disabled={loading}
                        className="p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-left disabled:opacity-50"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Database className="text-blue-600" size={20} />
                            <p className="font-semibold text-gray-800">Optimize Database</p>
                        </div>
                        <p className="text-sm text-gray-600">Clean up and optimize database performance</p>
                    </button>

                    <button
                        onClick={handleExportLogs}
                        disabled={loading}
                        className="p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-left disabled:opacity-50"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Download className="text-green-600" size={20} />
                            <p className="font-semibold text-gray-800">Export System Logs</p>
                        </div>
                        <p className="text-sm text-gray-600">Download complete system logs for debugging</p>
                    </button>

                    <button
                        disabled={true}
                        className="p-4 bg-white border border-gray-300 rounded-lg opacity-50 cursor-not-allowed text-left"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <RefreshCw className="text-purple-600" size={20} />
                            <p className="font-semibold text-gray-800">Restart Services</p>
                        </div>
                        <p className="text-sm text-gray-600">Requires server access (disabled)</p>
                    </button>
                </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4">
                        <Loader size="lg" />
                        <p className="text-gray-800 font-semibold">Processing...</p>
                    </div>
                </div>
            )}
        </div>
    );
}