// frontend/src/components/settings/AppearanceSettings.js
'use client';

import { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Monitor, Globe, Type, Layout, Sliders, Save } from 'lucide-react';

export default function AppearanceSettings({ user, setToast, setHasUnsavedChanges }) {
    const [settings, setSettings] = useState({
        theme: 'light',
        language: 'en',
        fontSize: 'medium',
        sidebarPosition: 'left',
        compactMode: false,
        colorScheme: 'blue',
        showAnimations: true,
        highContrast: false,
    });

    const [originalSettings, setOriginalSettings] = useState({});

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('appearance_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                setSettings(parsed);
                setOriginalSettings(parsed);
                applySettings(parsed);
            } else {
                setOriginalSettings(settings);
            }
        }
    }, []);

    useEffect(() => {
        const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
        setHasUnsavedChanges(hasChanges);
    }, [settings, originalSettings, setHasUnsavedChanges]);

    const applySettings = (newSettings) => {
        // Apply theme
        if (newSettings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Apply font size
        const root = document.documentElement;
        const fontSizes = { small: '14px', medium: '16px', large: '18px' };
        root.style.fontSize = fontSizes[newSettings.fontSize];
    };

    const handleChange = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        applySettings(newSettings);
    };

    const handleToggle = (key) => {
        handleChange(key, !settings[key]);
    };

    const handleSave = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('appearance_settings', JSON.stringify(settings));
            setOriginalSettings(settings);
            setHasUnsavedChanges(false);
            setToast({ type: 'success', message: 'Appearance settings saved successfully!' });
        }
    };

    const themes = [
        { id: 'light', name: 'Light', icon: <Sun size={24} />, desc: 'Bright and clean interface' },
        { id: 'dark', name: 'Dark', icon: <Moon size={24} />, desc: 'Easy on the eyes at night' },
        { id: 'auto', name: 'Auto', icon: <Monitor size={24} />, desc: 'Follows system preference' },
    ];

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
    ];

    const colorSchemes = [
        { id: 'blue', name: 'Blue', colors: ['#3B82F6', '#60A5FA', '#93C5FD'] },
        { id: 'purple', name: 'Purple', colors: ['#8B5CF6', '#A78BFA', '#C4B5FD'] },
        { id: 'green', name: 'Green', colors: ['#10B981', '#34D399', '#6EE7B7'] },
        { id: 'red', name: 'Red', colors: ['#EF4444', '#F87171', '#FCA5A5'] },
        { id: 'orange', name: 'Orange', colors: ['#F59E0B', '#FBBF24', '#FCD34D'] },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Appearance Settings</h2>
                <p className="text-gray-600">Customize how the application looks and feels</p>
            </div>

            {/* Theme Selection */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Palette size={20} className="text-blue-600" />
                    Theme
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    {themes.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => handleChange('theme', theme.id)}
                            className={`p-6 rounded-xl border-2 transition-all ${
                                settings.theme === theme.id
                                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                                settings.theme === theme.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {theme.icon}
                            </div>
                            <p className="font-semibold text-gray-800 mb-1">{theme.name}</p>
                            <p className="text-xs text-gray-600">{theme.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Scheme */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Palette size={20} className="text-blue-600" />
                    Color Scheme
                </h3>
                <div className="grid grid-cols-5 gap-4">
                    {colorSchemes.map((scheme) => (
                        <button
                            key={scheme.id}
                            onClick={() => handleChange('colorScheme', scheme.id)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                                settings.colorScheme === scheme.id
                                    ? 'border-blue-600 shadow-lg'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex gap-1 mb-2">
                                {scheme.colors.map((color, idx) => (
                                    <div
                                        key={idx}
                                        className="flex-1 h-8 rounded"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <p className="text-sm font-semibold text-gray-800">{scheme.name}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Language */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-blue-600" />
                    Language & Region
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleChange('language', lang.code)}
                            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                                settings.language === lang.code
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <span className="text-3xl">{lang.flag}</span>
                            <span className="font-semibold text-gray-800">{lang.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Font Size */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Type size={20} className="text-blue-600" />
                    Font Size
                </h3>
                <div className="flex items-center gap-6">
                    <input
                        type="range"
                        min="0"
                        max="2"
                        value={['small', 'medium', 'large'].indexOf(settings.fontSize)}
                        onChange={(e) => handleChange('fontSize', ['small', 'medium', 'large'][e.target.value])}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="w-32 text-center">
                        <p className="text-sm font-semibold text-gray-800 capitalize">{settings.fontSize}</p>
                        <p className="text-xs text-gray-600">
                            {settings.fontSize === 'small' ? '14px' : settings.fontSize === 'medium' ? '16px' : '18px'}
                        </p>
                    </div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>Small</span>
                    <span>Medium</span>
                    <span>Large</span>
                </div>
            </div>

            {/* Layout Options */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Layout size={20} className="text-blue-600" />
                    Layout Options
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-all">
                        <div>
                            <p className="font-semibold text-gray-800">Compact Mode</p>
                            <p className="text-sm text-gray-600">Reduce spacing and padding for more content</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.compactMode}
                                onChange={() => handleToggle('compactMode')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-all">
                        <div>
                            <p className="font-semibold text-gray-800">Show Animations</p>
                            <p className="text-sm text-gray-600">Enable smooth transitions and effects</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.showAnimations}
                                onChange={() => handleToggle('showAnimations')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-all">
                        <div>
                            <p className="font-semibold text-gray-800">High Contrast</p>
                            <p className="text-sm text-gray-600">Increase contrast for better visibility</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.highContrast}
                                onChange={() => handleToggle('highContrast')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Monitor size={20} className="text-blue-600" />
                    Preview
                </h3>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-800 mb-2">Sample Text with Current Settings</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Primary Button</button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg">Secondary Button</button>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-all shadow-lg"
                >
                    <Save size={18} />
                    Save Appearance
                </button>
            </div>
        </div>
    );
}