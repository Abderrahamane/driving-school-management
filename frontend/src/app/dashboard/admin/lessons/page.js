'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFetch } from '@/hooks/useFetch';
import { lessonsAPI, studentsAPI, instructorsAPI, vehiclesAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { Plus, Edit, Trash2, Search, Filter, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function LessonsPage() {
    const { user, loading: authLoading } = useAuth(true, ['admin', 'super-admin']);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [toast, setToast] = useState(null);
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

    const { data: lessonsData, loading, refetch } = useFetch(
        () => lessonsAPI.getAll({ status: statusFilter }),
        [statusFilter]
    );

    const { data: studentsData } = useFetch(() => studentsAPI.getAll({ limit: 100 }));
    const { data: instructorsData } = useFetch(() => instructorsAPI.getAll({ limit: 100 }));
    const { data: vehiclesData } = useFetch(() => vehiclesAPI.getAll({ limit: 100, status: 'available' }));

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
        setEditingLesson(null);
    };

    const handleOpenModal = (lesson = null) => {
        if (lesson) {
            setEditingLesson(lesson);
            setFormData({
                studentId: lesson.studentId._id,
                instructorId: lesson.instructorId._id,
                vehicleId: lesson.vehicleId._id,
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
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLesson) {
                await lessonsAPI.update(editingLesson._id, formData);
                setToast({ type: 'success', message: 'Lesson updated successfully!' });
            } else {
                await lessonsAPI.create(formData);
                setToast({ type: 'success', message: 'Lesson scheduled successfully!' });
            }
            handleCloseModal();
            refetch();
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.error || 'Operation failed' });
        }
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

    if (authLoading) return <Loader fullScreen />;

    const statusColors = {
        scheduled: 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        'no-show': 'bg-gray-100 text-gray-800',
    };

    return (
        <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <Sidebar userRole={user?.role} />
            <main className="flex-1 p-6 overflow-y-auto">
                <Navbar user={user} />

                {toast && <Toast {...toast} onClose={() => setToast(null)} />}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Lessons & Schedules</h1>
                        <p className="text-gray-600">Manage and schedule driving lessons</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all transform hover:scale-105"
                    >
                        <Plus size={20} />
                        Schedule Lesson
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-lg mb-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        </select>
                        <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                            <Filter size={20} />
                            More Filters
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader size="lg" />
                    </div>
                ) : (
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
                                {lessonsData?.data?.map((lesson) => (
                                    <tr key={lesson._id} className="hover:bg-gray-50 transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                                                    {lesson.studentId?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{lesson.studentId?.name}</p>
                                                    <p className="text-xs text-gray-500">{lesson.studentId?.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{lesson.instructorId?.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{lesson.vehicleId?.plateNumber}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">{new Date(lesson.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock size={16} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">{lesson.time} ({lesson.duration}min)</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                                    {lesson.lessonType}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColors[lesson.status]}`}>
                                                    {lesson.status}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
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
                                                    onClick={() => handleOpenModal(lesson)}
                                                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(lesson._id)}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingLesson ? 'Edit Lesson' : 'Schedule New Lesson'} size="lg">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                                <select
                                    required
                                    value={formData.studentId}
                                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Student</option>
                                    {studentsData?.data?.map((student) => (
                                        <option key={student._id} value={student._id}>
                                            {student.name} - {student.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                                <select
                                    required
                                    value={formData.instructorId}
                                    onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Instructor</option>
                                    {instructorsData?.data?.map((instructor) => (
                                        <option key={instructor._id} value={instructor._id}>
                                            {instructor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                            <select
                                required
                                value={formData.vehicleId}
                                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Vehicle</option>
                                {vehiclesData?.data?.map((vehicle) => (
                                    <option key={vehicle._id} value={vehicle._id}>
                                        {vehicle.plateNumber} - {vehicle.model}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input
                                    type="time"
                                    required
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                                <input
                                    type="number"
                                    required
                                    min="30"
                                    max="180"
                                    step="30"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Type</label>
                            <select
                                value={formData.lessonType}
                                onChange={(e) => setFormData({ ...formData, lessonType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="theory">Theory</option>
                                <option value="practical">Practical</option>
                                <option value="test-preparation">Test Preparation</option>
                                <option value="road-test">Road Test</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., School parking lot, Main road"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Additional notes..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                {editingLesson ? 'Update' : 'Schedule'}
                            </button>
                        </div>
                    </form>
                </Modal>
            </main>
        </div>
    );
}