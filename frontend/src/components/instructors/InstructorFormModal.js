// frontend/src/components/instructors/InstructorFormModal.js
'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { instructorsAPI } from '@/lib/api';
import Loader from '@/components/Loader';
import { User, Mail, Phone, Award, FileText, Calendar, Briefcase, IdCard } from 'lucide-react';

export default function InstructorFormModal({ isOpen, onClose, instructor, onSuccess, setToast }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        licenseNumber: '',
        experienceYears: 0,
        specialization: 'both',
        dateOfBirth: '',
        hireDate: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        status: 'active',
        qualifications: '',
        notes: '',
    });

    useEffect(() => {
        if (instructor) {
            setFormData({
                name: instructor.name || '',
                email: instructor.email || '',
                phone: instructor.phone || '',
                licenseNumber: instructor.licenseNumber || '',
                experienceYears: instructor.experienceYears || 0,
                specialization: instructor.specialization || 'both',
                dateOfBirth: instructor.dateOfBirth?.split('T')[0] || '',
                hireDate: instructor.hireDate?.split('T')[0] || '',
                address: instructor.address || '',
                emergencyContact: instructor.emergencyContact || '',
                emergencyPhone: instructor.emergencyPhone || '',
                status: instructor.status || 'active',
                qualifications: instructor.qualifications || '',
                notes: instructor.notes || '',
            });
        } else {
            resetForm();
        }
    }, [instructor]);

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            licenseNumber: '',
            experienceYears: 0,
            specialization: 'both',
            dateOfBirth: '',
            hireDate: '',
            address: '',
            emergencyContact: '',
            emergencyPhone: '',
            status: 'active',
            qualifications: '',
            notes: '',
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.name.trim() || formData.name.length < 2) {
            setToast({ type: 'error', message: 'Name must be at least 2 characters' });
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setToast({ type: 'error', message: 'Please enter a valid email address' });
            return false;
        }

        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(formData.phone)) {
            setToast({ type: 'error', message: 'Phone must be 10-15 digits' });
            return false;
        }

        if (formData.experienceYears < 0 || formData.experienceYears > 50) {
            setToast({ type: 'error', message: 'Experience must be between 0 and 50 years' });
            return false;
        }

        if (formData.dateOfBirth) {
            const birthDate = new Date(formData.dateOfBirth);
            const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
            if (age < 21 || age > 75) {
                setToast({ type: 'error', message: 'Instructor age must be between 21 and 75 years' });
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            if (instructor) {
                await instructorsAPI.update(instructor._id, formData);
                setToast({ type: 'success', message: 'Instructor updated successfully!' });
            } else {
                await instructorsAPI.create(formData);
                setToast({ type: 'success', message: 'Instructor created successfully!' });
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={instructor ? 'Edit Instructor' : 'Add New Instructor'}
            size="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <User size={20} className="text-blue-600" />
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date of Birth
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Mail size={20} className="text-blue-600" />
                        Contact Information
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="1234567890"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="2"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="123 Main St, City, Country"
                            />
                        </div>
                    </div>
                </div>

                {/* Professional Information */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Award size={20} className="text-blue-600" />
                        Professional Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                License Number
                            </label>
                            <div className="relative">
                                <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="licenseNumber"
                                    value={formData.licenseNumber}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="DL-123456"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Experience (Years) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    name="experienceYears"
                                    value={formData.experienceYears}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    max="50"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Specialization <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="manual">Manual Transmission</option>
                                <option value="automatic">Automatic Transmission</option>
                                <option value="both">Both</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hire Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    name="hireDate"
                                    value={formData.hireDate}
                                    onChange={handleChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Qualifications
                        </label>
                        <textarea
                            name="qualifications"
                            value={formData.qualifications}
                            onChange={handleChange}
                            rows="2"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="List certifications, special training, etc."
                        />
                    </div>
                </div>

                {/* Emergency Contact */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Phone size={20} className="text-red-600" />
                        Emergency Contact
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Name
                            </label>
                            <input
                                type="text"
                                name="emergencyContact"
                                value={formData.emergencyContact}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Emergency contact name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Phone
                            </label>
                            <input
                                type="tel"
                                name="emergencyPhone"
                                value={formData.emergencyPhone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Emergency phone number"
                            />
                        </div>
                    </div>
                </div>

                {/* Status & Notes */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-blue-600" />
                        Status & Notes
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="on-leave">On Leave</option>
                                <option value="terminated">Terminated</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Notes
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="3"
                                maxLength={500}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Any special notes about this instructor..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.notes.length}/500 characters
                            </p>
                        </div>
                    </div>
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
                                <span>{instructor ? 'Updating...' : 'Creating...'}</span>
                            </>
                        ) : (
                            <span>{instructor ? 'Update Instructor' : 'Create Instructor'}</span>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}