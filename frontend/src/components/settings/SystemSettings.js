// frontend/src/components/settings/SystemSettings.js
import { Database, Server, Activity, HardDrive, Cpu, BarChart } from 'lucide-react';

export default function SystemSettings({ user, setToast }) {
    const systemInfo = {
        version: 'v1.0.0',
        lastUpdate: '2025-11-07',
        dbStatus: 'Connected',
        apiStatus: 'Operational',
        uptime: '30 days, 5 hours',
        totalUsers: 45,
        totalStudents: 123,
        totalLessons: 456,
        storage: { used: 2.3, total: 10, unit: 'GB' },
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">System Information</h2>
                <p className="text-gray-600">View system diagnostics and status</p>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-green-600 rounded-lg">
                            <Database className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-green-800">Database Status</p>
                            <p className="text-2xl font-bold text-green-900">{systemInfo.dbStatus}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-blue-600 rounded-lg">
                            <Server className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-blue-800">API Status</p>
                            <p className="text-2xl font-bold text-blue-900">{systemInfo.apiStatus}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Metrics */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-blue-600" />
                    System Metrics
                </h3>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">System Version</p>
                        <p className="text-lg font-semibold text-gray-800">{systemInfo.version}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Last Update</p>
                        <p className="text-lg font-semibold text-gray-800">{new Date(systemInfo.lastUpdate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">System Uptime</p>
                        <p className="text-lg font-semibold text-gray-800">{systemInfo.uptime}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Total Users</p>
                        <p className="text-lg font-semibold text-gray-800">{systemInfo.totalUsers}</p>
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
                                className="bg-blue-600 h-3 rounded-full"
                                style={{ width: `${(systemInfo.storage.used / systemInfo.storage.total) * 100}%` }}
                            ></div>
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
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-3xl font-bold text-blue-900">{systemInfo.totalStudents}</p>
                        <p className="text-sm text-blue-800 mt-1">Total Students</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-3xl font-bold text-green-900">{systemInfo.totalLessons}</p>
                        <p className="text-sm text-green-800 mt-1">Total Lessons</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-3xl font-bold text-purple-900">{systemInfo.totalUsers}</p>
                        <p className="text-sm text-purple-800 mt-1">System Users</p>
                    </div>
                </div>
            </div>

            {/* System Actions */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertCircle size={20} className="text-red-600" />
                    System Actions
                </h3>
                <div className="space-y-3">
                    <button className="w-full p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-left">
                        <p className="font-semibold text-gray-800">Clear System Cache</p>
                        <p className="text-sm text-gray-600">Remove temporary files and cached data</p>
                    </button>
                    <button className="w-full p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-left">
                        <p className="font-semibold text-gray-800">Database Optimization</p>
                        <p className="text-sm text-gray-600">Optimize and clean up database</p>
                    </button>
                </div>
            </div>
        </div>
    );
}