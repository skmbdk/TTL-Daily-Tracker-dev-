import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock3,
  Gauge,
  Hourglass,
  Layers,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard';
import FunnelChart from '../components/FunnelChart';
import PrioritySplitGauge from '../components/PrioritySplitGauge';
import { DashboardSkeletonLoader } from '../components/SkeletonLoader';
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage
} from '../components/ui/avatar';
import { useTheme } from '../context/ThemeContext';
import { getErrorMessage } from '../services/api';
import { dashboardService } from '../services/dashboardService';

const activeUsersRefreshMs = 60 * 1000;
const activityPageSize = 6;
const priorityOrder = ['Low', 'Medium', 'High', 'Critical'];
const heatmapStatuses = ['Backlog', 'To Do', 'In Progress', 'In Review', 'Testing', 'Blocked', 'Completed'];
const riskQuadrants = [
  { label: 'Healthy', tone: 'text-emerald-300' },
  { label: 'Busy', tone: 'text-blue-300' },
  { label: 'Delay Risk', tone: 'text-amber-300' },
  { label: 'Critical Load', tone: 'text-rose-300' }
];

const formatCompactNumber = (value) =>
  new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value || 0);

const truncateLabel = (value, maxLength = 16) => {
  if (!value) {
    return 'Unassigned';
  }
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
};

const getRiskBubbleTone = (item, isLight) => {
  if ((item?.overdue || 0) >= 4 || (item?.high_priority_open || 0) >= 6) {
    return isLight
      ? { fill: '#dc2626', glow: 'rgba(220, 38, 38, 0.26)', stroke: '#b91c1c' }
      : { fill: '#fb7185', glow: 'rgba(251, 113, 133, 0.3)', stroke: '#f43f5e' };
  }
  if ((item?.overdue || 0) >= 2 || (item?.high_priority_open || 0) >= 3) {
    return isLight
      ? { fill: '#d97706', glow: 'rgba(217, 119, 6, 0.24)', stroke: '#b45309' }
      : { fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.28)', stroke: '#fbbf24' };
  }
  if ((item?.in_progress || 0) >= 4) {
    return isLight
      ? { fill: '#2563eb', glow: 'rgba(37, 99, 235, 0.24)', stroke: '#1d4ed8' }
      : { fill: '#60a5fa', glow: 'rgba(96, 165, 250, 0.28)', stroke: '#38bdf8' };
  }
  return isLight
    ? { fill: '#0f9f78', glow: 'rgba(15, 159, 120, 0.22)', stroke: '#047857' }
    : { fill: '#34d399', glow: 'rgba(52, 211, 153, 0.24)', stroke: '#10b981' };
};

const getFunnelTone = (stage, isLight) => {
  const tones = {
    Backlog: isLight
      ? {
        background: 'linear-gradient(90deg, rgba(59,130,246,0.15), rgba(255,255,255,0.9) 44%, rgba(96,165,250,0.12))',
        border: 'rgba(59,130,246,0.25)',
        accent: '#2563eb',
        dot: '#3b82f6'
      }
      : {
        background: 'linear-gradient(90deg, rgba(96,165,250,0.16), rgba(96,165,250,0.04))',
        border: 'rgba(96,165,250,0.25)',
        accent: '#60a5fa',
        dot: '#60a5fa'
      },
    'To Do': isLight
      ? {
        background: 'linear-gradient(90deg, rgba(16,185,129,0.15), rgba(255,255,255,0.9) 44%, rgba(52,211,153,0.12))',
        border: 'rgba(16,185,129,0.25)',
        accent: '#059669',
        dot: '#10b981'
      }
      : {
        background: 'linear-gradient(90deg, rgba(34,211,238,0.16), rgba(34,211,238,0.04))',
        border: 'rgba(34,211,238,0.24)',
        accent: '#22d3ee',
        dot: '#22d3ee'
      },
    'In Progress': isLight
      ? {
        background: 'linear-gradient(90deg, rgba(99,102,241,0.15), rgba(255,255,255,0.9) 44%, rgba(129,140,248,0.12))',
        border: 'rgba(99,102,241,0.25)',
        accent: '#4f46e5',
        dot: '#6366f1'
      }
      : {
        background: 'linear-gradient(90deg, rgba(129,140,248,0.16), rgba(129,140,248,0.04))',
        border: 'rgba(129,140,248,0.24)',
        accent: '#818cf8',
        dot: '#818cf8'
      },
    'In Review': isLight
      ? {
        background: 'linear-gradient(90deg, rgba(139,92,246,0.15), rgba(255,255,255,0.9) 44%, rgba(167,139,250,0.12))',
        border: 'rgba(139,92,246,0.25)',
        accent: '#7c3aed',
        dot: '#8b5cf6'
      }
      : {
        background: 'linear-gradient(90deg, rgba(192,132,252,0.16), rgba(192,132,252,0.04))',
        border: 'rgba(192,132,252,0.24)',
        accent: '#c084fc',
        dot: '#c084fc'
      },
    Testing: isLight
      ? {
        background: 'linear-gradient(90deg, rgba(245,158,11,0.15), rgba(255,255,255,0.9) 44%, rgba(251,191,36,0.12))',
        border: 'rgba(245,158,11,0.25)',
        accent: '#d97706',
        dot: '#f59e0b'
      }
      : {
        background: 'linear-gradient(90deg, rgba(251,191,36,0.16), rgba(251,191,36,0.04))',
        border: 'rgba(251,191,36,0.24)',
        accent: '#fbbf24',
        dot: '#fbbf24'
      },
    Completed: isLight
      ? {
        background: 'linear-gradient(90deg, rgba(20,184,166,0.15), rgba(255,255,255,0.9) 44%, rgba(45,212,191,0.12))',
        border: 'rgba(20,184,166,0.25)',
        accent: '#0d9488',
        dot: '#14b8a6'
      }
      : {
        background: 'linear-gradient(90deg, rgba(52,211,153,0.16), rgba(52,211,153,0.04))',
        border: 'rgba(52,211,153,0.24)',
        accent: '#34d399',
        dot: '#34d399'
      }
  };

  return tones[stage] || tones['To Do'];
};

