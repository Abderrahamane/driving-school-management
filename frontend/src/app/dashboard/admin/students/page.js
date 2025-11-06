import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFetch } from '@/hooks/useFetch';
import { studentsAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { Plus, Edit, Trash2, Search, Filter, Download, Eye } from 'lucide-react';

export default function StudentsPage() {
    const { user, loading: authLoading } = useAuth(true, ['admin', 'super-admin']);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        licenseType: 'B',
        dateOfBirth: '',
    });

    const { data, loading, refetch } = useFetch(
        () => studentsAPI.getAll({ page, search: searchTerm }),
        [page, searchTerm]
    );

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            licenseType: 'B',
            dateOfBirth: '',
        });
        setEditingStudent(null);
    };

    const handleOpenModal = (student = null) => {
        if (student) {
            setEditingStudent(student);
            setFormData({
                name: student.name,
                email: student.email,
                phone: student.phone,
                address: student.address || '',
                licenseType: student.licenseType,
                dateOfBirth: student.dateOfBirth?.split('T')[0] || '',
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
            if (editingStudent) {
                await studentsAPI.update(editingStudent._id, formData);
                setToast({ type: 'success', message: 'Student updated successfully!' });
            } else {
                await studentsAPI.create(formData);
                setToast({ type: 'success', message: 'Student created successfully!' });
            }
            handleCloseModal();
            refetch();
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.error || 'Operation failed' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this student?')) return;
        try {
            await studentsAPI.delete(id);
            setToast({ type: 'success', message: 'Student deleted successfully!' });
            refetch();
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.error || 'Delete failed' });
        }
    };

    if (authLoading) return <Loader fullScreen />;

    return (
        <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <Sidebar userRole={user?.role} />
            <main className="flex-1 p-6 overflow-y-auto">
                <Navbar user={user} />

                {toast && <Toast {...toast} onClose={() => setToast(null)} />}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Students Management</h1>
                        <p className="text-gray-600">Manage and track all your students in one place</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 shadow-md transition-all">
                            <Download size={20} />
                            Export
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all transform hover:scale-105"
                        >
                            <Plus size={20} />
                            Add Student
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg mb-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search students by name, email, or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                        <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                            <Filter size={20} />
                            Filters
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
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">License</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {data?.data?.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50 transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{student.name}</p>
                                                    <p className="text-xs text-gray-500">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{student.phone}</td>
                                        <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                    Type {student.licenseType}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                    student.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        student.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {student.status}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(student)}
                                                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-all">
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student._id)}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all"
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
                )}
            </main>
        </div>
    );
}