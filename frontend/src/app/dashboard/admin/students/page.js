// frontend/src/app/dashboard/admin/students/page.js
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFetch } from '@/hooks/useFetch';
import { studentsAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import StudentDetailsModal from '@/components/students/StudentDetailsModal';
import StudentFormModal from '@/components/students/StudentFormModal';
import { Plus, Edit, Trash2, Search, Filter, Download, Eye, Users, TrendingUp, Award, Clock } from 'lucide-react';

export default function StudentsPage() {
    const { user, loading: authLoading } = useAuth(true, ['admin', 'super-admin']);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [licenseTypeFilter, setLicenseTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [toast, setToast] = useState(null);

    const { data, loading, refetch } = useFetch(
        () => studentsAPI.getAll({
            page,
            search: searchTerm,
            licenseType: licenseTypeFilter,
            status: statusFilter
        }),
        [page, searchTerm, licenseTypeFilter, statusFilter]
    );

    const { data: statsData } = useFetch(() => studentsAPI.getStats());

    const handleOpenFormModal = (student = null) => {
        setEditingStudent(student);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingStudent(null);
    };

    const handleViewDetails = async (student) => {
        setSelectedStudent(student);
        setIsDetailsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;
        try {
            await studentsAPI.delete(id);
            setToast({ type: 'success', message: 'Student deleted successfully!' });
            refetch();
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.error || 'Delete failed' });
        }
    };

    const handleFormSuccess = () => {
        refetch();
        handleCloseFormModal();
    };

    const handleExport = () => {
        setToast({ type: 'success', message: 'Exporting students data...' });
        // Implement CSV/PDF export logic
    };

    if (authLoading) return <Loader fullScreen />;

    const statusColors = {
        active: 'bg-green-100 text-green-800',
        completed: 'bg-blue-100 text-blue-800',
        suspended: 'bg-red-100 text-red-800',
        dropped: 'bg-gray-100 text-gray-800',
    };

    const licenseColors = {
        A: 'bg-purple-100 text-purple-800',
        B: 'bg-blue-100 text-blue-800',
        C: 'bg-orange-100 text-orange-800',
        D: 'bg-green-100 text-green-800',
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
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Students Management</h1>
                        <p className="text-gray-600">Manage and track all your students in one place</p>
                    </div>
                    <div className="flex gap-3">
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
                            Add Student
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                                <h3 className="text-3xl font-bold text-gray-800">{statsData?.data?.total || 0}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100">
                                <Users className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Active Students</p>
                                <h3 className="text-3xl font-bold text-gray-800">
                                    {statsData?.data?.byLicenseType?.reduce((sum, item) => sum + item.count, 0) || 0}
                                </h3>
                            </div>
                            <div className="p-3 rounded-full bg-green-100">
                                <TrendingUp className="text-green-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">New This Month</p>
                                <h3 className="text-3xl font-bold text-gray-800">{statsData?.data?.recentlyRegistered || 0}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-purple-100">
                                <Clock className="text-purple-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Completed</p>
                                <h3 className="text-3xl font-bold text-gray-800">
                                    {data?.data?.filter(s => s.status === 'completed').length || 0}
                                </h3>
                            </div>
                            <div className="p-3 rounded-full bg-yellow-100">
                                <Award className="text-yellow-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg mb-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                        <select
                            value={licenseTypeFilter}
                            onChange={(e) => setLicenseTypeFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All License Types</option>
                            <option value="A">Type A</option>
                            <option value="B">Type B</option>
                            <option value="C">Type C</option>
                            <option value="D">Type D</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="suspended">Suspended</option>
                            <option value="dropped">Dropped</option>
                        </select>
                        <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                            <Filter size={20} />
                            More Filters
                        </button>
                    </div>
                </div>

                {/* Students Table */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader size="lg" />
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">License</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Progress</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                    {data?.data?.map((student) => (
                                        <tr key={student._id} className="hover:bg-gray-50 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                                                        {student.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">{student.name}</p>
                                                        <p className="text-xs text-gray-500">{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-800">{student.phone}</p>
                                                <p className="text-xs text-gray-500">{student.address || 'No address'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${licenseColors[student.licenseType]}`}>
                                                        Type {student.licenseType}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-600">Theory</span>
                                                        <span className="font-semibold">{student.progress?.theoryLessons || 0}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div
                                                            className="bg-blue-600 h-1.5 rounded-full"
                                                            style={{ width: `${Math.min((student.progress?.theoryLessons || 0) * 10, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-600">Practical</span>
                                                        <span className="font-semibold">{student.progress?.practicalLessons || 0}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div
                                                            className="bg-green-600 h-1.5 rounded-full"
                                                            style={{ width: `${Math.min((student.progress?.practicalLessons || 0) * 5, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColors[student.status]}`}>
                                                        {student.status}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(student)}
                                                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenFormModal(student)}
                                                        className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(student._id)}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {data?.pagination && (
                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing {((page - 1) * data.pagination.limit) + 1} to {Math.min(page * data.pagination.limit, data.pagination.total)} of {data.pagination.total} students
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
                )}

                {/* Modals */}
                <StudentFormModal
                    isOpen={isFormModalOpen}
                    onClose={handleCloseFormModal}
                    student={editingStudent}
                    onSuccess={handleFormSuccess}
                    setToast={setToast}
                />

                {selectedStudent && (
                    <StudentDetailsModal
                        isOpen={isDetailsModalOpen}
                        onClose={() => {
                            setIsDetailsModalOpen(false);
                            setSelectedStudent(null);
                        }}
                        student={selectedStudent}
                        onEdit={() => {
                            setIsDetailsModalOpen(false);
                            handleOpenFormModal(selectedStudent);
                        }}
                        setToast={setToast}
                    />
                )}
            </main>
        </div>
    );
}