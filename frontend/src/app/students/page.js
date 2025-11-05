import DataTable from '../../components/DataTable';

export default function StudentsPage() {
    const columns = ['Name', 'Email', 'Phone', 'License Type'];
    const data = [
        ['Ali Ahmed', 'ali@gmail.com', '0550123456', 'B'],
        ['Sara Mohamed', 'sara@gmail.com', '0550654321', 'A'],
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Students</h1>
            <DataTable columns={columns} data={data} />
        </div>
    );
}
