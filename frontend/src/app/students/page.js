'use client';

import DataTable from '@/components/DataTable';

export default function StudentsPage() {
    const columns = ['Name', 'Email', 'Phone', 'License Type'];
    const data = [
        { name: 'Ali Ahmed', email: 'ali@gmail.com', phone: '0550123456', 'license type': 'B' },
        { name: 'Sara Mohamed', email: 'sara@gmail.com', phone: '0550654321', 'license type': 'A' },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Students</h1>
            <DataTable columns={columns} data={data} />
        </div>
    );
}