import { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import api from '../api/api';

function EmailsPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get('emails/emails/') // ✅ fixed URL
      .then((res) => {
        console.log('Fetched emails data:', res.data);
        setEmails(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('Failed to load emails: ' + err.message);
        setLoading(false);
      });
  }, []);

  const columns = [
    { accessorKey: 'sender', header: 'Sender' },
    { accessorKey: 'receiver', header: 'Receiver' },
    { accessorKey: 'subject', header: 'Subject' },
    { accessorKey: 'created_at', header: 'Created At' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="space-x-2">
          <Link
            to={`/reply/${row.original.email_id}`}
            className="text-blue-500 hover:underline"
          >
            Reply
          </Link>
          <Link
            to={`/forward/${row.original.email_id}`}
            className="text-blue-500 hover:underline"
          >
            Forward
          </Link>
          <Link
            to={`/thread/${row.original.email_id}`}
            className="text-blue-500 hover:underline"
          >
            View Thread
          </Link>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: emails,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) return <p>Loading emails...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Email List</h2>
      <button
        onClick={() => window.location.reload()}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh List
      </button>

      {emails.length === 0 ? (
        <p>No emails yet. Send some emails first.</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-2 border cursor-pointer"
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    <span>
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted()] ?? ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2 border">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EmailsPage;
