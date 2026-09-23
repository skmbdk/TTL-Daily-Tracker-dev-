import { useTheme } from '../context/ThemeContext';

const Skeleton = ({ className = '', delay = 0, style }) => (
  <div
    className={`skeleton-block ${className}`}
    style={{ animationDelay: `${delay}ms`, ...style }}
    aria-hidden="true"
  />
);

// Table skeleton loader
export const TableSkeletonLoader = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="premium-data-table skeleton-panel">
      <div className="premium-data-table-scroll overflow-x-auto">
        <table className="premium-data-table-grid min-w-full">
          <thead className="premium-data-table-head">
            <tr>
              {Array(columns)
                .fill(null)
                .map((_, i) => (
                  <th key={i} className="premium-data-table-heading whitespace-nowrap px-4 py-3.5 text-center">
                    <Skeleton className="mx-auto h-4 w-24 rounded" delay={i * 45} />
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {Array(rows)
              .fill(null)
              .map((_, rowIndex) => (
                <tr key={rowIndex} className="premium-data-table-row">
                  {Array(columns)
                    .fill(null)
                    .map((_, colIndex) => (
                      <td key={colIndex} className="premium-data-table-cell whitespace-nowrap px-4 py-3.5 text-center">
                        <Skeleton
                          className={`mx-auto h-4 rounded ${colIndex % 3 === 0 ? 'w-24' : colIndex % 3 === 1 ? 'w-32' : 'w-20'}`}
                          delay={(rowIndex * columns + colIndex) * 28}
                        />
                      </td>
                    ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Dashboard stat card skeleton
export const StatCardSkeletonLoader = () => {
  const { isLight } = useTheme();
  
  return (
    <div className={`glass-panel skeleton-panel flex flex-col justify-between rounded-lg p-4 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="mb-2 h-4 w-24 rounded" />
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="mt-3 h-3 w-28 rounded" delay={120} />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" delay={80} />
      </div>
    </div>
  );
};

// Dashboard grid skeleton (5 stat cards)
export const DashboardStatGridSkeletonLoader = () => (
  <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
    {Array(5)
      .fill(null)
      .map((_, i) => (
        <StatCardSkeletonLoader key={i} />
      ))}
  </section>
);

// Chart skeleton
export const ChartSkeletonLoader = () => {
  const { isLight } = useTheme();
  
  return (
    <div className={`glass-panel skeleton-panel rounded-lg p-5 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="h-8 w-24 rounded-lg" delay={90} />
      </div>
      <div className="space-y-3 rounded-lg border border-white/10 p-4">
        <Skeleton className="h-4 w-11/12 rounded" delay={40} />
        <Skeleton className="h-4 w-10/12 rounded" delay={80} />
        <Skeleton className="h-4 w-full rounded" delay={120} />
        <Skeleton className="h-4 w-9/12 rounded" delay={160} />
        <div className="mt-5 flex h-44 items-end gap-3">
          {[52, 76, 44, 88, 61, 95, 70, 83].map((height, index) => (
            <Skeleton key={height + index} className="flex-1 rounded-t-lg" delay={index * 65} style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Dashboard full skeleton
export const DashboardSkeletonLoader = () => (
  <div className="space-y-6">
    <section className="glass-panel p-5">
      <Skeleton className="mb-3 h-3 w-40 rounded" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded" delay={80} />
        <Skeleton className="h-4 w-96 max-w-full rounded" delay={140} />
      </div>
    </section>
    <DashboardStatGridSkeletonLoader />
    <section className="grid gap-4 xl:grid-cols-2">
      <ChartSkeletonLoader />
      <ChartSkeletonLoader />
    </section>
  </div>
);

// Kanban column skeleton
export const KanbanColumnSkeletonLoader = () => {
  const { isLight } = useTheme();
  
  return (
    <div className={`skeleton-panel flex flex-col gap-3 rounded-lg border p-3 ${isLight ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-white/[0.02]'}`}>
      <Skeleton className="h-6 w-28 rounded" />
      {Array(3)
        .fill(null)
        .map((_, i) => (
          <div key={i} className={`space-y-2 rounded-lg p-3 ${isLight ? 'border-gray-200 bg-white' : 'border-white/10 bg-white/[0.02]'}`}>
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-36 rounded" delay={i * 80} />
              <Skeleton className="h-5 w-14 rounded-md" delay={i * 80 + 40} />
            </div>
            <Skeleton className="h-4 w-full rounded" delay={i * 80 + 70} />
            <Skeleton className="h-4 w-4/5 rounded" delay={i * 80 + 110} />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-12 rounded-full" delay={i * 80 + 150} />
              <Skeleton className="h-6 w-12 rounded-full" delay={i * 80 + 190} />
            </div>
          </div>
        ))}
    </div>
  );
};

// Kanban board skeleton
export const KanbanBoardSkeletonLoader = () => (
  <div className="flex gap-4 overflow-x-auto pb-4">
    {Array(4)
      .fill(null)
      .map((_, i) => (
        <div key={i} className="w-80 shrink-0">
          <KanbanColumnSkeletonLoader />
        </div>
      ))}
  </div>
);

// Form skeleton
export const FormSkeletonLoader = () => (
  <div className="space-y-4">
    {Array(4)
      .fill(null)
      .map((_, i) => (
        <div key={i}>
          <Skeleton className="mb-2 h-4 w-24 rounded" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      ))}
  </div>
);

export default Skeleton;
