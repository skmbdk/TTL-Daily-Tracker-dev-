import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useTheme } from '../context/ThemeContext';

export const StatCard = ({
  icon: Icon,
  label,
  value,
  helper,
  trend,
  accent,
  className,
}) => {
  const { isLight } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={clsx(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 transition-all duration-200 border",
        isLight
          ? "bg-white border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm"
          : "bg-[#121215] border-white/[0.08] hover:border-white/[0.16] shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={clsx(
          "text-xs font-semibold uppercase tracking-wider",
          isLight ? "text-slate-500" : "text-zinc-400"
        )}>
          {label}
        </span>
        {Icon ? (
          <Icon className={clsx(
            "h-4 w-4 transition-colors duration-200",
            isLight ? "text-slate-400 group-hover:text-slate-700" : "text-zinc-400 group-hover:text-zinc-200"
          )} />
        ) : null}
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <span className={clsx(
          "text-3xl sm:text-4xl font-black tracking-tight",
          isLight ? "text-slate-900" : "text-zinc-100"
        )}>
          {value ?? 0}
        </span>
        {trend ? (
          <span className={clsx(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
            trend.startsWith('+')
              ? isLight ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : isLight ? "bg-rose-50 text-rose-700 border border-rose-200/60" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          )}>
            {trend}
          </span>
        ) : null}
      </div>

      {helper ? (
        <p className={clsx(
          "mt-2 text-xs font-medium tracking-wide",
          isLight ? "text-slate-500" : "text-zinc-400"
        )}>
          {helper}
        </p>
      ) : null}
    </motion.div>
  );
};

export default StatCard;
