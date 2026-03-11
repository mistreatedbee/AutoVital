import React from 'react';
import { SearchXIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { EmptyState } from './EmptyState';
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
      className={cn(
        'w-full flex flex-col rounded-xl border border-border bg-cardToken text-cardToken-foreground shadow-sm overflow-hidden',
        className
      )}>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/60 border-b border-border">
              {columns.map((col) =>
              <th
                key={col.key}
                className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">

                  {col.header}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, rowIndex) =>
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'group transition-all duration-200 border-l-2 border-transparent even:bg-muted/25',
                onRowClick
                  ? 'cursor-pointer hover:bg-muted/40 hover:border-l-primaryToken'
                  : 'hover:bg-muted/40'
              )}>

                {columns.map((col) =>
              <td
                key={col.key}
                className="px-6 py-4 text-sm text-foreground whitespace-nowrap">

                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
              )}
              </tr>
            )}
            {data.length === 0 &&
            <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <EmptyState
                    icon={<SearchXIcon className="w-12 h-12" />}
                    title="No results found"
                    description="We couldn't find any data matching your criteria."
                  />
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {data.length > 0 &&
      <div className="px-6 py-4 border-t border-border bg-muted/40 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing{' '}
            <span className="font-medium text-foreground">{data.length}</span>{' '}
            results
          </span>
        </div>
      }
    </div>);

}