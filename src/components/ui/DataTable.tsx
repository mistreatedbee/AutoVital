import React from 'react';
import { SearchXIcon } from 'lucide-react';
interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
}
interface DataTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  className?: string;
}
export function DataTable({
  columns,
  data,
  onRowClick,
  className = ''
}: DataTableProps) {
  return (
    <div
      className={`w-full flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              {columns.map((col) =>
              <th
                key={col.key}
                className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">

                  {col.header}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIndex) =>
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={`group transition-all duration-200 border-l-2 border-transparent even:bg-slate-50/40 ${onRowClick ? 'cursor-pointer hover:bg-slate-50 hover:border-l-primary-500' : 'hover:bg-slate-50/80'}`}>

                {columns.map((col) =>
              <td
                key={col.key}
                className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">

                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
              )}
              </tr>
            )}
            {data.length === 0 &&
            <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <SearchXIcon className="w-12 h-12 mb-4 text-slate-300" />
                    <p className="text-base font-medium text-slate-900 mb-1">
                      No results found
                    </p>
                    <p className="text-sm">
                      We couldn't find any data matching your criteria.
                    </p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {data.length > 0 &&
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-sm text-slate-500">
          <span>
            Showing{' '}
            <span className="font-medium text-slate-900">{data.length}</span>{' '}
            results
          </span>
        </div>
      }
    </div>);

}