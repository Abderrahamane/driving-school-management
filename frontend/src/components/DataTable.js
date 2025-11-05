'use client';
import React from 'react';

export default function DataTable({ columns, data }) {
    return (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-100">
                <tr>
                    {columns.map((col) => (
                        <th
                            key={col}
                            className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b"
                        >
                            {col}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.length > 0 ? (
                    data.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                            {columns.map((col) => (
                                <td key={col} className="px-6 py-4 text-sm text-gray-700 border-b">
                                    {row[col.toLowerCase()] || '-'}
                                </td>
                            ))}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td
                            colSpan={columns.length}
                            className="text-center py-6 text-gray-500 italic"
                        >
                            No data available
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}
