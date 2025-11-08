// frontend/src/components/vehicles/VehicleDetailsModal.js
'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import Modal from '@/components/Modal';
import Loader from '@/components/Loader';
import { vehiclesAPI } from '@/lib/api';
import {
    Car, Calendar, Settings, Shield, DollarSign, FileText, Edit,
    Gauge, Fuel, Users, AlertCircle, CheckCircle, Clock, Wrench
} from 'lucide-react';

export default function VehicleDetailsModal({ isOpen, onClose, vehicle, onEdit, setToast, onMaintenanceClick }) {
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch detailed vehicle info
    const { data: vehicleData, loading } = useFetch(
        () => vehiclesAPI.getOne(vehicle?._id),
        [vehicle?._id]
    );

    if (!vehicle) return null;

    const fullVehicle = vehicleData?.data || vehicle;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Car size={18} /> },
        { id: 'maintenance', label: 'Maintenance', icon: <Settings size={18} /> },
        { id: 'schedule', label: 'Schedule', icon: <Calendar size={18} /> },
        { id: 'documents', label: 'Documents', icon: <FileText size={18} /> },
    ];

    const statusColors = {
        available: 'bg-green-100 text-green-800',
        'in-use': 'bg-blue-100 text-blue-800',
        maintenance: 'bg-yellow-100 text-yellow-800',
        retired: 'bg-gray-100 text-gray-800',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
            <div className="space-y-6">
                {/* Header with Vehicle Info */}
                <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Car size={36} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-1">{fullVehicle.plateNumber}</h2>
                                <p className="text-green-100 mb-2">
                                    {fullVehicle.manufacturer} {fullVehicle.model} ({fullVehicle.year})
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[fullVehicle.status]} bg-white/90`}>
                                        {fullVehicle.status}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm capitalize">
                                        {fullVehicle.transmission}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm capitalize">
                                        {fullVehicle.fuelType}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all"
                        >
                            <Edit size={18} />
                            Edit
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                        <Gauge size={24} className="mx-auto text-blue-600 mb-2" />
                        <p className="text-2xl font-bold text-blue-900">{fullVehicle.mileage?.toLocaleString()}</p>
                        <p className="text-xs text-blue-800">Kilometers</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                        <Calendar size={24} className="mx-auto text-green-600 mb-2" />
                        <p className="text-2xl font-bold text-green-900">{fullVehicle.stats?.scheduledLessons || 0}</p>
                        <p className="text-xs text-green-800">Scheduled</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                        <CheckCircle size={24} className="mx-auto text-purple-600 mb-2" />
                        <p className="text-2xl font-bold text-purple-900">{fullVehicle.stats?.completedLessons || 0}</p>
                        <p className="text-xs text-purple-800">Completed</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center">
                        <Users size={24} className="mx-auto text-yellow-600 mb-2" />
                        <p className="text-2xl font-bold text-yellow-900">{fullVehicle.capacity}</p>
                        <p className="text-xs text-yellow-800">Seats</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <div className="flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                                    activeTab === tab.id
                                        ? 'border-green-600 text-green-600 font-semibold'
                                        : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Vehicle Specifications */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Car size={18} className="text-green-600" />
                                        Vehicle Specifications
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">VIN</span>
                                            <span className="text-sm font-medium">{fullVehicle.vin || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Color</span>
                                            <span className="text-sm font-medium">{fullVehicle.color || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Age</span>
                                            <span className="text-sm font-medium">{fullVehicle.age || 0} years</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Capacity</span>
                                            <span className="text-sm font-medium">{fullVehicle.capacity} passengers</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Insurance Info */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Shield size={18} className="text-green-600" />
                                        Insurance Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Provider</span>
                                            <span className="text-sm font-medium">{fullVehicle.insuranceDetails?.provider || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Policy Number</span>
                                            <span className="text-sm font-medium">{fullVehicle.insuranceDetails?.policyNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Expiry Date</span>
                                            <span className="text-sm font-medium">
                                                {fullVehicle.insuranceDetails?.expiryDate
                                                    ? new Date(fullVehicle.insuranceDetails.expiryDate).toLocaleDateString()
                                                    : 'N/A'
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Coverage</span>
                                            <span className="text-sm font-medium">{fullVehicle.insuranceDetails?.coverage || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Registration Details */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <FileText size={18} className="text-blue-600" />
                                    Registration Details
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Registration Number</p>
                                        <p className="font-medium">{fullVehicle.registrationDetails?.registrationNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">State/Province</p>
                                        <p className="font-medium">{fullVehicle.registrationDetails?.state || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Expiry Date</p>
                                        <p className="font-medium">
                                            {fullVehicle.registrationDetails?.expiryDate
                                                ? new Date(fullVehicle.registrationDetails.expiryDate).toLocaleDateString()
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Purchase Info */}
                            {fullVehicle.purchaseInfo && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <DollarSign size={18} className="text-green-600" />
                                        Purchase Information
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Purchase Date</p>
                                            <p className="font-medium">
                                                {fullVehicle.purchaseInfo?.purchaseDate
                                                    ? new Date(fullVehicle.purchaseInfo.purchaseDate).toLocaleDateString()
                                                    : 'N/A'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Purchase Price</p>
                                            <p className="font-medium">
                                                {fullVehicle.purchaseInfo?.purchasePrice
                                                    ? `$${fullVehicle.purchaseInfo.purchasePrice.toLocaleString()}`
                                                    : 'N/A'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Dealer</p>
                                            <p className="font-medium">{fullVehicle.purchaseInfo?.dealer || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {fullVehicle.notes && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        <FileText size={18} className="text-yellow-600" />
                                        Notes
                                    </h3>
                                    <p className="text-sm text-gray-700">{fullVehicle.notes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'maintenance' && (
                        <div className="space-y-4">
                            {/* Maintenance Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`rounded-lg p-4 border-2 ${
                                    fullVehicle.maintenanceDue
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-green-50 border-green-200'
                                }`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        {fullVehicle.maintenanceDue ? (
                                            <AlertCircle className="text-red-600" size={24} />
                                        ) : (
                                            <CheckCircle className="text-green-600" size={24} />
                                        )}
                                        <h3 className="font-semibold text-gray-800">Maintenance Status</h3>
                                    </div>
                                    <p className={`text-sm ${fullVehicle.maintenanceDue ? 'text-red-700' : 'text-green-700'}`}>
                                        {fullVehicle.maintenanceDue ? 'Maintenance Due!' : 'Up to date'}
                                    </p>
                                </div>

                                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <DollarSign className="text-blue-600" size={24} />
                                        <h3 className="font-semibold text-gray-800">Total Maintenance Cost</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-900">
                                        ${fullVehicle.totalMaintenanceCost?.toLocaleString() || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Next Maintenance */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Next Scheduled Maintenance</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">By Date</p>
                                        <p className="font-medium">
                                            {fullVehicle.nextMaintenanceDate
                                                ? new Date(fullVehicle.nextMaintenanceDate).toLocaleDateString()
                                                : 'Not scheduled'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">By Mileage</p>
                                        <p className="font-medium">
                                            {fullVehicle.nextMaintenanceMileage
                                                ? `${fullVehicle.nextMaintenanceMileage.toLocaleString()} km`
                                                : 'Not scheduled'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Maintenance History */}
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-800">Maintenance History</h3>
                                <button
                                    onClick={() => onMaintenanceClick(fullVehicle)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                                >
                                    <Wrench size={18} />
                                    Add Maintenance
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader size="lg" />
                                </div>
                            ) : fullVehicle.maintenanceHistory && fullVehicle.maintenanceHistory.length > 0 ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {[...fullVehicle.maintenanceHistory]
                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                        .map((record) => (
                                            <div key={record._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <Wrench className="text-green-600" size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800 capitalize">{record.type.replace('-', ' ')}</p>
                                                            <p className="text-sm text-gray-600">{record.description}</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {new Date(record.date).toLocaleDateString()}
                                                                {record.mileageAtService && ` • ${record.mileageAtService.toLocaleString()} km`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-800">${record.cost.toLocaleString()}</p>
                                                        {record.performedBy && (
                                                            <p className="text-xs text-gray-500">{record.performedBy}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Wrench size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>No maintenance records found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader size="lg" />
                                </div>
                            ) : fullVehicle.upcomingLessons && fullVehicle.upcomingLessons.length > 0 ? (
                                <div className="space-y-3">
                                    {fullVehicle.upcomingLessons.map((lesson) => (
                                        <div key={lesson._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <Calendar className="text-blue-600" size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">
                                                            {new Date(lesson.date).toLocaleDateString()} - {lesson.time}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Student: {lesson.studentId?.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Instructor: {lesson.instructorId?.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                    {lesson.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Calendar size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>No upcoming lessons scheduled</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="text-center py-8 text-gray-500">
                            <FileText size={48} className="mx-auto mb-2 opacity-50" />
                            <p>Document management coming soon</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}