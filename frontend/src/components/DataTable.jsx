import { motion } from 'framer-motion';
import { Database } from 'lucide-react';
import { TableSkeletonLoader } from './SkeletonLoader';

const isInteractiveElement = (target) =>
  target instanceof Element && Boolean(target.closest('button, a, input, select, textarea, [data-row-action-stop]'));

const DataTable = ({ columns, data, emptyText = 'No records found.', loading = false, onRowClick }) => {
  const rows = Array.isArray(data) ? data : [];
  const hasRowClick = typeof onRowClick === 'function';

  if (loading) {
    return <TableSkeletonLoader rows={6} columns={columns.length} />;
  }

  const handleRowClick = (event, row) => {
    if (!hasRowClick || isInteractiveElement(event.target)) return;
    onRowClick(row);
  };

  const handleRowKeyDown = (event, row) => {
    if (!hasRowClick || isInteractiveElement(event.target) || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    onRowClick(row);
  };

  return (
    <div className="premium-data-table">
      <div className="space-y-3 p-3 md:hidden">
        {rows.length ? (
          rows.map((row, rowIndex) => {
            const titleColumn = columns.find((column) => ['task_title', 'full_name', 'project_name'].includes(column.key)) || columns[0];
            const metaColumns = columns.filter((column) => column.key !== titleColumn.key && column.header).slice(0, 5);
            const actionColumn = columns.find((column) => column.key === 'actions');

            return (
              <motion.article
                animate={{ opacity: 1, y: 0 }}
                className={`premium-data-table-mobile-card rounded-xl border p-3.5 shadow-sm transition ${
                  hasRowClick
                    ? 'cursor-pointer active:scale-[0.99]'
                    : ''
                }`}
                initial={{ opacity: 0, y: 6 }}
                key={row.task_id || row.user_id || row.project_id || row.import_id || rowIndex}
                onClick={(event) => handleRowClick(event, row)}
                onKeyDown={(event) => handleRowKeyDown(event, row)}
                role={hasRowClick ? 'button' : undefined}
                tabIndex={hasRowClick ? 0 : undefined}
                transition={{ delay: rowIndex * 0.025, duration: 0.22 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="premium-data-table-mobile-id text-[11px] font-bold uppercase tracking-[0.16em]">
                      {columns[0]?.render ? columns[0].render(row) : row[columns[0]?.key]}
                    </p>
                    <div className="premium-data-table-mobile-title mt-1 min-w-0 text-sm font-bold">
                      {titleColumn.render ? titleColumn.render(row) : row[titleColumn.key]}
                    </div>
                  </div>
                  {actionColumn ? <div data-row-action-stop>{actionColumn.render(row)}</div> : null}
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-2">
                  {metaColumns.map((column) => (
                    <div className="premium-data-table-mobile-field rounded-lg border px-2.5 py-2" key={column.key}>
                      <dt className="premium-data-table-mobile-label text-[10px] font-bold uppercase tracking-[0.14em]">{column.header}</dt>
                      <dd className="premium-data-table-mobile-value mt-1 min-w-0 truncate text-xs font-semibold">
                        {column.render ? column.render(row) : row[column.key] || 'N/A'}
                      </dd>
                    </div>
                  ))}
                </dl>
              </motion.article>
            );
          })
        ) : (
          <div className="premium-data-table-empty px-4 py-12 text-center text-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="premium-data-table-empty-icon grid h-11 w-11 place-items-center rounded-lg">
                <Database size={18} />
              </div>
              {emptyText}
            </div>
          </div>
        )}
      </div>

      <div className="premium-data-table-scroll hidden md:block">
        <table className="premium-data-table-grid min-w-full">
          <thead className="premium-data-table-head">
            <tr>
              {columns.map((column) => (

                <th
  key={column.key}
  className={`premium-data-table-heading whitespace-nowrap px-4 py-3.5 text-xs font-bold uppercase tracking-wider ${
    column.align === 'left'
      ? 'text-left'
      : column.align === 'right'
        ? 'text-right'
        : 'text-center'
  }`}
>
  <div
    className={`flex items-center gap-2 ${
      column.align === 'left'
        ? 'justify-start'
        : column.align === 'right'
          ? 'justify-end'
          : 'justify-center'
    } ${column.headerClassName || ''}`}

  >
    {column.header}
  </div>
</th>
                // <th
                //   key={column.key}
                //   className="premium-data-table-heading whitespace-nowrap px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider"
                // >
                //   <div className="flex items-center justify-center gap-2">
                //     {column.header}
                //   </div>
                // </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length ? (
              rows.map((row, rowIndex) => (
                <motion.tr
                  key={row.task_id || row.user_id || row.project_id || row.import_id || rowIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIndex * 0.025, duration: 0.22 }}
                  className={`premium-data-table-row group ${hasRowClick ? 'premium-data-table-row-clickable' : ''}`}
                  onClick={(event) => handleRowClick(event, row)}
                  onKeyDown={(event) => handleRowKeyDown(event, row)}
                  role={hasRowClick ? 'button' : undefined}
                  tabIndex={hasRowClick ? 0 : undefined}
                >
                  {columns.map((column) => (
                    // <td key={column.key} className="premium-data-table-cell whitespace-nowrap px-4 py-3.5 text-center text-sm">
                    //   {column.render ? column.render(row) : row[column.key]}
                    // </td>

                    <td
  key={column.key}
  className={`premium-data-table-cell whitespace-nowrap px-4 py-3.5 text-sm ${
    column.align === 'left'
      ? 'text-left'
      : column.align === 'right'
        ? 'text-right'
        : 'text-center'
  }`}
>
  {column.render ? column.render(row) : row[column.key]}
</td>
                  ))}
                </motion.tr>
              ))
            ) : (
              <tr className="premium-data-table-row">
                <td className="premium-data-table-empty px-4 py-12 text-center text-sm" colSpan={columns.length}>
                  <div className="flex flex-col items-center gap-3">
                    <div className="premium-data-table-empty-icon grid h-11 w-11 place-items-center rounded-lg">
                      <Database size={18} />
                    </div>
                    {emptyText}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div className="premium-data-table-footer flex items-center justify-between px-4 py-2.5 text-xs">
          <span>Showing {rows.length} entries</span>
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="premium-data-table-live-dot h-1.5 w-1.5 rounded-full" />
            Live data
          </span>
        </div>
      )}
    </div>
  );
};

export default DataTable;