const DashboardView = ({ title, loader, isAdmin = false }) => {
  const { isLight } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityPage, setActivityPage] = useState(1);
  const [activeStatusName, setActiveStatusName] = useState(null);
  const [activePriorityName, setActivePriorityName] = useState(null);
  const [activeWorkloadName, setActiveWorkloadName] = useState(null);
  const [activeRiskName, setActiveRiskName] = useState(null);
  const [activeHeatCell, setActiveHeatCell] = useState(null);
  const [activeFunnelStage, setActiveFunnelStage] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const dashboardData = await loader();
        setData(dashboardData);
        setActiveUsers(dashboardData.active_users || []);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loader]);

  useEffect(() => {
    setActivityPage(1);
  }, [data?.recent_activity]);

  useEffect(() => {
    if (!data) return undefined;

    const refreshActiveUsers = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        setActiveUsers(await dashboardService.activeUsers());
      } catch {
        // Keep the existing dashboard quiet if the lightweight presence poll fails.
      }
    };

    const intervalId = window.setInterval(refreshActiveUsers, activeUsersRefreshMs);
    document.addEventListener('visibilitychange', refreshActiveUsers);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshActiveUsers);
    };
  }, [data]);

  const getStatusThemeColor = useCallback(
    (name, isLightMode) => {
      const lightMap = {
        'To Do': '#0284c7',       // Sky
        'In Progress': '#3b82f6', // Blue
        'Testing': '#d97706',     // Amber
        'Completed': '#059669',   // Emerald
        'Blocked': '#e11d48',     // Rose
        'In Review': '#7c3aed',   // Violet
        'Backlog': '#64748b'      // Slate
      };
      const darkMap = {
        'To Do': '#38bdf8',       // Sky 400
        'In Progress': '#60a5fa', // Blue 400
        'Testing': '#fbbf24',     // Amber 400
        'Completed': '#34d399',   // Emerald 400
        'Blocked': '#f43f5e',     // Rose 400
        'In Review': '#c084fc',   // Violet 400
        'Backlog': '#94a3b8'      // Slate 400
      };
      const map = isLightMode ? lightMap : darkMap;
      return map[name] || (isLightMode ? '#3b82f6' : '#60a5fa');
    },
    []
  );

  const statusPalette = useMemo(
    () =>
      isLight
        ? ['#0284c7', '#3b82f6', '#d97706', '#059669', '#e11d48', '#7c3aed', '#64748b']
        : ['#38bdf8', '#60a5fa', '#fbbf24', '#34d399', '#f43f5e', '#c084fc', '#94a3b8'],
    [isLight]
  );

  const priorityPalette = useMemo(
    () => ({
      Low: isLight ? '#10b981' : '#34d399',
      Medium: isLight ? '#3b82f6' : '#60a5fa',
      High: isLight ? '#f59e0b' : '#f59e0b',
      Critical: isLight ? '#f43f5e' : '#fb7185'
    }),
    [isLight]
  );

  const chartSurfaceClass = isLight
    ? 'glass-panel-hover bg-white/80 ring-1 ring-slate-200/60'
    : 'glass-panel-hover bg-white/[0.03] ring-1 ring-white/10';

  const chartHeaderBadgeClass = isLight
    ? 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
    : 'bg-white/[0.06] text-slate-300 ring-1 ring-white/10';

  const overview = data?.overview || {};
  const recentActivity = data?.recent_activity || [];
  const statusWiseData = data?.status_wise || [];
  const priorityWiseData = data?.priority_wise || [];
  const totalPriorityTasks = priorityWiseData.reduce((sum, item) => sum + Number(item.value || 0), 0);

  const workloadByPriority = useMemo(() => {
    const grouped = (data?.user_priority_workload || []).reduce((acc, item) => {
      const key = item.name || 'Unassigned';
      if (!acc[key]) {
        acc[key] = { name: key, Low: 0, Medium: 0, High: 0, Critical: 0, total: 0 };
      }
      acc[key][item.priority] = item.value;
      acc[key].total += item.value;
      return acc;
    }, {});

    return Object.values(grouped)
      .sort((left, right) => right.total - left.total)
      .slice(0, 10);
  }, [data?.user_priority_workload]);

  const heatmapModules = useMemo(() => {
    const grouped = (data?.module_status_heatmap || []).reduce((acc, item) => {
      const key = item.module_name || 'Unassigned';
      if (!acc[key]) {
        acc[key] = { module_name: key };
        heatmapStatuses.forEach((status) => {
          acc[key][status] = 0;
        });
        acc[key].total = 0;
      }
      acc[key][item.status] = item.value;
      acc[key].total += item.value;
      return acc;
    }, {});

    return Object.values(grouped).sort((left, right) => right.total - left.total);
  }, [data?.module_status_heatmap]);

  const completionTrendData = data?.completion_trend || [];
  const completionFunnelData = useMemo(() => {
    const maxValue = Math.max(1, ...(data?.completion_funnel || []).map((item) => Number(item.value || 0)));

    return (data?.completion_funnel || []).map((item) => ({
      stage: item.stage,
      count: Number(item.value || 0),
      width: `${Math.max(5, (Number(item.value || 0) / maxValue) * 100)}%`
    }));
  }, [data?.completion_funnel]);

  const riskMatrixData = useMemo(
    () =>
      (data?.risk_matrix || [])
        .sort((a, b) => b.open_tasks - a.open_tasks)
        .slice(0, 10),
    [data?.risk_matrix]
  );

  const heatmapMaxValue = useMemo(
    () => Math.max(1, ...heatmapModules.flatMap((module) => heatmapStatuses.map((status) => module[status] || 0))),
    [heatmapModules]
  );

  const riskAverage = useMemo(() => {
    if (!riskMatrixData.length) {
      return { inProgress: 0, overdue: 0 };
    }
    const totals = riskMatrixData.reduce(
      (acc, item) => ({
        inProgress: acc.inProgress + item.in_progress,
        overdue: acc.overdue + item.overdue
      }),
      { inProgress: 0, overdue: 0 }
    );

    return {
      inProgress: Number((totals.inProgress / riskMatrixData.length).toFixed(1)),
      overdue: Number((totals.overdue / riskMatrixData.length).toFixed(1))
    };
  }, [riskMatrixData]);

  const riskAxisMax = useMemo(
    () =>
      Math.max(
        4,
        ...riskMatrixData.flatMap((item) => [item.in_progress, item.overdue, item.open_tasks])
      ) + 1,
    [riskMatrixData]
  );

  const totalActivityPages = Math.max(1, Math.ceil(recentActivity.length / activityPageSize));
  const visibleActivity = recentActivity.slice((activityPage - 1) * activityPageSize, activityPage * activityPageSize);

  const topWorkloadUser = workloadByPriority.find((item) => item.name === activeWorkloadName) || workloadByPriority[0];
  const topStatusItem = statusWiseData.find((item) => item.name === activeStatusName) || statusWiseData[0];
  const activePriorityItem = priorityWiseData.find((item) => item.name === activePriorityName) || null;
  const activeRiskItem = riskMatrixData.find((item) => item.name === activeRiskName) || riskMatrixData[0];
  const topHeatModule = heatmapModules[0];
  const openedThisWeek = completionTrendData.reduce((sum, item) => sum + Number(item.opened || 0), 0);
  const completedThisWeek = completionTrendData.reduce((sum, item) => sum + Number(item.completed || 0), 0);
  const topFunnelStage = completionFunnelData.reduce(
    (top, item) => (!top || item.count > top.count ? item : top),
    null
  );
  const activeFunnelItem = completionFunnelData.find((item) => item.stage === activeFunnelStage) || topFunnelStage;

  if (loading) {
    return <DashboardSkeletonLoader />;
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">JIRA Server analytics</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-400">Live rollups from tasks, users, projects, and activity history.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ActiveUsersStrip users={activeUsers} isLight={isLight} />
            <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-emerald-200">
              <p className="text-xs text-emerald-200/80">Progress</p>
              <p className="text-2xl font-bold">{overview.progress_percentage || 0}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Layers} label="Total tasks" value={overview.total_tasks} accent="text-cyan-300" />
        <StatCard icon={CircleCheck} label="Completed" value={overview.completed_tasks} accent="text-emerald-300" />
        <StatCard icon={Hourglass} label="Pending" value={overview.pending_tasks} accent="text-blue-300" />
        <StatCard icon={XCircle} label="Blocked" value={overview.blocked_tasks} accent="text-rose-300" />
        <StatCard icon={AlertTriangle} label="Overdue" value={overview.overdue_tasks} accent="text-amber-300" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartPanel
          eyebrow="Execution mix"
          title="Status flow"
          badge={`${statusWiseData.length || 0} stages`}
          insight={
            topStatusItem
              ? `${topStatusItem.name} leads with ${formatCompactNumber(topStatusItem.value)} tasks`
              : 'No status distribution available yet.'
          }
        >
          <div className={`rounded-2xl p-3 ${chartSurfaceClass}`}>
            <ResponsiveContainer width="100%" height={312}>
              <BarChart
                data={statusWiseData}
                margin={{ top: 12, right: 10, left: -10, bottom: 4 }}
                barSize={32}
                onMouseMove={(state) => setActiveStatusName(state?.activeLabel || null)}
                onMouseLeave={() => setActiveStatusName(null)}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="name" stroke="var(--chart-axis)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--chart-axis)" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip isLight={isLight} />} cursor={{ fill: isLight ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255, 255, 255, 0.04)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusWiseData.map((entry) => {
                    const color = getStatusThemeColor(entry.name, isLight);
                    const isActive = !activeStatusName || activeStatusName === entry.name;
                    return (
                      <Cell
                        key={entry.name}
                        fill={color}
                        fillOpacity={isActive ? (isLight ? 0.85 : 0.75) : 0.22}
                        stroke={color}
                        strokeWidth={isActive ? 1 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
        <ChartPanel
          eyebrow="Velocity tracking"
          title="Completion Trend"
          badge={`${formatCompactNumber(openedThisWeek)} opened`}
          insight={`Last 7 days: ${formatCompactNumber(completedThisWeek)} completed tasks captured from live activity history.`}
        >
          <div className={`rounded-2xl p-3 ${chartSurfaceClass}`}>
            <ResponsiveContainer width="100%" height={312}>
              <AreaChart data={completionTrendData} margin={{ top: 12, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isLight ? '#3b82f6' : '#60a5fa'} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={isLight ? '#3b82f6' : '#60a5fa'} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isLight ? '#10b981' : '#34d399'} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={isLight ? '#10b981' : '#34d399'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="label" stroke="var(--chart-axis)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--chart-axis)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip isLight={isLight} />} cursor={{ stroke: 'var(--chart-grid)', strokeWidth: 1, fill: 'transparent' }} />
                <Area type="monotone" dataKey="opened" name="Opened Tasks" stroke={isLight ? '#3b82f6' : '#60a5fa'} fillOpacity={1} fill="url(#colorOpened)" strokeWidth={2} />
                <Area type="monotone" dataKey="completed" name="Completed Tasks" stroke={isLight ? '#10b981' : '#34d399'} fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={2} />
                <Legend
                  wrapperStyle={{
                    paddingTop: '0.75rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}
                  iconType="circle"
                  iconSize={8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>

      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartPanel
          eyebrow="Workload vs delay"
          title="Delivery risk matrix"
          badge={`${riskMatrixData.length || 0} ${isAdmin ? 'assignees' : 'profiles'}`}
          insight={
            activeRiskItem
              ? `${activeRiskItem.name} has ${formatCompactNumber(activeRiskItem.in_progress)} in progress, ${formatCompactNumber(activeRiskItem.overdue)} overdue, and ${formatCompactNumber(activeRiskItem.open_tasks)} open tasks`
              : 'No risk profile data available yet.'
          }
          actions={
            <div className="flex flex-wrap gap-2">
              {riskQuadrants.map((item) => (
                <span
                  key={item.label}
                  className={`rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium ${item.tone}`}
                >
                  {item.label}
                </span>
              ))}
            </div>
          }
        >
          <div className={`rounded-2xl p-3 ${chartSurfaceClass}`}>
            <ResponsiveContainer width="100%" height={318}>
              <ScatterChart margin={{ top: 16, right: 18, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--chart-grid)" />
                <XAxis
                  type="number"
                  dataKey="in_progress"
                  name="In Progress"
                  domain={[0, riskAxisMax]}
                  stroke="var(--chart-axis)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="overdue"
                  name="Overdue"
                  domain={[0, riskAxisMax]}
                  stroke="var(--chart-axis)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <ZAxis type="number" dataKey="open_tasks" range={[180, 1600]} />
                <Tooltip cursor={{ strokeDasharray: '4 4' }} content={<RiskMatrixTooltip />} />
                <ReferenceLine
                  x={riskAverage.inProgress}
                  stroke={isLight ? '#64748b' : '#94a3b8'}
                  strokeDasharray="5 5"
                />
                <ReferenceLine
                  y={riskAverage.overdue}
                  stroke={isLight ? '#64748b' : '#94a3b8'}
                  strokeDasharray="5 5"
                />
                <Scatter
                  data={riskMatrixData}
                  shape={(props) => (
                    <RiskBubbleShape
                      {...props}
                      activeRiskName={activeRiskName}
                      isLight={isLight}
                      onEnter={setActiveRiskName}
                      onLeave={() => setActiveRiskName(null)}
                    />
                  )}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {riskMatrixData.map((item) => {
              const isActive = activeRiskItem?.name === item.name;
              const tone = getRiskBubbleTone(item, isLight);

              return (
                <button
                  key={item.name}
                  type="button"
                  onMouseEnter={() => setActiveRiskName(item.name)}
                  onMouseLeave={() => setActiveRiskName(null)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${isLight
                      ? 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                    } ${isActive ? 'shadow-glow' : ''}`}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tone.fill }} />
                  <span className="max-w-[9rem] truncate text-white">{item.name}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <RiskMetricCard label="In Progress" value={activeRiskItem?.in_progress || 0} accent="text-blue-300" />
            <RiskMetricCard label="Overdue" value={activeRiskItem?.overdue || 0} accent="text-rose-300" />
            <RiskMetricCard label="Open Tasks" value={activeRiskItem?.open_tasks || 0} accent="text-cyan-300" />
            <RiskMetricCard label="High/Critical" value={activeRiskItem?.high_priority_open || 0} accent="text-amber-300" />
          </div>
        </ChartPanel>

        <ChartPanel
          eyebrow={isAdmin ? 'Capacity balance' : 'My task balance'}
          title={isAdmin ? 'User workload by priority' : 'My workload by priority'}
          badge={`${workloadByPriority.length || 0} ${isAdmin ? 'people' : 'rows'}`}
          insight={
            topWorkloadUser
              ? `${topWorkloadUser.name} carries ${formatCompactNumber(topWorkloadUser.total)} total tasks`
              : 'No workload data available yet.'
          }
        >
          <div className="mb-4 flex flex-wrap gap-2">
            {priorityOrder.map((priority) => (
              <div
                key={priority}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${chartHeaderBadgeClass}`}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: priorityPalette[priority] }} />
                {priority}
              </div>
            ))}
          </div>
          <div className={`rounded-2xl p-3 ${chartSurfaceClass}`}>
          <ResponsiveContainer width="100%" height={480}>
              <BarChart
                data={workloadByPriority}
                layout="vertical"
                margin={{ top: 10, right: 16, left: 8, bottom: 8 }}
                barSize={20}
                onMouseMove={(state) => setActiveWorkloadName(state?.activeLabel || null)}
                onMouseLeave={() => setActiveWorkloadName(null)}
              >
                <CartesianGrid horizontal strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis type="number" stroke="var(--chart-axis)" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--chart-axis)"
                  fontSize={11}
                  width={128}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => truncateLabel(value, 18)}
                />
                <Tooltip content={<ChartTooltip isLight={isLight} />} cursor={{ fill: isLight ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.04)' }} />
                {priorityOrder.map((priority, index) => (
                  <Bar
                    key={priority}
                    dataKey={priority}
                    stackId="priority"
                    fill={priorityPalette[priority]}
                    radius={index === priorityOrder.length - 1 ? [0, 10, 10, 0] : 0}
                  />
                ))}
                <Legend
                  wrapperStyle={{
                    paddingTop: '0.75rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}
                  iconType="circle"
                  iconSize={8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">

        <ChartPanel
          eyebrow="Priority mix"
          title="Priority split"
          badge={`${formatCompactNumber(priorityWiseData.reduce((sum, item) => sum + item.value, 0))} tasks`}
          insight={
            activePriorityItem
              ? `${activePriorityItem.name} priority holds ${formatCompactNumber(activePriorityItem.value)} tasks`
              : 'Hover a dot segment to inspect the current priority breakdown.'
          }
        >
          <PrioritySplitGauge
            data={priorityWiseData}
            totalTasks={totalPriorityTasks}
            activePriorityName={activePriorityName}
            onHoverPriority={setActivePriorityName}
          />
        </ChartPanel>
        <ChartPanel
          eyebrow="Pipeline view"
          title="Completion Funnel"
          badge={`${completionFunnelData.length || 0} stages`}
          insight={
            activeFunnelItem
              ? `${activeFunnelItem.stage} currently holds ${formatCompactNumber(activeFunnelItem.count)} tasks`
              : 'No funnel data available yet.'
          }
        >
          <div className={`flex flex-1 flex-col items-center justify-center rounded-2xl p-5 sm:p-6 min-h-[320px] w-full ${chartSurfaceClass}`}>
            <FunnelChart
              data={completionFunnelData}
              activeStage={activeFunnelStage}
              onHoverStage={setActiveFunnelStage}
              className="my-auto"
            />
          </div>
        </ChartPanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartPanel
          eyebrow="Cross-module density"
          title="Module-wise status heatmap"
          badge={`${heatmapModules.length || 0} modules`}
          insight={
            activeHeatCell
              ? `${activeHeatCell.module} has ${formatCompactNumber(activeHeatCell.value)} tasks in ${activeHeatCell.status}`
              : topHeatModule
                ? `${topHeatModule.module_name} has the broadest activity footprint`
                : 'No module activity available yet.'
          }
          actions={
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${chartHeaderBadgeClass}`}>
              <span className="text-slate-400">Intensity</span>
              <div className="h-2 w-24 rounded-full bg-gradient-to-r from-cyan-400/20 via-blue-400/55 to-violet-400/90" />
            </div>
          }
        >
          <div className="overflow-x-auto">
            <div className="min-w-[36rem] xl:min-w-0">
              <div className="grid grid-cols-[minmax(8rem,1.5fr)_repeat(7,minmax(3.5rem,1fr))] gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider sm:tracking-[0.12em] text-slate-500">
                <div className="px-3 py-2">Module</div>
                {heatmapStatuses.map((status) => (
                  <div key={status} className="px-1 sm:px-3 py-2 text-center truncate" title={status}>
                    {status}
                  </div>
                ))}
              </div>
              <div className="mt-2 space-y-2">
                {heatmapModules.length ? (
                  heatmapModules.map((module) => (
                    <div
                      key={module.module_name}
                      className="grid grid-cols-[minmax(8rem,1.5fr)_repeat(7,minmax(3.5rem,1fr))] gap-1.5 sm:gap-2"
                    >
                      <div
                        className={`rounded-xl border px-3 py-3 text-sm font-medium ${isLight ? 'border-slate-200 bg-white/75' : 'border-white/10 bg-white/[0.03]'
                          } text-white`}
                      >
                        <div className="truncate">{module.module_name}</div>
                        <div className="mt-1 text-xs text-slate-500">{formatCompactNumber(module.total)} total</div>
                      </div>
                      {heatmapStatuses.map((status) => {
                        const cellValue = module[status] || 0;
                        const intensity = cellValue ? 0.16 + (cellValue / heatmapMaxValue) * 0.72 : 0.06;
                        const isActive =
                          activeHeatCell &&
                          activeHeatCell.module === module.module_name &&
                          activeHeatCell.status === status;

                        return (
                          <button
                            key={`${module.module_name}-${status}`}
                            type="button"
                            onMouseEnter={() =>
                              setActiveHeatCell({
                                module: module.module_name,
                                status,
                                value: cellValue
                              })
                            }
                            onMouseLeave={() => setActiveHeatCell(null)}
                            className={`min-h-[3.5rem] rounded-xl border text-sm font-semibold text-white transition ${isLight ? 'border-slate-200' : 'border-white/10'
                              } ${isActive ? 'scale-[1.03] shadow-glow' : ''}`}
                            style={{
                              background: isLight
                                ? `linear-gradient(135deg, rgba(37, 99, 235, ${Math.max(intensity * 0.55, 0.08)}), rgba(14, 165, 233, ${Math.max(intensity, 0.1)}))`
                                : `linear-gradient(135deg, rgba(34, 211, 238, ${Math.max(intensity, 0.08)}), rgba(99, 102, 241, ${Math.max(intensity * 0.9, 0.08)}))`
                            }}
                          >
                            {cellValue}
                          </button>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <ChartEmptyState message="No module activity available." />
                )}
              </div>
            </div>
          </div>
        </ChartPanel>

        <div className="glass-panel flex min-h-[22.5rem] flex-col p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Gauge size={18} className="text-cyan-300" />
              <div>
                <h3 className="font-semibold text-white">Recent activity</h3>
                <p className="text-xs text-slate-500">Latest updates across tasks and status changes.</p>
              </div>
            </div>
            {recentActivity.length ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn-secondary px-3"
                  onClick={() => setActivityPage((current) => current - 1)}
                  disabled={activityPage <= 1}
                  title="Previous activity page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="min-w-16 text-center text-xs font-semibold text-slate-400">
                  {activityPage} / {totalActivityPages}
                </span>
                <button
                  type="button"
                  className="btn-secondary px-3"
                  onClick={() => setActivityPage((current) => current + 1)}
                  disabled={activityPage >= totalActivityPages}
                  title="Next activity page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            ) : null}
          </div>
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
            {recentActivity.length ? (
              visibleActivity.map((item) => (
                <div
                  key={item.history_id}
              className={`flex-1 flex flex-col justify-center w-full min-h-[4.5rem] rounded-xl border p-3 ${isLight ? 'border-slate-200 bg-white/75' : 'border-white/10 bg-white/[0.03]'
                    }`}
                >
                  <p className="text-sm font-medium text-white">{item.task_title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.change_description} · {item.changed_by_name || 'System'}
                  </p>
                </div>
              ))
            ) : (
              <ChartEmptyState message="No activity yet." />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const ChartPanel = ({ eyebrow, title, badge, insight, actions, children }) => (
  <div className="glass-panel flex flex-col justify-between overflow-hidden p-4 sm:p-5 h-full">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
      <div>
        {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">{eyebrow}</p> : null}
        <h3 className="mt-1 text-lg font-bold tracking-tight text-zinc-100">{title}</h3>
        {insight ? <p className="mt-1 text-sm text-zinc-400">{insight}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {badge ? (
          <div className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs font-semibold text-zinc-300">
            {badge}
          </div>
        ) : null}
        {actions}
      </div>
    </div>
    <div className="flex-1 flex flex-col justify-center">
      {children}
    </div>
  </div>
);

const RiskMetricCard = ({ label, value, accent }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
    <p className={`mt-2 text-lg font-semibold ${accent}`}>{formatCompactNumber(value)}</p>
  </div>
);

const RiskBubbleShape = ({ cx, cy, payload, size, activeRiskName, isLight, onEnter, onLeave }) => {
  const radius = Math.max(12, Math.sqrt(size || 0) / 2.8);
  const isActive = activeRiskName === payload?.name;
  const tone = getRiskBubbleTone(payload, isLight);

  return (
    <g onMouseEnter={() => onEnter(payload?.name || null)} onMouseLeave={onLeave} className="cursor-pointer">
      <circle cx={cx} cy={cy} fill={tone.fill}>
        <animate
          attributeName="r"
          values={`${radius};${radius + 16}`}
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.7;0"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx={cx}
        cy={cy}
        r={radius + 5}
        fill={tone.glow}
        opacity={isActive ? 0.95 : 0.26}
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={tone.fill}
        fillOpacity={isActive ? 0.86 : 0.58}
        stroke={tone.stroke}
        strokeOpacity={1}
        strokeWidth={isActive ? 2.5 : 1.2}
      />
      {isActive ? (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={radius * 0.4}
            fill={isLight ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.18)'}
          />
          <text
            x={cx}
            y={cy - radius - 10}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="var(--text-primary)"
            style={{ pointerEvents: 'none' }}
          >
            {truncateLabel(payload?.name, 18)}
          </text>
        </>
      ) : null}
    </g>
  );
};

const ChartTooltip = ({ active, label, payload, isLight }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const title = label || payload[0]?.name || payload[0]?.payload?.name || 'Details';

  return (
    <div
      className="chart-tooltip"
      style={{
        background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(24, 24, 27, 0.95)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${isLight ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.08)'}`,
        borderRadius: 14,
        color: 'var(--text-primary)',
        boxShadow: isLight
          ? '0 20px 40px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(37, 99, 235, 0.1)'
          : '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        padding: '0.85rem 1rem',
        minWidth: '13rem',
        animation: 'tooltipFadeIn 0.2s ease-out'
      }}
    >
      <p
        style={{
          color: isLight ? '#0f172a' : '#94a3b8',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          marginBottom: '0.6rem',
          textTransform: 'uppercase',
          borderBottom: `1px solid ${isLight ? 'rgba(37, 99, 235, 0.15)' : 'rgba(34, 211, 238, 0.1)'}`,
          paddingBottom: '0.5rem'
        }}
      >
        {title}
      </p>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {payload.map((entry) => (
          <div
            key={`${entry.name}-${entry.dataKey}`}
            style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}
          >
            <span style={{ alignItems: 'center', color: 'var(--text-secondary)', display: 'inline-flex', gap: '0.6rem' }}>
              <span
                style={{
                  background: entry.color || entry.fill || 'var(--text-muted)',
                  borderRadius: '6px',
                  display: 'inline-block',
                  height: '0.7rem',
                  width: '0.7rem',
                  boxShadow: `0 0 8px ${entry.color || entry.fill || 'var(--text-muted)'}40`
                }}
              />
              <span style={{ fontSize: '0.8rem' }}>{entry.name || entry.dataKey}</span>
            </span>
            <span style={{
              color: isLight ? '#0f172a' : '#e6eefb',
              fontWeight: 700,
              fontSize: '0.85rem',
              background: isLight ? 'rgba(37, 99, 235, 0.1)' : 'rgba(34, 211, 238, 0.1)',
              padding: '0.15rem 0.5rem',
              borderRadius: '6px'
            }}>{formatCompactNumber(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RiskMatrixTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;
  if (!item) {
    return null;
  }

  return (
    <div
      style={{
        background: 'var(--panel-strong)',
        border: '1px solid var(--border-soft)',
        borderRadius: 12,
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-glow)',
        minWidth: '14rem',
        padding: '0.85rem 0.95rem'
      }}
    >
      <p
        style={{
          color: 'var(--text-primary)',
          fontSize: '0.9rem',
          fontWeight: 700,
          marginBottom: '0.65rem'
        }}
      >
        {item.name}
      </p>
      <div style={{ display: 'grid', gap: '0.45rem' }}>
        <RiskTooltipRow label="In Progress" value={item.in_progress} />
        <RiskTooltipRow label="Overdue" value={item.overdue} />
        <RiskTooltipRow label="Open Tasks" value={item.open_tasks} />
        <RiskTooltipRow label="High/Critical" value={item.high_priority_open} />
      </div>
    </div>
  );
};

const RiskTooltipRow = ({ label, value }) => (
  <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{formatCompactNumber(value)}</span>
  </div>
);

const ChartEmptyState = ({ message }) => (
  <p className="py-10 text-center text-sm text-slate-500">{message}</p>
);

const ActiveUsersStrip = ({ users = [], isLight }) => {
  const visibleUsers = users.slice(0, 6);
  const overflowCount = Math.max(0, users.length - visibleUsers.length);

  return (
    <div
      className={`rounded-xl border px-3 py-2.5 shadow-sm backdrop-blur-md ${
        isLight ? 'border-slate-200 bg-white/85' : 'border-zinc-800/80 bg-zinc-900/60'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Live team</p>
          </div>
          <p className={`mt-0.5 text-sm font-bold ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
            {users.length} active
          </p>
        </div>
        <AvatarGroup className="shrink-0">
          {visibleUsers.length ? (
            visibleUsers.map((user, index) => (
              <Avatar
                key={user.user_id}
                className={`h-10 w-10 border-2 transition-all duration-300 hover:z-10 hover:-translate-y-0.5 hover:scale-105 ${
                  isLight
                    ? 'border-white ring-1 ring-slate-200/80 hover:ring-slate-400 shadow-sm'
                    : 'border-zinc-900 ring-1 ring-zinc-700/60 hover:ring-zinc-500 shadow-md'
                }`}
                title={`${user.full_name}${user.active_sessions > 1 ? ` (${user.active_sessions} sessions)` : ''}`}
              >
                {user.avatar_url ? (
                  <AvatarImage src={user.avatar_url} alt={user.full_name} />
                ) : null}
                <AvatarFallback
                  className="text-[11px] font-bold tracking-wide"
                  style={getAvatarStyle(user, index, isLight)}
                >
                  {user.initials || getInitials(user.full_name)}
                </AvatarFallback>
                <AvatarBadge className="grid h-2.5 w-2.5 place-items-center overflow-visible bg-transparent ring-0 shadow-none">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-pulse" />
                  <span className={`relative inline-flex h-2 w-2 rounded-full bg-emerald-500 ring-2 ${isLight ? 'ring-white' : 'ring-zinc-900'}`} />
                </AvatarBadge>
              </Avatar>
            ))
          ) : (
            <Avatar className={`h-10 w-10 border-2 transition-all ${isLight ? 'border-white ring-1 ring-slate-200' : 'border-zinc-900 ring-1 ring-zinc-700/60'}`}>
              <AvatarFallback
                className={`text-[11px] font-bold ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-zinc-800 text-zinc-500'}`}
              >
                0
              </AvatarFallback>
            </Avatar>
          )}
          {overflowCount ? (
            <AvatarGroupCount
              className={`h-10 w-10 text-[10px] font-bold border-2 transition-all ${
                isLight
                  ? 'bg-slate-100 text-slate-700 border-white ring-1 ring-slate-200 shadow-sm'
                  : 'bg-zinc-800 text-zinc-200 border-zinc-900 ring-1 ring-zinc-700/60 shadow-md'
              }`}
              title={`${overflowCount} more active users`}
            >
              +{overflowCount}
            </AvatarGroupCount>
          ) : null}
        </AvatarGroup>
      </div>
    </div>
  );
};

const avatarGradientsDark = [
  { bg: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)', text: '#f4f4f5' },
  { bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', text: '#e0e7ff' },
  { bg: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', text: '#d1fae5' },
  { bg: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)', text: '#ede9fe' },
  { bg: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)', text: '#fef3c7' },
  { bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', text: '#f1f5f9' },
  { bg: 'linear-gradient(135deg, #881337 0%, #be123c 100%)', text: '#ffe4e6' },
  { bg: 'linear-gradient(135deg, #134e4a 0%, #0f766e 100%)', text: '#ccfbf1' },
];

const avatarGradientsLight = [
  { bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', text: '#1e293b' },
  { bg: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', text: '#3730a3' },
  { bg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', text: '#065f46' },
  { bg: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)', text: '#5b21b6' },
  { bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', text: '#92400e' },
  { bg: 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)', text: '#9f1239' },
  { bg: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)', text: '#115e59' },
  { bg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', text: '#075985' },
];

const getAvatarStyle = (user, index, isLight) => {
  const palette = isLight ? avatarGradientsLight : avatarGradientsDark;
  const item = palette[(Number(user.user_id) || index) % palette.length];
  return { background: item.bg, color: item.text };
};

const getInitials = (name = '') =>
  name
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

export default DashboardView;