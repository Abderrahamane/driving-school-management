// frontend/src/components/lessons/LessonCalendarView.js
'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import Loader from '@/components/Loader';

export default function LessonCalendarView({ lessons, loading, onLessonClick, onDateClick }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month'); // 'month', 'week', 'day'

    const statusColors = {
        scheduled: 'bg-blue-500 border-blue-600',
        'in-progress': 'bg-yellow-500 border-yellow-600',
        completed: 'bg-green-500 border-green-600',
        cancelled: 'bg-red-500 border-red-600',
        'no-show': 'bg-gray-500 border-gray-600',
    };

    // Get calendar days for current month
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

        const days = [];
        const currentDay = new Date(startDate);

        // Generate 6 weeks (42 days)
        for (let i = 0; i < 42; i++) {
            days.push(new Date(currentDay));
            currentDay.setDate(currentDay.getDate() + 1);
        }

        return days;
    }, [currentDate]);

    // Group lessons by date
    const lessonsByDate = useMemo(() => {
        const grouped = {};
        lessons.forEach(lesson => {
            const dateKey = new Date(lesson.date).toDateString();
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(lesson);
        });
        return grouped;
    }, [lessons]);

    const navigateMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + direction);
            return newDate;
        });
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const formatMonthYear = (date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isCurrentMonth = (date) => {
        return date.getMonth() === currentDate.getMonth();
    };

    const getLessonsForDate = (date) => {
        return lessonsByDate[date.toDateString()] || [];
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-12">
                <div className="flex justify-center">
                    <Loader size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigateMonth(-1)}
                            className="p-2 hover:bg-white/20 rounded-lg transition-all"
                        >
                            <ChevronLeft className="text-white" size={24} />
                        </button>
                        <h2 className="text-2xl font-bold text-white">
                            {formatMonthYear(currentDate)}
                        </h2>
                        <button
                            onClick={() => navigateMonth(1)}
                            className="p-2 hover:bg-white/20 rounded-lg transition-all"
                        >
                            <ChevronRight className="text-white" size={24} />
                        </button>
                    </div>
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all font-medium"
                    >
                        Today
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-4 text-xs">
                    <span className="font-semibold text-gray-600">Legend:</span>
                    {Object.entries(statusColors).map(([status, color]) => (
                        <div key={status} className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded ${color}`}></div>
                            <span className="text-gray-600 capitalize">{status.replace('-', ' ')}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => {
                        const dayLessons = getLessonsForDate(day);
                        const isCurrentDay = isToday(day);
                        const inCurrentMonth = isCurrentMonth(day);

                        return (
                            <div
                                key={index}
                                onClick={() => onDateClick && onDateClick(day.toISOString().split('T')[0])}
                                className={`
                                    min-h-[120px] border rounded-lg p-2 cursor-pointer transition-all
                                    ${isCurrentDay ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}
                                    ${!inCurrentMonth ? 'bg-gray-100 opacity-50' : ''}
                                `}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`
                                        text-sm font-semibold
                                        ${isCurrentDay ? 'text-blue-600' : inCurrentMonth ? 'text-gray-800' : 'text-gray-400'}
                                    `}>
                                        {day.getDate()}
                                    </span>
                                    {dayLessons.length > 0 && (
                                        <span className="text-xs bg-blue-600 text-white rounded-full px-2 py-0.5 font-semibold">
                                            {dayLessons.length}
                                        </span>
                                    )}
                                </div>

                                {/* Lessons for this day */}
                                <div className="space-y-1">
                                    {dayLessons.slice(0, 3).map((lesson, idx) => (
                                        <div
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onLessonClick(lesson);
                                            }}
                                            className={`
                                                text-xs p-1.5 rounded border-l-2 
                                                ${statusColors[lesson.status]}
                                                bg-white hover:shadow-md transition-all
                                            `}
                                        >
                                            <div className="flex items-center gap-1 text-gray-700">
                                                <Clock size={10} />
                                                <span className="font-medium">{lesson.time}</span>
                                            </div>
                                            <div className="text-gray-600 truncate">
                                                {lesson.studentId?.name}
                                            </div>
                                        </div>
                                    ))}
                                    {dayLessons.length > 3 && (
                                        <div className="text-xs text-blue-600 font-semibold text-center py-1">
                                            +{dayLessons.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Summary Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        <span className="font-semibold">{lessons.length}</span> lessons this month
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-blue-500"></div>
                            <span className="text-gray-600">
                                {lessons.filter(l => l.status === 'scheduled').length} Scheduled
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-green-500"></div>
                            <span className="text-gray-600">
                                {lessons.filter(l => l.status === 'completed').length} Completed
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}