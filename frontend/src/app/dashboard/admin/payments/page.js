'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFetch } from '@/hooks/useFetch';
import { paymentsAPI, studentsAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';
import { Plus, Edit, Trash2, Search, Filter, DollarSign, CreditCard, CheckCircle, Clock } from 'lucide-react';

export default function PaymentsPage() {
    const { user, loading: authLoading } = useAuth(true, ['admin', 'super-admin']);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        studentId: '',
        amount: '',
        method: 'cash',
        status: 'paid',
        category: 'lesson',
        description: '',
    });

    const { data: paymentsData, loading, refetch } = useFetch(
        () => paymentsAPI.getAll({ status: statusFilter }),
        [statusFilter]
    );

    const { data: studentsData } = useFetch(() => studentsAPI.getAll({ limit: 100 }));
    const { data: statsData } = useFetch(() => paymentsAPI.getStats());

    const resetForm = () => {
        setFormData({
            studentId: '',
            amount: '',
            method: 'cash',
            status: 'paid',
            category: 'lesson',
            description: '',
        });
        setEditingPayment(null);
    };

    const handleOpenModal = (payment = null) => {
        if (payment) {
            setEditingPayment(payment);
            setFormData({
                studentId: payment.studentId._id,
                amount: payment.amount,
                method: payment.method,
                status: payment.status,
                category: payment.category,
                description: payment.description || '',
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
            if (editingPayment) {
                await paymentsAPI.update(editingPayment._id, formData);
                setToast({ type: 'success', message: 'Payment updated successfully!' });
            } else {
                await paymentsAPI.create(formData);
                setToast({ type: 'success', message: 'Payment recorded successfully!' });
            }
            handleCloseModal();
            await refetch();
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.error || 'Operation failed' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this payment?')) return;
        try {
            await paymentsAPI.delete(id);
            setToast({ type: 'success', message: 'Payment deleted successfully!' });
            await refetch();
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.error || 'Delete failed' });
        }
    };

    const handleMarkAsPaid = async (id) => {
        try {
            await paymentsAPI.markAsPaid(id);
            setToast({ type: 'success', message: 'Payment marked as paid!' });
            await refetch();
        } catch (error) {
            setToast({ type: 'error', message: error.response?.data?.error || 'Operation failed' });
        }
    };

    if (authLoading) return <Loader fullScreen />;

    const statusColors = {
        paid: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        refunded: 'bg-red-100 text-red-800',
        failed: 'bg-gray-100 text-gray-800',
    };

    const methodIcons = {
        cash: <DollarSign size={16} />,
        card: <CreditCard size={16} />,
        transfer: <DollarSign size={16} />,
        check: <DollarSign size={16} />,
    };

    return (
        <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <Sidebar userRole={user?.role} />
            <main className="flex-1 p-6 overflow-y-auto">
                <Navbar user={user} />

                {toast && <Toast {...toast} onClose={() => setToast(null)} />}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payments Management</h1>
                        <p className="text-gray-600">Track and manage all financial transactions</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all transform hover:scale-105"
                    >
                        <Plus size={20} />
                        Record Payment
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                                <h3 className="text-2xl font-bold text-gray-800">
                                    ${statsData?.data?.totalRevenue?.toLocaleString() || 0}
                                </h3>
                            </div>
                            <div className="p-3 rounded-full bg-green-100">
                                <DollarSign className="text-green-600" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Pending Amount</p>
                                <h3 className="text-2xl font-bold text-gray-800">
                                    ${statsData?.data?.pendingAmount?.toLocaleString() || 0}
                                </h3>
                            </div>
                            <div className="p-3 rounded-full bg-yellow-100">
                                <Clock className="text-yellow-600" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Paid Payments</p>
                                <h3 className="text-2xl font-bold text-gray-800">{statsData?.data?.totalPaid || 0}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100">
                                <CheckCircle className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
                                <h3 className="text-2xl font-bold text-gray-800">{statsData?.data?.totalPending || 0}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-purple-100">
                                <Clock className="text-purple-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg mb-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by student name or receipt..."
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
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="refunded">Refunded</option>
                            <option value="failed">Failed</option>
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
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Receipt</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {paymentsData?.data?.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-gray-50 transition-all">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-mono text-gray-600">{payment.receiptNumber}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                                                    {payment.studentId?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{payment.studentId?.name}</p>
                                                    <p className="text-xs text-gray-500">{payment.studentId?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-lg font-bold text-gray-800">${payment.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {methodIcons[payment.method]}
                                                <span className="text-sm text-gray-600 capitalize">{payment.method}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                                                    {payment.category}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(payment.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColors[payment.status]}`}>
                                                    {payment.status}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {payment.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleMarkAsPaid(payment._id)}
                                                        className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-all"
                                                        title="Mark as paid"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleOpenModal(payment)}
                                                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(payment._id)}
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

                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPayment ? 'Edit Payment' : 'Record New Payment'}>
                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select
                                    value={formData.method}
                                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="transfer">Bank Transfer</option>
                                    <option value="check">Check</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="registration">Registration</option>
                                    <option value="lesson">Lesson</option>
                                    <option value="exam-fee">Exam Fee</option>
                                    <option value="material">Material</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="refunded">Refunded</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Payment description..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                {editingPayment ? 'Update' : 'Record'}
                            </button>
                        </div>
                    </form>
                </Modal>
            </main>
        </div>
    );
}