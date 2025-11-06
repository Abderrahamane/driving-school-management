// frontend/src/components/students/StudentDetailsModal.js
'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import Modal from '@/components/Modal';
import Loader from '@/components/Loader';
import { lessonsAPI, paymentsAPI } from '@/lib/api';
import {
    User, Mail, Phone, MapPin, Calendar, Award, BookOpen, Car, DollarSign,
    CheckCircle, XCircle, Clock, Edit, TrendingUp, FileText
} from 'lucide-react';

export default function StudentDetailsModal({ isOpen, onClose, student, onEdit, setToast }) {
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch student's lessons
    const { data: lessonsData, loading: lessonsLoading } = useFetch(
        () => lessonsAPI.getAll({ studentId: student?._id, limit: 50 }),
        [student?._id]
    );

    // Fetch student's payments
    const { data: paymentsData, loading: paymentsLoading } = useFetch(
        () => paymentsAPI.getStudentPayments(student?._id),
        [student?._id]
    );

    if (!student) return null;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <User size={18} /> },
        { id: 'progress', label: 'Progress', icon: <TrendingUp size={18} /> },
        { id: 'lessons', label: 'Lessons', icon: <Calendar size={18} /> },
        { id: 'payments', label: 'Payments', icon: <DollarSign size={18} /> },
    ];

    const age = student.dateOfBirth
        ? Math.floor((new Date() - new Date(student.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
        : 'N/A';

    const statusColors = {
        active: 'bg-green-100 text-green-800',
        completed: 'bg-blue-100 text-blue-800',
        suspended: 'bg-red-100 text-red-800',
        dropped: 'bg-gray-100 text-gray-800',
    };

    const lessonStatusColors = {
        scheduled: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    const completedLessons = lessonsData?.data?.filter(l => l.status === 'completed').length || 0;
    const scheduledLessons = lessonsData?.data?.filter(l => l.status === 'scheduled').length || 0;
    const cancelledLessons = lessonsData?.data?.filter(l => l.status === 'cancelled').length || 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
            <div className="space-y-6">
                {/* Header with Student Info */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold">
                                {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-1">{student.name}</h2>
                                <p className="text-blue-100 mb-2">{student.email}</p>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[student.status]} bg-white/90`}>
                                        {student.status}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm">
                                        License Type {student.licenseType}
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

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <div className="flex gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
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
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Personal Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <User size={18} className="text-blue-600" />
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
                                                {student.dateOfBirth
                                                    ? new Date(student.dateOfBirth).toLocaleDateString()
                                                    : 'Not provided'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Registration Date</p>
                                            <p className="font-medium">
                                                {new Date(student.registrationDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Phone size={18} className="text-blue-600" />
                                        Contact Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-600">Phone</p>
                                            <p className="font-medium">{student.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Email</p>
                                            <p className="font-medium">{student.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Address</p>
                                            <p className="font-medium">{student.address || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {student.notes && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        <FileText size={18} className="text-yellow-600" />
                                        Notes
                                    </h3>
                                    <p className="text-sm text-gray-700">{student.notes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'progress' && (
                        <div className="space-y-6">
                            {/* Progress Overview Cards */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-blue-600 rounded-lg">
                                            <BookOpen className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-800">Theory Lessons</p>
                                            <h3 className="text-3xl font-bold text-blue-900">
                                                {student.progress?.theoryLessons || 0}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {student.progress?.theoryTestPassed ? (
                                            <CheckCircle className="text-green-600" size={20} />
                                        ) : (
                                            <XCircle className="text-gray-400" size={20} />
                                        )}
                                        <span className="text-sm font-medium text-blue-800">
                                            Theory Test {student.progress?.theoryTestPassed ? 'Passed' : 'Pending'}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-green-600 rounded-lg">
                                            <Car className="text-white" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-green-800">Practical Lessons</p>
                                            <h3 className="text-3xl font-bold text-green-900">
                                                {student.progress?.practicalLessons || 0}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {student.progress?.practicalTestPassed ? (
                                            <CheckCircle className="text-green-600" size={20} />
                                        ) : (
                                            <XCircle className="text-gray-400" size={20} />
                                        )}
                                        <span className="text-sm font-medium text-green-800">
                                            Practical Test {student.progress?.practicalTestPassed ? 'Passed' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bars */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Learning Progress</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm text-gray-600">Theory Progress</span>
                                            <span className="text-sm font-semibold text-gray-800">
                                                {Math.min((student.progress?.theoryLessons || 0) * 10, 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-blue-600 h-3 rounded-full transition-all"
                                                style={{ width: `${Math.min((student.progress?.theoryLessons || 0) * 10, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm text-gray-600">Practical Progress</span>
                                            <span className="text-sm font-semibold text-gray-800">
                                                {Math.min((student.progress?.practicalLessons || 0) * 5, 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-green-600 h-3 rounded-full transition-all"
                                                style={{ width: `${Math.min((student.progress?.practicalLessons || 0) * 5, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'lessons' && (
                        <div className="space-y-4">
                            {/* Lessons Summary */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-blue-800 mb-1">Scheduled</p>
                                    <p className="text-2xl font-bold text-blue-900">{scheduledLessons}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-green-800 mb-1">Completed</p>
                                    <p className="text-2xl font-bold text-green-900">{completedLessons}</p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-red-800 mb-1">Cancelled</p>
                                    <p className="text-2xl font-bold text-red-900">{cancelledLessons}</p>
                                </div>
                            </div>

                            {/* Lessons List */}
                            {lessonsLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader size="lg" />
                                </div>
                            ) : lessonsData?.data?.length > 0 ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {lessonsData.data.map((lesson) => (
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
                                                            {lesson.instructorId?.name} • {lesson.vehicleId?.plateNumber}
                                                        </p>
                                                        <p className="text-xs text-gray-500 capitalize">{lesson.lessonType}</p>
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

                    {activeTab === 'payments' && (
                        <div className="space-y-4">
                            {/* Payment Summary */}
                            {paymentsData?.data && (
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-green-50 rounded-lg p-4 text-center">
                                        <p className="text-sm text-green-800 mb-1">Total Paid</p>
                                        <p className="text-2xl font-bold text-green-900">
                                            ${paymentsData.data.summary?.totalPaid?.toLocaleString() || 0}
                                        </p>
                                    </div>
                                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                                        <p className="text-sm text-yellow-800 mb-1">Pending</p>
                                        <p className="text-2xl font-bold text-yellow-900">
                                            ${paymentsData.data.summary?.totalPending?.toLocaleString() || 0}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                                        <p className="text-sm text-blue-800 mb-1">Total Payments</p>
                                        <p className="text-2xl font-bold text-blue-900">
                                            {paymentsData.data.summary?.paymentCount || 0}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Payments List */}
                            {paymentsLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader size="lg" />
                                </div>
                            ) : paymentsData?.data?.payments?.length > 0 ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {paymentsData.data.payments.map((payment) => (
                                        <div key={payment._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${
                                                        payment.status === 'paid' ? 'bg-green-100' : 'bg-yellow-100'
                                                    }`}>
                                                        <DollarSign className={
                                                            payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                                                        } size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">
                                                            ${payment.amount.toLocaleString()}
                                                        </p>
                                                        <p className="text-sm text-gray-600 capitalize">
                                                            {payment.method} • {payment.category}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(payment.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    payment.status === 'paid'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {payment.status}
                                                </span>
                                            </div>
                                            {payment.description && (
                                                <p className="text-xs text-gray-600 mt-2">{payment.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <DollarSign size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>No payments found</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}