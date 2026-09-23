import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useTheme } from '../context/ThemeContext';

const priorityOrder = ['Low', 'Medium', 'High', 'Critical'];

const paletteByPriority = {
  Low: {
    light: '#60a5fa',
    dark: '#5891f8',
    glow: 'rgba(96, 165, 250, 0.4)',
  },
  Medium: {
    light: '#4ade80',
    dark: '#34d399',
    glow: 'rgba(52, 211, 153, 0.4)',
  },
  High: {
    light: '#fbbf24',
    dark: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  Critical: {
    light: '#f87171',
    dark: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.4)',
  },
};

export function PrioritySplitGauge({
  data = [],
  totalTasks = 0,
  activePriorityName,
  onHoverPriority,
  className,
}) {
  const { isLight } = useTheme();
  const [internalHover, setInternalHover] = useState(null);

  const activeCategory = activePriorityName !== undefined ? activePriorityName : internalHover;
  const setActiveCategory = (cat) => {
    if (onHoverPriority) {
      onHoverPriority(cat);
    } else {
      setInternalHover(cat);
    }
  };

  // Process data sorted by priorityOrder
  const processedData = useMemo(() => {
    const map = new Map((data || []).map((item) => [item.name, Number(item.value || 0)]));
    const total = Array.from(map.values()).reduce((sum, v) => sum + v, 0) || totalTasks || 1;

    return priorityOrder.map((name) => {
      const val = map.get(name) || 0;
      const pct = (val / total) * 100;
      return {
        name,
        value: val,
        percentage: pct,
        color: isLight ? paletteByPriority[name].light : paletteByPriority[name].dark,
        glow: paletteByPriority[name].glow,
      };
    });
  }, [data, totalTasks, isLight]);

  const totalCount = useMemo(() => {
    return processedData.reduce((sum, item) => sum + item.value, 0);
  }, [processedData]);

  // Active highlighted info for center text
  const activeItem = useMemo(() => {
    if (!activeCategory) return null;
    return processedData.find((item) => item.name === activeCategory);
  }, [activeCategory, processedData]);

  // Generate dot positions along concentric semi-circle arcs
  const dots = useMemo(() => {
    const ringConfigs = [
      { radius: 136, numDots: 32, dotR: 5.5 }, // Outer ring
      { radius: 114, numDots: 26, dotR: 5.0 }, // Inner ring
    ];

    const allDots = [];
    let dotIdCounter = 0;

    const totalDotsCount = ringConfigs.reduce((acc, r) => acc + r.numDots, 0);

    const cumulativeRanges = [];
    let currentFraction = 0;

    processedData.forEach((item) => {
      const frac = totalCount > 0 ? item.value / totalCount : 0.25;
      const start = currentFraction;
      const end = currentFraction + frac;
      cumulativeRanges.push({ name: item.name, start, end });
      currentFraction = end;
    });

    ringConfigs.forEach((ring, ringIdx) => {
      const { radius, numDots, dotR } = ring;

      for (let i = 0; i < numDots; i++) {
        const startAngle = Math.PI * 1.02;
        const endAngle = -Math.PI * 0.02;
        const angle = startAngle - (i / (numDots - 1)) * (startAngle - endAngle);

        const cx = 180 + radius * Math.cos(angle);
        const cy = 165 - radius * Math.sin(angle);

        const dotFraction = (ringIdx * ringConfigs[0].numDots + i) / totalDotsCount;

        const categoryMatch = cumulativeRanges.find(
          (r) => dotFraction >= r.start && dotFraction <= r.end
        ) || cumulativeRanges[cumulativeRanges.length - 1] || { name: 'Low' };

        const sinFactor = Math.sin((i / (numDots - 1)) * Math.PI);
        const baseOpacity = Math.max(0.2, Math.min(1.0, 0.35 + 0.65 * sinFactor));

        allDots.push({
          id: `dot-${dotIdCounter++}`,
          cx,
          cy,
          r: dotR,
          category: categoryMatch.name,
          color: isLight ? paletteByPriority[categoryMatch.name].light : paletteByPriority[categoryMatch.name].dark,
          glow: paletteByPriority[categoryMatch.name].glow,
          baseOpacity,
          angle,
        });
      }
    });

    return allDots;
  }, [processedData, totalCount, isLight]);

  return (
    <div
      className={clsx(
        "relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-300",
        isLight
          ? "glass-panel-hover bg-white/80 text-slate-900 ring-1 ring-slate-200/60"
          : "glass-panel-hover bg-white/[0.03] text-white ring-1 ring-white/10",
        className
      )}
    >
      {/* ─── Top Arc Gauge Chart ────────────────────────────────────────────────── */}
      <div className="relative flex flex-col items-center justify-center pt-2 pb-2">
        <svg
          viewBox="0 0 360 195"
          className="w-full max-w-[340px] overflow-visible select-none"
        >
          {/* Render Dotted Arc Dots */}
          {dots.map((dot) => {
            const isCategoryActive = !activeCategory || activeCategory === dot.category;
            const isHoveredCategory = activeCategory === dot.category;

            let finalOpacity = dot.baseOpacity;
            if (activeCategory) {
              finalOpacity = isCategoryActive ? Math.min(1, dot.baseOpacity + 0.3) : 0.15;
            }

            return (
              <motion.circle
                key={dot.id}
                cx={dot.cx}
                cy={dot.cy}
                r={dot.r}
                fill={dot.color}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: finalOpacity,
                  scale: isHoveredCategory ? 1.25 : 1,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setActiveCategory(dot.category)}
                onMouseLeave={() => setActiveCategory(null)}
                style={{
                  filter: isHoveredCategory ? `drop-shadow(0 0 6px ${dot.color})` : undefined,
                }}
              />
            );
          })}
        </svg>

        {/* Center Labels */}
        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className={clsx(
            "text-[11px] font-bold tracking-widest uppercase transition-colors duration-200",
            isLight ? "text-slate-400" : "text-slate-400"
          )}>
            {activeItem ? activeItem.name.toUpperCase() : "TOTAL"}
          </span>
          <motion.span
            key={activeItem ? activeItem.name : "total"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              "text-3xl sm:text-4xl font-black tracking-tight mt-0.5",
              isLight ? "text-slate-900" : "text-white"
            )}
          >
            {activeItem ? activeItem.value.toLocaleString() : totalCount.toLocaleString()}
          </motion.span>
        </div>
      </div>

      {/* ─── Metric Cards (2x2 Grid) ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/50 dark:border-white/[0.06]">
        {processedData.map((item) => {
          const isActive = !activeCategory || activeCategory === item.name;
          return (
            <div
              key={item.name}
              onMouseEnter={() => setActiveCategory(item.name)}
              onMouseLeave={() => setActiveCategory(null)}
              className={clsx(
                "group cursor-pointer rounded-xl p-2.5 sm:p-3 transition-all duration-200 border",
                isLight
                  ? isActive
                    ? "bg-slate-100/70 border-slate-200 shadow-2xs"
                    : "bg-transparent border-transparent opacity-60 hover:opacity-100"
                  : isActive
                    ? "bg-white/[0.05] border-white/10 shadow-2xs"
                    : "bg-transparent border-transparent opacity-50 hover:opacity-100"
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {/* Vertical colored bar | */}
                <span
                  className="h-3.5 w-1 rounded-full transition-all"
                  style={{ backgroundColor: item.color }}
                />
                <span className={clsx(
                  "text-xs font-semibold tracking-wide",
                  isLight ? "text-slate-600" : "text-slate-300"
                )}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-baseline gap-2 pl-2.5">
                <span className={clsx(
                  "text-xl sm:text-2xl font-black tracking-tight",
                  isLight ? "text-slate-900" : "text-white"
                )}>
                  {item.value.toLocaleString()}
                </span>
                <span className={clsx(
                  "text-xs font-bold",
                  isLight ? "text-blue-600" : "text-blue-400"
                )}>
                  +{item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PrioritySplitGauge;
