// frontend/src/components/lessons/LessonFormModal.js
'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { lessonsAPI, studentsAPI, instructorsAPI, vehiclesAPI } from '@/lib/api';
import { useFetch } from '@/hooks/useFetch';
import Loader from '@/components/Loader';
import { Calendar, Clock, User, Users, Car, MapPin, FileText, AlertCircle } from 'lucide-react';

export default function LessonFormModal({ isOpen, onClose, lesson, onSuccess, setToast }) {
    const [loading, setLoading] = useState(false);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [availabilityStatus, setAvailabilityStatus] = useState(null);
    const [formData, setFormData] = useState({
        studentId: '',
        instructorId: '',
        vehicleId: '',
        date: '',
        time: '',
        duration: 60,
        lessonType: 'practical',
        location: '',
        notes: '',
    });

    const { data: studentsData } = useFetch(() => studentsAPI.getAll({ limit: 100, status: 'active' }));
    const { data: instructorsData } = useFetch(() => instructorsAPI.getAll({ limit: 100, status: 'active' }));
    const { data: vehiclesData } = useFetch(() => vehiclesAPI.getAll({ limit: 100, status: 'available' }));

    useEffect(() => {
        if (lesson) {
            setFormData({
                studentId: lesson.studentId._id || lesson.studentId,
                instructorId: lesson.instructorId._id || lesson.instructorId,
                vehicleId: lesson.vehicleId._id || lesson.vehicleId,
                date: lesson.date.split('T')[0],
                time: lesson.time,
                duration: lesson.duration,
                lessonType: lesson.lessonType,
                location: lesson.location || '',
                notes: lesson.notes || '',
            });
        } else {
            resetForm();
        }
    }, [lesson]);

    const resetForm = () => {
        setFormData({
            studentId: '',
            instructorId: '',
            vehicleId: '',
            date: '',
            time: '',
            duration: 60,
            lessonType: 'practical',
            location: '',
            notes: '',
        });
        setAvailabilityStatus(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Reset availability when critical fields change
        if (['instructorId', 'vehicleId', 'date', 'time'].includes(name)) {
            setAvailabilityStatus(null);
        }
    };

    const checkAvailability = async () => {
        if (!formData.instructorId || !formData.vehicleId || !formData.date || !formData.time) {
            setToast({ type: 'error', message: 'Please fill in instructor, vehicle, date, and time' });
            return;
        }

        setCheckingAvailability(true);
        try {
            const response = await lessonsAPI.checkAvailability({
                instructorId: formData.instructorId,
                vehicleId: formData.vehicleId,
                date: formData.date,
                time: formData.time,
            });

            setAvailabilityStatus(response.data.data);

            if (!response.data.data.available) {
                setToast({
                    type: 'warning',
                    message: 'Schedule conflict detected! Please check the conflicts below.'
                });
            } else {
                setToast({
                    type: 'success',
                    message: 'Instructor and vehicle are available!'
                });
            }
        } catch (error) {
            setToast({ type: 'error', message: 'Failed to check availability' });
        } finally {
            setCheckingAvailability(false);
        }
    };

    const validateForm = () => {
        if (!formData.studentId) {
            setToast({ type: 'error', message: 'Please select a student' });
            return false;
        }
        if (!formData.instructorId) {
            setToast({ type: 'error', message: 'Please select an instructor' });
            return false;
        }
        if (!formData.vehicleId) {
            setToast({ type: 'error', message: 'Please select a vehicle' });
            return false;
        }
        if (!formData.date) {
            setToast({ type: 'error', message: 'Please select a date' });
            return false;
        }
        if (!formData.time) {
            setToast({ type: 'error', message: 'Please select a time' });
            return false;
        }
        if (formData.duration < 30 || formData.duration > 180) {
            setToast({ type: 'error', message: 'Duration must be between 30 and 180 minutes' });
            return false;
        }

        const lessonDate = new Date(`${formData.date}T${formData.time}`);
        if (lessonDate < new Date()) {
            setToast({ type: 'error', message: 'Cannot schedule lessons in the past' });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Check availability first if not already checked
        if (!availabilityStatus && !lesson) {
            setToast({
                type: 'warning',
                message: 'Please check availability before scheduling'
            });
            return;
        }

        if (availabilityStatus && !availabilityStatus.available && !lesson) {
            if (!confirm('There are scheduling conflicts. Do you want to proceed anyway?')) {
                return;
            }
        }

        setLoading(true);
        try {
            if (lesson) {
                await lessonsAPI.update(lesson._id, formData);
                setToast({ type: 'success', message: 'Lesson updated successfully!' });
            } else {
                await lessonsAPI.create(formData);
                setToast({ type: 'success', message: 'Lesson scheduled successfully!' });
            }
            resetForm();
            onSuccess();
            onClose();
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
            title={lesson ? 'Edit Lesson' : 'Schedule New Lesson'}
            size="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student & Instructor Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Student <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Student</option>
                                {studentsData?.data?.map((student) => (
                                    <option key={student._id} value={student._id}>
                                        {student.name} - {student.licenseType}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instructor <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                name="instructorId"
                                value={formData.instructorId}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Instructor</option>
                                {instructorsData?.data?.map((instructor) => (
                                    <option key={instructor._id} value={instructor._id}>
                                        {instructor.name} ({instructor.specialization})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Vehicle & Lesson Type */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vehicle <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                name="vehicleId"
                                value={formData.vehicleId}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Vehicle</option>
                                {vehiclesData?.data?.map((vehicle) => (
                                    <option key={vehicle._id} value={vehicle._id}>
                                        {vehicle.plateNumber} - {vehicle.model} ({vehicle.transmission})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lesson Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="lessonType"
                            value={formData.lessonType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="theory">Theory</option>
                            <option value="practical">Practical</option>
                            <option value="test-preparation">Test Preparation</option>
                            <option value="road-test">Road Test</option>
                        </select>
                    </div>
                </div>

                {/* Date, Time, Duration */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duration (min) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            required
                            min="30"
                            max="180"
                            step="15"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Availability Check Button & Status */}
                {!lesson && (
                    <div>
                        <button
                            type="button"
                            onClick={checkAvailability}
                            disabled={checkingAvailability}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50"
                        >
                            {checkingAvailability ? (
                                <>
                                    <Loader size="sm" />
                                    <span>Checking...</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={18} />
                                    <span>Check Availability</span>
                                </>
                            )}
                        </button>

                        {/* Availability Status Display */}
                        {availabilityStatus && (
                            <div className={`mt-4 p-4 rounded-lg border-2 ${
                                availabilityStatus.available
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                            }`}>
                                <div className="flex items-start gap-3">
                                    {availabilityStatus.available ? (
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <AlertCircle className="text-green-600" size={20} />
                                        </div>
                                    ) : (
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <AlertCircle className="text-red-600" size={20} />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className={`font-semibold mb-2 ${
                                            availabilityStatus.available ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                            {availabilityStatus.available
                                                ? '✓ Available - No conflicts detected'
                                                : '⚠ Conflicts Detected'
                                            }
                                        </p>
                                        {!availabilityStatus.available && availabilityStatus.conflicts?.length > 0 && (
                                            <div className="space-y-2">
                                                {availabilityStatus.conflicts.map((conflict, idx) => (
                                                    <div key={idx} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                                                        {conflict.instructor && (
                                                            <p>• Instructor {conflict.instructor} is busy at {conflict.time}</p>
                                                        )}
                                                        {conflict.vehicle && (
                                                            <p>• Vehicle {conflict.vehicle} is booked at {conflict.time}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., School parking lot, Main road"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            maxLength={500}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Additional notes or special instructions..."
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {formData.notes.length}/500 characters
                    </p>
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
                                <span>{lesson ? 'Updating...' : 'Scheduling...'}</span>
                            </>
                        ) : (
                            <span>{lesson ? 'Update Lesson' : 'Schedule Lesson'}</span>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}