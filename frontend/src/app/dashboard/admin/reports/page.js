'use client';

import { useAuth } from '@/hooks/useAuth';
import { useFetch } from '@/hooks/useFetch';
import { studentsAPI, lessonsAPI, paymentsAPI, vehiclesAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import Card from '@/components/Card';
import { Users, Calendar, DollarSign, Car, TrendingUp, FileText, Download, BarChart } from 'lucide-react';

export default function ReportsPage() {
    const { user, loading: authLoading } = useAuth(true, ['admin', 'super-admin']);

    const { data: studentsStats } = useFetch(() => studentsAPI.getStats());
    const { data: lessonsStats } = useFetch(() => lessonsAPI.getStats());
    const { data: paymentsStats } = useFetch(() => paymentsAPI.getStats());
    const { data: vehiclesStats } = useFetch(() => vehiclesAPI.getStats());

    if (authLoading) return <Loader fullScreen />;

    const quickStats = [
        {
            title: 'Total Students',
            value: studentsStats?.data?.total || 0,
            icon: <Users size={24} />,
            color: 'blue',
            trend: { isPositive: true, value: '+12%' },
        },
        {
            title: 'Completed Lessons',
            value: lessonsStats?.data?.completed || 0,
            icon: <Calendar size={24} />,
            color: 'green',
            trend: { isPositive: true, value: '+8%' },
        },
        {
            title: 'Total Revenue',
            value: `$${paymentsStats?.data?.totalRevenue?.toLocaleString() || 0}`,
            icon: <DollarSign size={24} />,
            color: 'purple',
            trend: { isPositive: true, value: '+15%' },
        },
        {
            title: 'Active Vehicles',
            value: vehiclesStats?.data?.available || 0,
            icon: <Car size={24} />,
            color: 'yellow',
            trend: { isPositive: false, value: '-2%' },
        },
    ];

    return (
        <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <Sidebar userRole={user?.role} />
            <main className="flex-1 p-6 overflow-y-auto">
                <Navbar user={user} />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
                        <p className="text-gray-600">Comprehensive insights into your driving school performance</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 shadow-md transition-all">
                            <Download size={20} />
                            Export PDF
                        </button>
                        <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all">
                            <FileText size={20} />
                            Generate Report
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {quickStats.map((stat, index) => (
                        <Card key={index} {...stat} />
                    ))}
                </div>

                {/* Main Reports Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Student Progress Report */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Student Progress Overview</h3>
                            <BarChart className="text-blue-600" size={24} />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-600">Active Students</span>
                                    <span className="text-sm font-semibold text-gray-800">{studentsStats?.data?.total || 0}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-600">Recently Registered</span>
                                    <span className="text-sm font-semibold text-gray-800">{studentsStats?.data?.recentlyRegistered || 0}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                            {studentsStats?.data?.byLicenseType?.map((item, index) => (
                                <div key={index}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-gray-600">License Type {item._id}</span>
                                        <span className="text-sm font-semibold text-gray-800">{item.count}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full"
                                            style={{ width: `${(item.count / (studentsStats?.data?.total || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lesson Statistics */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Lesson Statistics</h3>
                            <Calendar className="text-green-600" size={24} />
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Scheduled</p>
                                    <p className="text-2xl font-bold text-blue-600">{lessonsStats?.data?.scheduled || 0}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <Calendar className="text-blue-600" size={20} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-green-600">{lessonsStats?.data?.completed || 0}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <Calendar className="text-green-600" size={20} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Cancelled</p>
                                    <p className="text-2xl font-bold text-red-600">{lessonsStats?.data?.cancelled || 0}</p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-full">
                                    <Calendar className="text-red-600" size={20} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Overview */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Financial Overview</h3>
                            <DollarSign className="text-purple-600" size={24} />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        ${paymentsStats?.data?.totalRevenue?.toLocaleString() || 0}
                                    </p>
                                </div>
                                <TrendingUp className="text-green-600" size={32} />
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Pending Amount</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        ${paymentsStats?.data?.pendingAmount?.toLocaleString() || 0}
                                    </p>
                                </div>
                                <DollarSign className="text-yellow-600" size={32} />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Paid</p>
                                    <p className="text-xl font-bold text-blue-600">{paymentsStats?.data?.totalPaid || 0}</p>
                                </div>
                                <div className="text-center p-3 bg-orange-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Pending</p>
                                    <p className="text-xl font-bold text-orange-600">{paymentsStats?.data?.totalPending || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Fleet Status */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Fleet Status</h3>
                            <Car className="text-yellow-600" size={24} />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Available</span>
                                </div>
                                <span className="text-lg font-bold text-gray-800">{vehiclesStats?.data?.available || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">In Use</span>
                                </div>
                                <span className="text-lg font-bold text-gray-800">{vehiclesStats?.data?.inUse || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Maintenance</span>
                                </div>
                                <span className="text-lg font-bold text-gray-800">{vehiclesStats?.data?.maintenance || 0}</span>
                            </div>
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">Total Fleet Size</p>
                                <p className="text-3xl font-bold text-gray-800">{vehiclesStats?.data?.total || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Methods Breakdown */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Payment Methods Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {paymentsStats?.data?.byMethod?.map((method, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1 capitalize">{method._id}</p>
                                <p className="text-2xl font-bold text-gray-800">${method.amount?.toLocaleString()}</p>
                                <p className="text-xs text-gray-500 mt-1">{method.count} transactions</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}