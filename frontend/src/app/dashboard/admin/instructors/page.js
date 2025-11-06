'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFetch } from '@/hooks/useFetch';
import { instructorsAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function InstructorsPage() {
    const { user, loading: authLoading } = useAuth(true, ['admin', 'super-admin']);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState(null);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        experienceYears: 0,
    });

    const { data, loading, refetch } = useFetch(
        () => instructorsAPI.getAll({ search: searchTerm }),
        [searchTerm]
    );

    const resetForm = () => {
        setFormData({ name: '', email: '', phone: '', experienceYears: 0 });
        setEditingInstructor(null);
    };

    const handleOpenModal = (instructor = null) => {
        if (instructor) {
            setEditingInstructor(instructor);
            setFormData({
                name: instructor.name,
                email: instructor.email,
                phone: instructor.phone,
                experienceYears: instructor.experienceYears,
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingInstructor) {
                await instructorsAPI.update(editingInstructor._id, formData);
                setToast({ type: 'success', message: 'Instructor updated successfully!' });
            } else {
                await instructorsAPI.create(formData);
                setToast({ type: 'success', message: 'Instructor created successfully!' });
            }
            setIsModalOpen(false);
            resetForm();
            refetch();
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.error || 'Operation failed' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await instructorsAPI.delete(id);
            setToast({ type: 'success', message: 'Instructor deleted successfully!' });
            refetch();
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.error || 'Delete failed' });
        }
    };

    if (authLoading) return <Loader fullScreen />;

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar userRole={user?.role} />
            <main className="flex-1 p-6">
                <Navbar user={user} />
                {toast && <Toast {...toast} onClose={() => setToast(null)} />}

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Instructors Management</h1>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        Add Instructor
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow mb-6 p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search instructors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader size="lg" />
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {data?.data?.map((instructor) => (
                                <tr key={instructor._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{instructor.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{instructor.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{instructor.phone}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{instructor.experienceYears} years</td>
                                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          instructor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {instructor.status}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm space-x-2">
                                        <button onClick={() => handleOpenModal(instructor)} className="text-blue-600 hover:text-blue-800">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(instructor._id)} className="text-red-600 hover:text-red-800">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingInstructor ? 'Edit Instructor' : 'Add Instructor'}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.experienceYears}
                                onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                {editingInstructor ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </Modal>
            </main>
        </div>
    );
}