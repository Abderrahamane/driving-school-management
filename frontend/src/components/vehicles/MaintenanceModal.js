// frontend/src/components/vehicles/MaintenanceModal.js
'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import { vehiclesAPI } from '@/lib/api';
import Loader from '@/components/Loader';
import { Wrench, DollarSign, Calendar, FileText } from 'lucide-react';

export default function MaintenanceModal({ isOpen, onClose, vehicle, onSuccess, setToast }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'oil-change',
        description: '',
        cost: '',
        performedBy: '',
        date: new Date().toISOString().split('T')[0],
        mileageAtService: vehicle?.mileage || '',
        nextMaintenanceDate: '',
        nextMaintenanceMileage: '',
        notes: '',
        updateStatus: false,
        status: 'maintenance'
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.description.trim()) {
            setToast({ type: 'error', message: 'Description is required' });
            return;
        }

        if (!formData.cost || parseFloat(formData.cost) < 0) {
            setToast({ type: 'error', message: 'Valid cost is required' });
            return;
        }

        setLoading(true);
        try {
            const maintenanceData = {
                type: formData.type,
                description: formData.description,
                cost: parseFloat(formData.cost),
                performedBy: formData.performedBy,
                date: formData.date,
                mileageAtService: parseInt(formData.mileageAtService) || vehicle?.mileage,
                nextMaintenanceDate: formData.nextMaintenanceDate || undefined,
                nextMaintenanceMileage: formData.nextMaintenanceMileage ? parseInt(formData.nextMaintenanceMileage) : undefined,
                notes: formData.notes,
                updateStatus: formData.updateStatus,
                status: formData.updateStatus ? formData.status : undefined
            };

            await vehiclesAPI.addMaintenance(vehicle._id, maintenanceData);
            setToast({ type: 'success', message: 'Maintenance record added successfully!' });
            onSuccess();
            onClose();
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.error || 'Failed to add maintenance record' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Maintenance Record"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Vehicle Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Wrench className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{vehicle?.plateNumber}</p>
                            <p className="text-sm text-gray-600">
                                {vehicle?.manufacturer} {vehicle?.model} • Current Mileage: {vehicle?.mileage?.toLocaleString()} km
                            </p>
                        </div>
                    </div>
                </div>

                {/* Maintenance Type & Description */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maintenance Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="oil-change">Oil Change</option>
                            <option value="tire-replacement">Tire Replacement</option>
                            <option value="brake-service">Brake Service</option>
                            <option value="inspection">Inspection</option>
                            <option value="repair">Repair</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the maintenance work performed..."
                        />
                    </div>
                </div>

                {/* Date & Cost */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cost ($) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="number"
                                name="cost"
                                value={formData.cost}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                {/* Performed By & Mileage */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Performed By
                        </label>
                        <input
                            type="text"
                            name="performedBy"
                            value={formData.performedBy}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Mechanic/Service center name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mileage at Service (km)
                        </label>
                        <input
                            type="number"
                            name="mileageAtService"
                            value={formData.mileageAtService}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Next Maintenance */}
                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Schedule Next Maintenance</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Next Maintenance Date
                            </label>
                            <input
                                type="date"
                                name="nextMaintenanceDate"
                                value={formData.nextMaintenanceDate}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Next Maintenance Mileage (km)
                            </label>
                            <input
                                type="number"
                                name="nextMaintenanceMileage"
                                value={formData.nextMaintenanceMileage}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., 55000"
                            />
                        </div>
                    </div>
                </div>

                {/* Additional Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="2"
                        maxLength={500}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Any additional notes or observations..."
                    />
                </div>

                {/* Update Vehicle Status */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="updateStatus"
                            checked={formData.updateStatus}
                            onChange={handleChange}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                            <p className="font-medium text-gray-800">Update vehicle status</p>
                            <p className="text-sm text-gray-600">Mark vehicle as under maintenance</p>
                        </div>
                    </label>
                    {formData.updateStatus && (
                        <div className="mt-3">
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="maintenance">Maintenance</option>
                                <option value="available">Available</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader size="sm" />
                                <span>Adding...</span>
                            </>
                        ) : (
                            <>
                                <Wrench size={18} />
                                <span>Add Maintenance Record</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}