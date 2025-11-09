// frontend/src/components/lessons/LessonDetailsModal.js
'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import { lessonsAPI } from '@/lib/api';
import Loader from '@/components/Loader';
import {
    User, Users, Car, Calendar, Clock, MapPin, FileText, Edit,
    CheckCircle, XCircle, AlertCircle, Star, Phone, Mail, Award
} from 'lucide-react';

export default function LessonDetailsModal({ isOpen, onClose, lesson, onEdit, onComplete, setToast }) {
    const [activeTab, setActiveTab] = useState('details');
    const [completing, setCompleting] = useState(false);
    const [completionNotes, setCompletionNotes] = useState('');
    const [rating, setRating] = useState(0);

    if (!lesson) return null;

    const tabs = [
        { id: 'details', label: 'Details', icon: <FileText size={18} /> },
        { id: 'participants', label: 'Participants', icon: <Users size={18} /> },
        { id: 'complete', label: 'Complete', icon: <CheckCircle size={18} /> },
    ];

    const statusColors = {
        scheduled: 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        'no-show': 'bg-gray-100 text-gray-800',
    };

    const typeColors = {
        theory: 'bg-purple-100 text-purple-800',
        practical: 'bg-blue-100 text-blue-800',
        'test-preparation': 'bg-orange-100 text-orange-800',
        'road-test': 'bg-red-100 text-red-800',
    };

    const handleCompleteLesson = async () => {
        if (!completionNotes.trim()) {
            setToast({ type: 'error', message: 'Please add completion notes' });
            return;
        }

        setCompleting(true);
        try {
            await lessonsAPI.complete(lesson._id, {
                notes: completionNotes,
                rating: rating || undefined,
            });
            setToast({ type: 'success', message: 'Lesson completed successfully!' });
            onClose();
            if (onComplete) onComplete(lesson._id);
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.error || 'Failed to complete lesson' });
        } finally {
            setCompleting(false);
        }
    };

    const lessonDateTime = new Date(`${lesson.date.split('T')[0]}T${lesson.time}`);
    const isPastLesson = lessonDateTime < new Date();
    const canComplete = lesson.status === 'scheduled' || lesson.status === 'in-progress';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Calendar size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-1">
                                    {lesson.lessonType.replace('-', ' ').toUpperCase()} Lesson
                                </h2>
                                <p className="text-blue-100 mb-2">
                                    {new Date(lesson.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })} at {lesson.time}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[lesson.status]} bg-white/90`}>
                                        {lesson.status}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[lesson.lessonType]} bg-white/90`}>
                                        {lesson.lessonType.replace('-', ' ')}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm">
                                        {lesson.duration} minutes
                                    </span>
                                </div>
                            </div>
                        </div>
                        {canComplete && (
                            <button
                                onClick={onEdit}
                                className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all"
                            >
                                <Edit size={18} />
                                Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <User className="text-white" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-blue-800">Student</p>
                                <p className="text-sm font-semibold text-blue-900">{lesson.studentId?.name}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-600 rounded-lg">
                                <Users className="text-white" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-green-800">Instructor</p>
                                <p className="text-sm font-semibold text-green-900">{lesson.instructorId?.name}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-600 rounded-lg">
                                <Car className="text-white" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-purple-800">Vehicle</p>
                                <p className="text-sm font-semibold text-purple-900">{lesson.vehicleId?.plateNumber}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <div className="flex gap-1">
                        {tabs.map((tab) => {
                            // Hide complete tab if lesson is already completed or cancelled
                            if (tab.id === 'complete' && !canComplete) return null;

                            return (
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
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            {/* Time & Duration */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Clock size={20} className="text-blue-600" />
                                    Schedule Information
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Date</p>
                                        <p className="font-medium text-gray-800">
                                            {new Date(lesson.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Time</p>
                                        <p className="font-medium text-gray-800">{lesson.time}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Duration</p>
                                        <p className="font-medium text-gray-800">{lesson.duration} minutes</p>
                                    </div>
                                </div>
                                {isPastLesson && lesson.status === 'scheduled' && (
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                                        <AlertCircle className="text-yellow-600 mt-0.5" size={18} />
                                        <div>
                                            <p className="text-sm font-semibold text-yellow-800">Past Lesson</p>
                                            <p className="text-xs text-yellow-700">This lesson was scheduled in the past. Please update the status.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Location */}
                            {lesson.location && (
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <MapPin size={20} className="text-blue-600" />
                                        Location
                                    </h3>
                                    <p className="text-gray-700">{lesson.location}</p>
                                </div>
                            )}

                            {/* Notes */}
                            {lesson.notes && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <FileText size={20} className="text-yellow-600" />
                                        Notes
                                    </h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{lesson.notes}</p>
                                </div>
                            )}

                            {/* Cancellation Reason */}
                            {lesson.cancellationReason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <AlertCircle size={20} className="text-red-600" />
                                        Cancellation Reason
                                    </h3>
                                    <p className="text-red-700">{lesson.cancellationReason}</p>
                                </div>
                            )}

                            {/* Rating */}
                            {lesson.rating && (
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <Star size={20} className="text-yellow-600" />
                                        Lesson Rating
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={24}
                                                className={`${
                                                    star <= lesson.rating
                                                        ? 'text-yellow-500 fill-current'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                        <span className="ml-2 text-lg font-semibold text-gray-800">
                                            {lesson.rating}/5
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'participants' && (
                        <div className="space-y-6">
                            {/* Student Info */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <User size={20} className="text-blue-600" />
                                        Student Information
                                    </h3>
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {lesson.studentId?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-gray-800">{lesson.studentId?.name}</p>
                                        <p className="text-sm text-gray-600">License Type: {lesson.studentId?.licenseType}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-blue-600" />
                                        <span className="text-sm text-gray-700">{lesson.studentId?.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-blue-600" />
                                        <span className="text-sm text-gray-700">{lesson.studentId?.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Instructor Info */}
                            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <Users size={20} className="text-green-600" />
                                        Instructor Information
                                    </h3>
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {lesson.instructorId?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-gray-800">{lesson.instructorId?.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {lesson.instructorId?.experienceYears} years experience
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-green-600" />
                                        <span className="text-sm text-gray-700">{lesson.instructorId?.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-green-600" />
                                        <span className="text-sm text-gray-700">{lesson.instructorId?.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Info */}
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <Car size={20} className="text-purple-600" />
                                        Vehicle Information
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Plate Number</span>
                                        <span className="text-sm font-semibold text-gray-800">{lesson.vehicleId?.plateNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Model</span>
                                        <span className="text-sm font-semibold text-gray-800">{lesson.vehicleId?.model}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Year</span>
                                        <span className="text-sm font-semibold text-gray-800">{lesson.vehicleId?.year}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Transmission</span>
                                        <span className="text-sm font-semibold text-gray-800 capitalize">{lesson.vehicleId?.transmission}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Fuel Type</span>
                                        <span className="text-sm font-semibold text-gray-800 capitalize">{lesson.vehicleId?.fuelType}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'complete' && canComplete && (
                        <div className="space-y-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <div className="flex items-start gap-3 mb-4">
                                    <CheckCircle className="text-green-600 mt-1" size={24} />
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-1">Complete This Lesson</h3>
                                        <p className="text-sm text-gray-600">
                                            Mark this lesson as completed and add any relevant notes or feedback.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Rate This Lesson (Optional)
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="transition-all transform hover:scale-110"
                                        >
                                            <Star
                                                size={32}
                                                className={`${
                                                    star <= rating
                                                        ? 'text-yellow-500 fill-current'
                                                        : 'text-gray-300 hover:text-yellow-400'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                    {rating > 0 && (
                                        <span className="ml-3 text-lg font-semibold text-gray-800">
                                            {rating}/5
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Completion Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Completion Notes <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={completionNotes}
                                    onChange={(e) => setCompletionNotes(e.target.value)}
                                    rows="6"
                                    maxLength={500}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Add notes about the lesson: student performance, areas for improvement, skills practiced, etc."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {completionNotes.length}/500 characters
                                </p>
                            </div>

                            {/* Complete Button */}
                            <button
                                onClick={handleCompleteLesson}
                                disabled={completing || !completionNotes.trim()}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 font-medium transition-all disabled:opacity-50 shadow-lg"
                            >
                                {completing ? (
                                    <>
                                        <Loader size="sm" />
                                        <span>Completing...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={20} />
                                        <span>Complete Lesson</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                {lesson.status === 'completed' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="text-green-600" size={24} />
                            <div>
                                <p className="font-semibold text-green-800">Lesson Completed</p>
                                <p className="text-sm text-green-700">
                                    This lesson was marked as completed on{' '}
                                    {lesson.updatedAt ? new Date(lesson.updatedAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {lesson.status === 'cancelled' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <XCircle className="text-red-600" size={24} />
                            <div>
                                <p className="font-semibold text-red-800">Lesson Cancelled</p>
                                <p className="text-sm text-red-700">This lesson has been cancelled</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}