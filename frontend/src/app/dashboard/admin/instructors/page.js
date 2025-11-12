// frontend/src/app/dashboard/admin/instructors/page.js
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFetch } from '@/hooks/useFetch';
import { instructorsAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
import InstructorFormModal from '@/components/instructors/InstructorFormModal';
import InstructorDetailsModal from '@/components/instructors/InstructorDetailsModal';
import {
    Plus, Edit, Trash2, Search, Filter, Download, Eye, Users,
    TrendingUp, Award, Clock, Calendar, Star, UserCheck
} from 'lucide-react';

export default function InstructorsPage() {
    const { user, loading: authLoading } = useAuth(true, ['admin', 'super-admin']);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState(null);
    const [selectedInstructor, setSelectedInstructor] = useState(null);
    const [toast, setToast] = useState(null);

    const { data, loading, refetch } = useFetch(
        () => instructorsAPI.getAll({
            page,
            search: searchTerm,
            status: statusFilter
        }),
        [page, searchTerm, statusFilter]
    );

    const { data: statsData } = useFetch(() => instructorsAPI.getStats());

    const handleOpenFormModal = (instructor = null) => {
        setEditingInstructor(instructor);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingInstructor(null);
    };

    const handleViewDetails = (instructor) => {
        setSelectedInstructor(instructor);
        setIsDetailsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this instructor? This action cannot be undone.')) return;
        try {
            await instructorsAPI.delete(id);
            setToast({ type: 'success', message: 'Instructor deleted successfully!' });
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
        setToast({ type: 'success', message: 'Exporting instructors data...' });
    };

    if (authLoading) return <Loader fullScreen />;

    const statusColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        'on-leave': 'bg-yellow-100 text-yellow-800',
        terminated: 'bg-red-100 text-red-800',
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
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Instructors Management</h1>
                        <p className="text-gray-600">Manage your team of driving instructors</p>
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
                            Add Instructor
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Instructors</p>
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
                                <p className="text-sm text-gray-600 mb-1">Active</p>
                                <h3 className="text-3xl font-bold text-gray-800">{statsData?.data?.active || 0}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-green-100">
                                <UserCheck className="text-green-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Avg Experience</p>
                                <h3 className="text-3xl font-bold text-gray-800">
                                    {statsData?.data?.avgExperience || 0}<span className="text-lg">y</span>
                                </h3>
                            </div>
                            <div className="p-3 rounded-full bg-purple-100">
                                <Award className="text-purple-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Lessons</p>
                                <h3 className="text-3xl font-bold text-gray-800">{statsData?.data?.totalLessons || 0}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-yellow-100">
                                <Calendar className="text-yellow-600" size={24} />
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
                                    placeholder="Search by name, email, or specialization..."
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
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="on-leave">On Leave</option>
                            <option value="terminated">Terminated</option>
                        </select>
                        <select className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
                            <option value="">All Specializations</option>
                            <option value="manual">Manual Transmission</option>
                            <option value="automatic">Automatic Transmission</option>
                            <option value="both">Both</option>
                        </select>
                        <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                            <Filter size={20} />
                            More Filters
                        </button>
                    </div>
                </div>

                {/* Instructors Table */}
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
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Instructor</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Experience</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Specialization</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                    {data?.data?.map((instructor) => (
                                        <tr key={instructor._id} className="hover:bg-gray-50 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-lg">
                                                        {instructor.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">{instructor.name}</p>
                                                        <p className="text-xs text-gray-500">{instructor.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-800">{instructor.phone}</p>
                                                <p className="text-xs text-gray-500">{instructor.licenseNumber || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Award size={16} className="text-purple-600" />
                                                    <span className="text-sm font-semibold text-gray-800">
                                                            {instructor.experienceYears} years
                                                        </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {instructor.stats?.totalLessons || 0} lessons taught
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                                                        {instructor.specialization || 'Both'}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <Star size={16} className="text-yellow-500 fill-current" />
                                                    <span className="text-sm font-semibold text-gray-800">
                                                            {instructor.stats?.avgRating?.toFixed(1) || 'N/A'}
                                                        </span>
                                                    {instructor.stats?.totalReviews > 0 && (
                                                        <span className="text-xs text-gray-500">
                                                                ({instructor.stats.totalReviews})
                                                            </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColors[instructor.status]}`}>
                                                        {instructor.status}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(instructor)}
                                                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenFormModal(instructor)}
                                                        className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(instructor._id)}
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
                                    Showing {((page - 1) * data.pagination.limit) + 1} to {Math.min(page * data.pagination.limit, data.pagination.total)} of {data.pagination.total} instructors
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
                <InstructorFormModal
                    isOpen={isFormModalOpen}
                    onClose={handleCloseFormModal}
                    instructor={editingInstructor}
                    onSuccess={handleFormSuccess}
                    setToast={setToast}
                />

                {selectedInstructor && (
                    <InstructorDetailsModal
                        isOpen={isDetailsModalOpen}
                        onClose={() => {
                            setIsDetailsModalOpen(false);
                            setSelectedInstructor(null);
                        }}
                        instructor={selectedInstructor}
                        onEdit={() => {
                            setIsDetailsModalOpen(false);
                            handleOpenFormModal(selectedInstructor);
                        }}
                        setToast={setToast}
                    />
                )}
            </main>
        </div>
    );
}