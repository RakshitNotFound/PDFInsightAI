export default function DataTable({ rows }) {
  if (!rows?.length) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        No tabular rows extracted yet.
      </p>
    );
  }

  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="max-h-[420px] overflow-auto scrollbar-thin">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              {columns.map((column) => (
                <th key={column} className="whitespace-nowrap px-4 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 200).map((row, index) => (
              <tr
                key={`${row.Label}-${index}`}
                className="border-t border-slate-100 dark:border-slate-800"
              >
                {columns.map((column) => (
                  <td key={column} className="whitespace-nowrap px-4 py-2.5 text-slate-700 dark:text-slate-200">
                    {row[column] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
