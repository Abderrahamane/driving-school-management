// frontend/src/components/instructors/InstructorDetailsModal.js
'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import Modal from '@/components/Modal';
import Loader from '@/components/Loader';
import { lessonsAPI } from '@/lib/api';
import {
    User, Mail, Phone, MapPin, Calendar, Award, Briefcase, Star, Clock,
    CheckCircle, XCircle, TrendingUp, FileText, Edit, IdCard, AlertCircle
} from 'lucide-react';

export default function InstructorDetailsModal({ isOpen, onClose, instructor, onEdit, setToast }) {
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch instructor's lessons
    const { data: lessonsData, loading: lessonsLoading } = useFetch(
        () => lessonsAPI.getAll({ instructorId: instructor?._id, limit: 50 }),
        [instructor?._id]
    );

    if (!instructor) return null;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <User size={18} /> },
        { id: 'performance', label: 'Performance', icon: <TrendingUp size={18} /> },
        { id: 'schedule', label: 'Schedule', icon: <Calendar size={18} /> },
        { id: 'reviews', label: 'Reviews', icon: <Star size={18} /> },
    ];

    const age = instructor.dateOfBirth
        ? Math.floor((new Date() - new Date(instructor.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
        : 'N/A';

    const statusColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        'on-leave': 'bg-yellow-100 text-yellow-800',
        terminated: 'bg-red-100 text-red-800',
    };

    const lessonStatusColors = {
        scheduled: 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    const completedLessons = lessonsData?.data?.filter(l => l.status === 'completed').length || 0;
    const scheduledLessons = lessonsData?.data?.filter(l => l.status === 'scheduled').length || 0;
    const cancelledLessons = lessonsData?.data?.filter(l => l.status === 'cancelled').length || 0;

    // Mock reviews data (in production, fetch from API)
    const reviews = [
        { id: 1, studentName: 'Alice Johnson', rating: 5, comment: 'Excellent instructor! Very patient and knowledgeable.', date: '2025-11-05' },
        { id: 2, studentName: 'Bob Smith', rating: 4, comment: 'Great teaching methods, helped me pass on first try.', date: '2025-11-01' },
        { id: 3, studentName: 'Carol White', rating: 5, comment: 'Professional and friendly. Highly recommended!', date: '2025-10-28' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
            <div className="space-y-6">
                {/* Header with Instructor Info */}
                <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold">
                                {instructor.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-1">{instructor.name}</h2>
                                <p className="text-green-100 mb-2">{instructor.email}</p>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[instructor.status]} bg-white/90`}>
                                        {instructor.status}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm capitalize">
                                        {instructor.specialization || 'Both'}
                                    </span>
                                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                                        <Star size={14} className="fill-current" />
                                        <span className="text-xs font-semibold">
                                            {instructor.stats?.avgRating?.toFixed(1) || 'N/A'}
                                        </span>
                                    </div>
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
                        <Calendar size={24} className="mx-auto text-blue-600 mb-2" />
                        <p className="text-2xl font-bold text-blue-900">{instructor.stats?.totalLessons || 0}</p>
                        <p className="text-xs text-blue-800">Total Lessons</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                        <CheckCircle size={24} className="mx-auto text-green-600 mb-2" />
                        <p className="text-2xl font-bold text-green-900">{completedLessons}</p>
                        <p className="text-xs text-green-800">Completed</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                        <Award size={24} className="mx-auto text-purple-600 mb-2" />
                        <p className="text-2xl font-bold text-purple-900">{instructor.experienceYears}y</p>
                        <p className="text-xs text-purple-800">Experience</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center">
                        <Star size={24} className="mx-auto text-yellow-600 mb-2" />
                        <p className="text-2xl font-bold text-yellow-900">{instructor.stats?.totalReviews || 0}</p>
                        <p className="text-xs text-yellow-800">Reviews</p>
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
                                {/* Personal Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <User size={18} className="text-green-600" />
                                        Personal Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-600">Age</p>
                                            <p className="font-medium">{age} years old</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Date of Birth</p>
                                            <p className="font-medium">
                                                {instructor.dateOfBirth
                                                    ? new Date(instructor.dateOfBirth).toLocaleDateString()
                                                    : 'Not provided'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Hire Date</p>
                                            <p className="font-medium">
                                                {instructor.hireDate
                                                    ? new Date(instructor.hireDate).toLocaleDateString()
                                                    : 'Not provided'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Phone size={18} className="text-green-600" />
                                        Contact Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-600">Phone</p>
                                            <p className="font-medium">{instructor.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Email</p>
                                            <p className="font-medium">{instructor.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Address</p>
                                            <p className="font-medium">{instructor.address || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Details */}
                            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Briefcase size={18} className="text-green-600" />
                                    Professional Details
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">License Number</p>
                                        <p className="font-medium text-gray-800">{instructor.licenseNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Experience</p>
                                        <p className="font-medium text-gray-800">{instructor.experienceYears} years</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Specialization</p>
                                        <p className="font-medium text-gray-800 capitalize">{instructor.specialization || 'Both'}</p>
                                    </div>
                                </div>
                                {instructor.qualifications && (
                                    <div className="mt-4">
                                        <p className="text-xs text-gray-600 mb-1">Qualifications</p>
                                        <p className="text-sm text-gray-700">{instructor.qualifications}</p>
                                    </div>
                                )}
                            </div>

                            {/* Emergency Contact */}
                            {(instructor.emergencyContact || instructor.emergencyPhone) && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <AlertCircle size={18} className="text-red-600" />
                                        Emergency Contact
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-600">Contact Name</p>
                                            <p className="font-medium">{instructor.emergencyContact || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Contact Phone</p>
                                            <p className="font-medium">{instructor.emergencyPhone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {instructor.notes && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        <FileText size={18} className="text-yellow-600" />
                                        Notes
                                    </h3>
                                    <p className="text-sm text-gray-700">{instructor.notes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'performance' && (
                        <div className="space-y-6">
                            {/* Performance Metrics */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-blue-600 rounded-lg">
                                            <CheckCircle className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-800">Completion Rate</p>
                                            <h3 className="text-3xl font-bold text-blue-900">
                                                {completedLessons && instructor.stats?.totalLessons
                                                    ? Math.round((completedLessons / instructor.stats.totalLessons) * 100)
                                                    : 0}%
                                            </h3>
                                        </div>
                                    </div>
                                    <p className="text-xs text-blue-700">
                                        {completedLessons} of {instructor.stats?.totalLessons || 0} lessons completed
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-yellow-600 rounded-lg">
                                            <Star className="text-white fill-current" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-yellow-800">Average Rating</p>
                                            <h3 className="text-3xl font-bold text-yellow-900">
                                                {instructor.stats?.avgRating?.toFixed(1) || 'N/A'}
                                            </h3>
                                        </div>
                                    </div>
                                    <p className="text-xs text-yellow-700">
                                        Based on {instructor.stats?.totalReviews || 0} reviews
                                    </p>
                                </div>
                            </div>

                            {/* Lesson Statistics */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Lesson Statistics</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm text-gray-600">Completed Lessons</span>
                                            <span className="text-sm font-semibold text-gray-800">{completedLessons}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${(completedLessons / Math.max(instructor.stats?.totalLessons || 1, 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm text-gray-600">Scheduled Lessons</span>
                                            <span className="text-sm font-semibold text-gray-800">{scheduledLessons}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${(scheduledLessons / Math.max(instructor.stats?.totalLessons || 1, 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm text-gray-600">Cancelled Lessons</span>
                                            <span className="text-sm font-semibold text-gray-800">{cancelledLessons}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-red-600 h-2 rounded-full"
                                                style={{ width: `${(cancelledLessons / Math.max(instructor.stats?.totalLessons || 1, 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="space-y-4">
                            {/* Schedule Summary */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-blue-800 mb-1">Upcoming</p>
                                    <p className="text-2xl font-bold text-blue-900">{scheduledLessons}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-green-800 mb-1">This Week</p>
                                    <p className="text-2xl font-bold text-green-900">
                                        {lessonsData?.data?.filter(l => {
                                            const lessonDate = new Date(l.date);
                                            const today = new Date();
                                            const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                                            return lessonDate >= today && lessonDate <= nextWeek;
                                        }).length || 0}
                                    </p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-purple-800 mb-1">This Month</p>
                                    <p className="text-2xl font-bold text-purple-900">
                                        {lessonsData?.data?.filter(l => {
                                            const lessonDate = new Date(l.date);
                                            const today = new Date();
                                            return lessonDate.getMonth() === today.getMonth() &&
                                                lessonDate.getFullYear() === today.getFullYear();
                                        }).length || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Lessons List */}
                            {lessonsLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader size="lg" />
                                </div>
                            ) : lessonsData?.data?.length > 0 ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {lessonsData.data
                                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                                        .map((lesson) => (
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
                                                                {lesson.studentId?.name} • {lesson.vehicleId?.plateNumber}
                                                            </p>
                                                            <p className="text-xs text-gray-500 capitalize">
                                                                {lesson.lessonType} • {lesson.duration} min
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${lessonStatusColors[lesson.status]}`}>
                                                        {lesson.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Calendar size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>No lessons found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="space-y-4">
                            {/* Reviews Summary */}
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-4xl font-bold text-gray-800 mb-2">
                                            {instructor.stats?.avgRating?.toFixed(1) || 'N/A'}
                                        </h3>
                                        <div className="flex items-center gap-1 mb-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={20}
                                                    className={`${
                                                        star <= Math.round(instructor.stats?.avgRating || 0)
                                                            ? 'text-yellow-500 fill-current'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Based on {instructor.stats?.totalReviews || 0} reviews
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Reviews List */}
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {reviews.map((review) => (
                                    <div key={review.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-800">{review.studentName}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            size={14}
                                                            className={`${
                                                                star <= review.rating
                                                                    ? 'text-yellow-500 fill-current'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {new Date(review.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}