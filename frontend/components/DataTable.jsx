export default function DataTable({ columns, data }) {
    return (
        <table className="w-full border border-gray-300 bg-white rounded-md">
            <thead>
            <tr className="bg-gray-100">
                {columns.map((col, i) => (
                    <th key={i} className="p-2 text-left border-b">{col}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                    {row.map((cell, j) => (
                        <td key={j} className="p-2 border-b">{cell}</td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    );
}
