// frontend/src/components/settings/ProfileSettings.js
'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Camera, Save, X } from 'lucide-react';
import Loader from '@/components/Loader';

export default function ProfileSettings({ user, setToast, setHasUnsavedChanges }) {
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        bio: '',
    });
    const [originalData, setOriginalData] = useState({});
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        if (user) {
            const data = {
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                bio: user.bio || '',
            };
            setProfileData(data);
            setOriginalData(data);
        }
    }, [user]);

    useEffect(() => {
        const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalData);
        setHasUnsavedChanges(hasChanges);
    }, [profileData, originalData, setHasUnsavedChanges]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setToast({ type: 'error', message: 'Image size must be less than 2MB' });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
                setToast({ type: 'success', message: 'Profile image uploaded! Click Save to apply.' });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulate API call - replace with actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));

            setToast({ type: 'success', message: 'Profile updated successfully!' });
            setOriginalData(profileData);
            setHasUnsavedChanges(false);

            // Update localStorage user data
            if (typeof window !== 'undefined') {
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...storedUser, ...profileData }));
            }
        } catch (error) {
            setToast({ type: 'error', message: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setProfileData(originalData);
        setProfileImage(null);
        setHasUnsavedChanges(false);
        setToast({ type: 'success', message: 'Changes discarded' });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Settings</h2>
                <p className="text-gray-600">Update your personal information and profile picture</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Picture Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Camera size={20} className="text-blue-600" />
                        Profile Picture
                    </h3>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-all">
                                <Camera size={18} className="text-gray-600" />
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-1">{user?.name}</h4>
                            <p className="text-sm text-gray-600 mb-3 capitalize">{user?.role}</p>
                            <div className="space-y-1 text-xs text-gray-500">
                                <p>• JPG, PNG or GIF (max 2MB)</p>
                                <p>• Recommended size: 400x400px</p>
                                <p>• Square images work best</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <User size={20} className="text-blue-600" />
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="+1 234 567 8900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={user?.role || ''}
                                    disabled
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 capitalize"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin size={20} className="text-blue-600" />
                        Additional Information
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="address"
                                    value={profileData.address}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="123 Main St, City, Country"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bio
                            </label>
                            <textarea
                                name="bio"
                                value={profileData.bio}
                                onChange={handleChange}
                                rows="4"
                                maxLength={500}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Tell us about yourself..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {profileData.bio.length}/500 characters
                            </p>
                        </div>
                    </div>
                </div>

                {/* Account Information (Read-only) */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Calendar size={20} className="text-gray-600" />
                        Account Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600 mb-1">Account Created</p>
                            <p className="font-semibold text-gray-800">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600 mb-1">Last Login</p>
                            <p className="font-semibold text-gray-800">
                                {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600 mb-1">Account Status</p>
                            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                Active
                            </span>
                        </div>
                        <div>
                            <p className="text-gray-600 mb-1">Email Verified</p>
                            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                Verified
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={loading || !Object.keys(originalData).length}
                        className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X size={18} />
                        Discard Changes
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-all disabled:opacity-50 shadow-lg"
                    >
                        {loading ? (
                            <>
                                <Loader size="sm" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}