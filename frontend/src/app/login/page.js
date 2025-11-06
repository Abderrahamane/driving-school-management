import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, Eye, EyeOff, Car } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { setAuth, redirectByRole } from '@/lib/auth';
import Toast from '@/components/Toast';
import Loader from '@/components/Loader';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authAPI.login(formData);
            const { token, ...user } = response.data.data;

            setAuth(token, user);
            setToast({ type: 'success', message: 'Login successful!' });

            setTimeout(() => {
                router.push(redirectByRole(user.role));
            }, 1000);
        } catch (error) {
            setToast({
                type: 'error',
                message: error.response?.data?.error || 'Login failed'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            {/* Left Section - Branding */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
                <div className="max-w-md text-white animate-fade-in">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform">
                            <Car className="text-blue-600" size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">Drive School</h1>
                            <p className="text-blue-200">Management System</p>
                        </div>
                    </div>
                    <h2 className="text-5xl font-bold mb-6 leading-tight">
                        Welcome to the Future of
                        <span className="block text-yellow-300">Driving Education</span>
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Streamline your driving school operations with our comprehensive management platform.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">✓</span>
                            </div>
                            <p className="text-lg">Student Management</p>
                        </div>
                        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">✓</span>
                            </div>
                            <p className="text-lg">Lesson Scheduling</p>
                        </div>
                        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">✓</span>
                            </div>
                            <p className="text-lg">Payment Tracking</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md animate-scale-in">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                            <LogIn className="text-white" size={36} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
                        <p className="text-gray-600">Enter your credentials to access your account</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                <span className="ml-2 text-sm text-gray-600">Remember me</span>
                            </label>
                            <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader size="sm" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <a href="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                                Create Account
                            </a>
                        </p>
                    </div>

                    {/* Mobile branding */}
                    <div className="lg:hidden mt-8 pt-8 border-t border-gray-200">
                        <div className="flex items-center justify-center space-x-3 text-gray-600">
                            <Car size={24} />
                            <span className="font-semibold">Drive School Management</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}