// frontend/src/app/dashboard/admin/lessons/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFetch } from '@/hooks/useFetch';
import { lessonsAPI, studentsAPI, instructorsAPI, vehiclesAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
import LessonFormModal from '@/components/lessons/LessonFormModal';
import LessonDetailsModal from '@/components/lessons/LessonDetailsModal';
import LessonCalendarView from '@/components/lessons/LessonCalendarView';
import {
    Plus, Edit, Trash2, Search, Filter, Download, Eye, Calendar as CalendarIcon,
    List, CheckCircle, XCircle, Clock, AlertCircle, TrendingUp, Users, Car
} from 'lucide-react';

export default function LessonsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth(true, ['admin', 'super-admin']);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [instructorFilter, setInstructorFilter] = useState('');
    const [studentFilter, setStudentFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [toast, setToast] = useState(null);

    const { data, loading, refetch, error } = useFetch(
        () => lessonsAPI.getAll({
            page,
            limit: 10,
            search: searchTerm || undefined,
            status: statusFilter || undefined,
            lessonType: typeFilter || undefined,
            instructorId: instructorFilter || undefined,
            studentId: studentFilter || undefined,
            startDate: dateFilter || undefined,
            endDate: dateFilter || undefined,
        }),
        [page, searchTerm, statusFilter, typeFilter, instructorFilter, studentFilter, dateFilter]
    );

    // Debug logging
    if (error) {
        console.error('Lessons fetch error:', error);
    }
    if (data) {
        console.log('Lessons data:', data);
    }

    const { data: statsData } = useFetch(() => lessonsAPI.getStats());
    const { data: studentsData } = useFetch(() => studentsAPI.getAll({ limit: 100 }));
    const { data: instructorsData } = useFetch(() => instructorsAPI.getAll({ limit: 100 }));

    // Safe access to stats data with defaults
    const stats = {
        total: statsData?.data?.total || 0,
        scheduled: statsData?.data?.scheduled || 0,
        completed: statsData?.data?.completed || 0,
        cancelled: statsData?.data?.cancelled || 0,
        noShow: statsData?.data?.noShow || 0,
        inProgress: statsData?.data?.inProgress || 0,
        upcoming: statsData?.data?.upcoming || 0,
        todayLessons: statsData?.data?.todayLessons || 0,
    };

    const handleOpenFormModal = (lesson = null) => {
        setEditingLesson(lesson);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingLesson(null);
    };

    const handleViewDetails = (lesson) => {
        setSelectedLesson(lesson);
        setIsDetailsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to cancel this lesson?')) return;
        try {
            await lessonsAPI.delete(id);
            setToast({ type: 'success', message: 'Lesson cancelled successfully!' });
            refetch();
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.error || 'Delete failed' });
        }
    };

    const handleCompleteLesson = async (id) => {
        try {
            await lessonsAPI.complete(id, { notes: 'Lesson completed' });
            setToast({ type: 'success', message: 'Lesson marked as completed!' });
            refetch();
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.error || 'Failed to complete lesson' });
        }
    };

    const handleFormSuccess = () => {
        refetch();
        handleCloseFormModal();
    };

    const handleExport = () => {
        setToast({ type: 'success', message: 'Exporting lessons data...' });
    };

    const handleBulkSchedule = () => {
        router.push('/dashboard/admin/lessons/bulk-schedule');
    };

    if (authLoading) return <Loader fullScreen />;

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

    return (
        <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <Sidebar userRole={user?.role} />
            <main className="flex-1 p-6 overflow-y-auto">
                <Navbar user={user} />

                {toast && <Toast {...toast} onClose={() => setToast(null)} />}

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Lessons Management</h1>
                        <p className="text-gray-600">Schedule, track, and manage all driving lessons</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleBulkSchedule}
                            className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 shadow-md transition-all"
                        >
                            <CalendarIcon size={20} />
                            Bulk Schedule
                        </button>
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
                            Schedule Lesson
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Lessons</p>
                                <h3 className="text-3xl font-bold text-gray-800">{stats.total}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100">
                                <CalendarIcon className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Scheduled</p>
                                <h3 className="text-3xl font-bold text-gray-800">{stats.scheduled}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-yellow-100">
                                <Clock className="text-yellow-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Completed</p>
                                <h3 className="text-3xl font-bold text-gray-800">{stats.completed}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-green-100">
                                <CheckCircle className="text-green-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Upcoming (7d)</p>
                                <h3 className="text-3xl font-bold text-gray-800">{stats.upcoming}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-purple-100">
                                <TrendingUp className="text-purple-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Cancelled</p>
                                <h3 className="text-3xl font-bold text-gray-800">{stats.cancelled}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-red-100">
                                <XCircle className="text-red-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="bg-white rounded-2xl shadow-lg mb-6 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                    viewMode === 'list'
                                        ? 'bg-white text-blue-600 shadow-md font-semibold'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                <List size={18} />
                                List View
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                    viewMode === 'calendar'
                                        ? 'bg-white text-blue-600 shadow-md font-semibold'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                            >
                                <CalendarIcon size={18} />
                                Calendar View
                            </button>
                        </div>

                        <div className="text-sm text-gray-600">
                            Showing {data?.count || 0} of {data?.pagination?.total || 0} lessons
                            {/* Debug info */}
                            {loading && <span className="ml-2 text-blue-600">(Loading...)</span>}
                            {error && <span className="ml-2 text-red-600">(Error: {error})</span>}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg mb-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search lessons..."
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
                            <option value="scheduled">Scheduled</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no-show">No Show</option>
                        </select>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="theory">Theory</option>
                            <option value="practical">Practical</option>
                            <option value="test-preparation">Test Preparation</option>
                            <option value="road-test">Road Test</option>
                        </select>
                        <select
                            value={instructorFilter}
                            onChange={(e) => setInstructorFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Instructors</option>
                            {instructorsData?.data?.map((instructor) => (
                                <option key={instructor._id} value={instructor._id}>
                                    {instructor.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Content - List or Calendar View */}
                {viewMode === 'list' ? (
                    // List View
                    loading ? (
                        <div className="flex justify-center py-12">
                            <Loader size="lg" />
                        </div>
                    ) : error ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12">
                            <div className="flex flex-col items-center justify-center text-red-500">
                                <AlertCircle size={48} className="mb-4" />
                                <p className="text-lg font-medium">Error Loading Lessons</p>
                                <p className="text-sm text-gray-600 mt-2">{error}</p>
                                <button
                                    onClick={() => refetch()}
                                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Instructor</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Schedule</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                        {data?.data && data.data.length > 0 ? (
                                            data.data.map((lesson) => (
                                                <tr key={lesson._id} className="hover:bg-gray-50 transition-all">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                                                                {lesson.studentId?.name?.charAt(0).toUpperCase() || '?'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-800">{lesson.studentId?.name || 'N/A'}</p>
                                                                <p className="text-xs text-gray-500">{lesson.studentId?.phone || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800">{lesson.instructorId?.name || 'N/A'}</p>
                                                            <p className="text-xs text-gray-500">{lesson.instructorId?.experienceYears || 0}y exp</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Car size={16} className="text-gray-400" />
                                                            <span className="text-sm text-gray-600">{lesson.vehicleId?.plateNumber || 'N/A'}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500">{lesson.vehicleId?.model || 'N/A'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <CalendarIcon size={16} className="text-gray-400" />
                                                            <span className="text-sm text-gray-600">
                                                                {new Date(lesson.date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Clock size={16} className="text-gray-400" />
                                                            <span className="text-sm text-gray-600">
                                                                {lesson.time} ({lesson.duration}min)
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${typeColors[lesson.lessonType]}`}>
                                                            {lesson.lessonType.replace('-', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColors[lesson.status]}`}>
                                                            {lesson.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleViewDetails(lesson)}
                                                                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all"
                                                                title="View Details"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            {lesson.status === 'scheduled' && (
                                                                <button
                                                                    onClick={() => handleCompleteLesson(lesson._id)}
                                                                    className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-all"
                                                                    title="Mark as completed"
                                                                >
                                                                    <CheckCircle size={18} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleOpenFormModal(lesson)}
                                                                className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-all"
                                                                title="Edit"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(lesson._id)}
                                                                className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                                                                title="Cancel"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                                        <CalendarIcon size={48} className="mb-4 opacity-50" />
                                                        <p className="text-lg font-medium">No lessons found</p>
                                                        <p className="text-sm">Click "Schedule Lesson" to add your first lesson</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination */}
                            {data?.pagination && data.pagination.total > 0 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        Showing {((page - 1) * data.pagination.limit) + 1} to{' '}
                                        {Math.min(page * data.pagination.limit, data.pagination.total)} of{' '}
                                        {data.pagination.total} lessons
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
                    )
                ) : (
                    // Calendar View
                    <LessonCalendarView
                        lessons={data?.data || []}
                        loading={loading}
                        onLessonClick={handleViewDetails}
                        onDateClick={(date) => {
                            setDateFilter(date);
                            setViewMode('list');
                        }}
                    />
                )}

                {/* Modals */}
                <LessonFormModal
                    isOpen={isFormModalOpen}
                    onClose={handleCloseFormModal}
                    lesson={editingLesson}
                    onSuccess={handleFormSuccess}
                    setToast={setToast}
                />

                {selectedLesson && (
                    <LessonDetailsModal
                        isOpen={isDetailsModalOpen}
                        onClose={() => {
                            setIsDetailsModalOpen(false);
                            setSelectedLesson(null);
                        }}
                        lesson={selectedLesson}
                        onEdit={() => {
                            setIsDetailsModalOpen(false);
                            handleOpenFormModal(selectedLesson);
                        }}
                        onComplete={handleCompleteLesson}
                        setToast={setToast}
                    />
                )}
            </main>
        </div>
    );
}