// frontend/src/components/vehicles/VehicleFormModal.js
'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { vehiclesAPI } from '@/lib/api';
import Loader from '@/components/Loader';
import { Car, Calendar, Settings, FileText, DollarSign, Shield } from 'lucide-react';

export default function VehicleFormModal({ isOpen, onClose, vehicle, onSuccess, setToast }) {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [formData, setFormData] = useState({
        plateNumber: '',
        model: '',
        manufacturer: '',
        year: new Date().getFullYear(),
        color: '',
        vin: '',
        status: 'available',
        mileage: 0,
        fuelType: 'petrol',
        transmission: 'manual',
        capacity: 5,
        features: [],
        notes: '',
        // Insurance details
        insuranceProvider: '',
        insurancePolicyNumber: '',
        insuranceExpiryDate: '',
        insuranceCoverage: '',
        // Registration details
        registrationNumber: '',
        registrationExpiryDate: '',
        registrationState: '',
        // Maintenance
        nextMaintenanceDate: '',
        nextMaintenanceMileage: '',
        // Purchase info
        purchaseDate: '',
        purchasePrice: '',
        dealer: '',
    });

    useEffect(() => {
        if (vehicle) {
            setFormData({
                plateNumber: vehicle.plateNumber || '',
                model: vehicle.model || '',
                manufacturer: vehicle.manufacturer || '',
                year: vehicle.year || new Date().getFullYear(),
                color: vehicle.color || '',
                vin: vehicle.vin || '',
                status: vehicle.status || 'available',
                mileage: vehicle.mileage || 0,
                fuelType: vehicle.fuelType || 'petrol',
                transmission: vehicle.transmission || 'manual',
                capacity: vehicle.capacity || 5,
                features: vehicle.features || [],
                notes: vehicle.notes || '',
                insuranceProvider: vehicle.insuranceDetails?.provider || '',
                insurancePolicyNumber: vehicle.insuranceDetails?.policyNumber || '',
                insuranceExpiryDate: vehicle.insuranceDetails?.expiryDate?.split('T')[0] || '',
                insuranceCoverage: vehicle.insuranceDetails?.coverage || '',
                registrationNumber: vehicle.registrationDetails?.registrationNumber || '',
                registrationExpiryDate: vehicle.registrationDetails?.expiryDate?.split('T')[0] || '',
                registrationState: vehicle.registrationDetails?.state || '',
                nextMaintenanceDate: vehicle.nextMaintenanceDate?.split('T')[0] || '',
                nextMaintenanceMileage: vehicle.nextMaintenanceMileage || '',
                purchaseDate: vehicle.purchaseInfo?.purchaseDate?.split('T')[0] || '',
                purchasePrice: vehicle.purchaseInfo?.purchasePrice || '',
                dealer: vehicle.purchaseInfo?.dealer || '',
            });
        } else {
            resetForm();
        }
    }, [vehicle]);

    const resetForm = () => {
        setFormData({
            plateNumber: '',
            model: '',
            manufacturer: '',
            year: new Date().getFullYear(),
            color: '',
            vin: '',
            status: 'available',
            mileage: 0,
            fuelType: 'petrol',
            transmission: 'manual',
            capacity: 5,
            features: [],
            notes: '',
            insuranceProvider: '',
            insurancePolicyNumber: '',
            insuranceExpiryDate: '',
            insuranceCoverage: '',
            registrationNumber: '',
            registrationExpiryDate: '',
            registrationState: '',
            nextMaintenanceDate: '',
            nextMaintenanceMileage: '',
            purchaseDate: '',
            purchasePrice: '',
            dealer: '',
        });
        setActiveTab('basic');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.plateNumber.trim() || formData.plateNumber.length < 3) {
            setToast({ type: 'error', message: 'Plate number is required (min 3 characters)' });
            return false;
        }

        if (!formData.model.trim() || formData.model.length < 2) {
            setToast({ type: 'error', message: 'Model is required (min 2 characters)' });
            return false;
        }

        if (formData.year < 1990 || formData.year > new Date().getFullYear() + 1) {
            setToast({ type: 'error', message: `Year must be between 1990 and ${new Date().getFullYear() + 1}` });
            return false;
        }

        if (formData.mileage < 0) {
            setToast({ type: 'error', message: 'Mileage cannot be negative' });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            // Prepare data for API
            const apiData = {
                plateNumber: formData.plateNumber.toUpperCase(),
                model: formData.model,
                manufacturer: formData.manufacturer,
                year: parseInt(formData.year),
                color: formData.color,
                vin: formData.vin ? formData.vin.toUpperCase() : undefined,
                status: formData.status,
                mileage: parseInt(formData.mileage),
                fuelType: formData.fuelType,
                transmission: formData.transmission,
                capacity: parseInt(formData.capacity),
                features: formData.features,
                notes: formData.notes,
                insuranceDetails: {
                    provider: formData.insuranceProvider,
                    policyNumber: formData.insurancePolicyNumber,
                    expiryDate: formData.insuranceExpiryDate || undefined,
                    coverage: formData.insuranceCoverage,
                },
                registrationDetails: {
                    registrationNumber: formData.registrationNumber,
                    expiryDate: formData.registrationExpiryDate || undefined,
                    state: formData.registrationState,
                },
                nextMaintenanceDate: formData.nextMaintenanceDate || undefined,
                nextMaintenanceMileage: formData.nextMaintenanceMileage ? parseInt(formData.nextMaintenanceMileage) : undefined,
                purchaseInfo: {
                    purchaseDate: formData.purchaseDate || undefined,
                    purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
                    dealer: formData.dealer,
                },
            };

            if (vehicle) {
                await vehiclesAPI.update(vehicle._id, apiData);
                setToast({ type: 'success', message: 'Vehicle updated successfully!' });
            } else {
                await vehiclesAPI.create(apiData);
                setToast({ type: 'success', message: 'Vehicle created successfully!' });
            }
            resetForm();
            onSuccess();
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Operation failed';
            setToast({ type: 'error', message: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: <Car size={18} /> },
        { id: 'insurance', label: 'Insurance', icon: <Shield size={18} /> },
        { id: 'maintenance', label: 'Maintenance', icon: <Settings size={18} /> },
        { id: 'purchase', label: 'Purchase', icon: <DollarSign size={18} /> },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            size="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <div className="flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                                    activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600 font-semibold'
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
                    {activeTab === 'basic' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Plate Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="plateNumber"
                                        value={formData.plateNumber}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                                        placeholder="ABC-1234"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        VIN (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="vin"
                                        value={formData.vin}
                                        onChange={handleChange}
                                        maxLength={17}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                                        placeholder="1HGBH41JXMN109186"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Manufacturer
                                    </label>
                                    <input
                                        type="text"
                                        name="manufacturer"
                                        value={formData.manufacturer}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Toyota"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Model <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Corolla"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Year <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        required
                                        min="1990"
                                        max={new Date().getFullYear() + 1}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Color
                                    </label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="White"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Mileage (km)
                                    </label>
                                    <input
                                        type="number"
                                        name="mileage"
                                        value={formData.mileage}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fuel Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="fuelType"
                                        value={formData.fuelType}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="petrol">Petrol</option>
                                        <option value="diesel">Diesel</option>
                                        <option value="electric">Electric</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Transmission <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="transmission"
                                        value={formData.transmission}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="manual">Manual</option>
                                        <option value="automatic">Automatic</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Seating Capacity
                                    </label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        min="2"
                                        max="9"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="available">Available</option>
                                    <option value="in-use">In Use</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="retired">Retired</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    maxLength={1000}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Additional notes about this vehicle..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.notes.length}/1000 characters
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'insurance' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Insurance Provider
                                    </label>
                                    <input
                                        type="text"
                                        name="insuranceProvider"
                                        value={formData.insuranceProvider}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="ABC Insurance Co."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Policy Number
                                    </label>
                                    <input
                                        type="text"
                                        name="insurancePolicyNumber"
                                        value={formData.insurancePolicyNumber}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="POL-123456"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        name="insuranceExpiryDate"
                                        value={formData.insuranceExpiryDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Coverage Type
                                    </label>
                                    <input
                                        type="text"
                                        name="insuranceCoverage"
                                        value={formData.insuranceCoverage}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Comprehensive"
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Registration Details</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Registration Number
                                            </label>
                                            <input
                                                type="text"
                                                name="registrationNumber"
                                                value={formData.registrationNumber}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="REG-123456"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                State/Province
                                            </label>
                                            <input
                                                type="text"
                                                name="registrationState"
                                                value={formData.registrationState}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="California"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Registration Expiry Date
                                        </label>
                                        <input
                                            type="date"
                                            name="registrationExpiryDate"
                                            value={formData.registrationExpiryDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'maintenance' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> Set maintenance reminders based on date or mileage
                                </p>
                            </div>

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
                                        placeholder="e.g., 50000"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'purchase' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Purchase Date
                                    </label>
                                    <input
                                        type="date"
                                        name="purchaseDate"
                                        value={formData.purchaseDate}
                                        onChange={handleChange}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Purchase Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        name="purchasePrice"
                                        value={formData.purchasePrice}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="25000.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dealer/Seller
                                </label>
                                <input
                                    type="text"
                                    name="dealer"
                                    value={formData.dealer}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="ABC Motors"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={handleClose}
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
                                <span>{vehicle ? 'Updating...' : 'Creating...'}</span>
                            </>
                        ) : (
                            <span>{vehicle ? 'Update Vehicle' : 'Create Vehicle'}</span>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}