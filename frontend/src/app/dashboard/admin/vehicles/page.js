// frontend/src/app/dashboard/admin/vehicles/page.js
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFetch } from '@/hooks/useFetch';
import { vehiclesAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
import VehicleFormModal from '@/components/vehicles/VehicleFormModal';
import VehicleDetailsModal from '@/components/vehicles/VehicleDetailsModal';
import MaintenanceModal from '@/components/vehicles/MaintenanceModal';
import {
    Plus, Edit, Trash2, Search, Filter, Download, Eye, Wrench,
    Car, CheckCircle, AlertCircle, Clock, TrendingUp
} from 'lucide-react';

export default function VehiclesPage() {
    const { user, loading: authLoading } = useAuth(true, ['admin', 'super-admin']);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [maintenanceVehicle, setMaintenanceVehicle] = useState(null);
    const [toast, setToast] = useState(null);

    const { data, loading, refetch } = useFetch(
        () => vehiclesAPI.getAll({
            page,
            search: searchTerm,
            status: statusFilter
        }),
        [page, searchTerm, statusFilter]
    );

    const { data: statsData } = useFetch(() => vehiclesAPI.getStats());

    const handleOpenFormModal = (vehicle = null) => {
        setEditingVehicle(vehicle);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingVehicle(null);
    };

    const handleViewDetails = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsDetailsModalOpen(true);
    };

    const handleOpenMaintenanceModal = (vehicle) => {
        setMaintenanceVehicle(vehicle);
        setIsMaintenanceModalOpen(true);
    };

    const handleCloseMaintenanceModal = () => {
        setIsMaintenanceModalOpen(false);
        setMaintenanceVehicle(null);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            await vehiclesAPI.delete(id);
            setToast({ type: 'success', message: 'Vehicle deleted successfully!' });
            refetch();
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.error || 'Delete failed' });
        }
    };

    const handleFormSuccess = () => {
        refetch();
        handleCloseFormModal();
    };

    const handleMaintenanceSuccess = () => {
        refetch();
        handleCloseMaintenanceModal();
    };

    const handleExport = () => {
        setToast({ type: 'success', message: 'Exporting vehicles data...' });
    };

    if (authLoading) return <Loader fullScreen />;

    const statusColors = {
        available: 'bg-green-100 text-green-800',
        'in-use': 'bg-blue-100 text-blue-800',
        maintenance: 'bg-yellow-100 text-yellow-800',
        retired: 'bg-gray-100 text-gray-800',
    };

    return (
        <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <Sidebar userRole={user?.role} />
            <main className="flex-1 p-6 overflow-y-auto">
                <Navbar user={user} />

                {toast && <Toast {...toast} onClose={() => setToast(null)} />}

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Fleet Management</h1>
                        <p className="text-gray-600">Manage your vehicles and track maintenance</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 shadow-md transition-all"
                        >
                            <Download size={20} />
                            Export
                        </button>
                        <button
                            onClick={() => handleOpenFormModal()}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all transform hover:scale-105"
                        >
                            <Plus size={20} />
                            Add Vehicle
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Fleet</p>
                                <h3 className="text-3xl font-bold text-gray-800">{statsData?.data?.total || 0}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100">
                                <Car className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Available</p>
                                <h3 className="text-3xl font-bold text-gray-800">{statsData?.data?.available || 0}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-green-100">
                                <CheckCircle className="text-green-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">In Maintenance</p>
                                <h3 className="text-3xl font-bold text-gray-800">{statsData?.data?.maintenance || 0}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-yellow-100">
                                <Wrench className="text-yellow-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Avg Age</p>
                                <h3 className="text-3xl font-bold text-gray-800">{statsData?.data?.avgAge || 0}<span className="text-lg">y</span></h3>
                            </div>
                            <div className="p-3 rounded-full bg-purple-100">
                                <TrendingUp className="text-purple-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg mb-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by plate number, model, or manufacturer..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="available">Available</option>
                            <option value="in-use">In Use</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="retired">Retired</option>
                        </select>
                        <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                            <Filter size={20} />
                            More Filters
                        </button>
                    </div>
                </div>

                {/* Vehicles Table */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader size="lg" />
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mileage</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lessons</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                    {data?.data?.map((vehicle) => (
                                        <tr key={vehicle._id} className="hover:bg-gray-50 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-lg">
                                                        {vehicle.plateNumber.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">{vehicle.plateNumber}</p>
                                                        <p className="text-xs text-gray-500">{vehicle.model}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600">{vehicle.manufacturer || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">
                                                    {vehicle.year} • {vehicle.transmission} • {vehicle.fuelType}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-gray-400" />
                                                    <span className="text-sm font-semibold text-gray-800">
                                                        {vehicle.mileage?.toLocaleString() || 0} km
                                                    </span>
                                                </div>
                                                {vehicle.stats?.maintenanceDue && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <AlertCircle size={14} className="text-red-500" />
                                                        <span className="text-xs text-red-600">Maintenance due</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColors[vehicle.status]}`}>
                                                    {vehicle.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600">
                                                    <p className="font-semibold">{vehicle.stats?.totalLessons || 0} total</p>
                                                    <p className="text-xs text-gray-500">
                                                        {vehicle.stats?.scheduledLessons || 0} scheduled
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(vehicle)}
                                                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenFormModal(vehicle)}
                                                        className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenMaintenanceModal(vehicle)}
                                                        className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-all"
                                                        title="Add Maintenance"
                                                    >
                                                        <Wrench size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(vehicle._id)}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {data?.pagination && (
                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing {((page - 1) * data.pagination.limit) + 1} to {Math.min(page * data.pagination.limit, data.pagination.total)} of {data.pagination.total} vehicles
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                        {page}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page >= data.pagination.pages}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Modals */}
                <VehicleFormModal
                    isOpen={isFormModalOpen}
                    onClose={handleCloseFormModal}
                    vehicle={editingVehicle}
                    onSuccess={handleFormSuccess}
                    setToast={setToast}
                />

                {selectedVehicle && (
                    <VehicleDetailsModal
                        isOpen={isDetailsModalOpen}
                        onClose={() => {
                            setIsDetailsModalOpen(false);
                            setSelectedVehicle(null);
                        }}
                        vehicle={selectedVehicle}
                        onEdit={() => {
                            setIsDetailsModalOpen(false);
                            handleOpenFormModal(selectedVehicle);
                        }}
                        onMaintenanceClick={handleOpenMaintenanceModal}
                        setToast={setToast}
                    />
                )}

                {maintenanceVehicle && (
                    <MaintenanceModal
                        isOpen={isMaintenanceModalOpen}
                        onClose={handleCloseMaintenanceModal}
                        vehicle={maintenanceVehicle}
                        onSuccess={handleMaintenanceSuccess}
                        setToast={setToast}
                    />
                )}
            </main>
        </div>
    );
}