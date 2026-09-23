import { useState, useRef, useEffect } from 'react';
import { CalendarDays, ChevronDown, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar } from './ui/calendar';
import { format, parseISO } from 'date-fns';

export default function RemarksFilter({ filter, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popoverRef]);

  const [localFilter, setLocalFilter] = useState(filter);

  const [rangeDate, setRangeDate] = useState({
    from: filter.dateFrom ? new Date(filter.dateFrom) : undefined,
    to: filter.dateTo ? new Date(filter.dateTo) : undefined,
  });
  const [singleDate, setSingleDate] = useState(filter.date ? new Date(filter.date) : undefined);

  useEffect(() => {
    setLocalFilter(filter);
    setRangeDate({
      from: filter.dateFrom ? new Date(filter.dateFrom) : undefined,
      to: filter.dateTo ? new Date(filter.dateTo) : undefined,
    });
    setSingleDate(filter.date ? new Date(filter.date) : undefined);
  }, [filter]);

  const applyFilter = () => {
    let finalFilter = { ...localFilter };
    if (finalFilter.type === 'date' && singleDate) {
      finalFilter.date = format(singleDate, 'yyyy-MM-dd');
    } else if (finalFilter.type === 'range') {
      finalFilter.dateFrom = rangeDate?.from ? format(rangeDate.from, 'yyyy-MM-dd') : '';
      finalFilter.dateTo = rangeDate?.to ? format(rangeDate.to, 'yyyy-MM-dd') : '';
    }
    onChange(finalFilter);
    setIsOpen(false);
  };

  const clearFilter = () => {
    const empty = { type: 'all', date: '', dateFrom: '', dateTo: '', month: '' };
    setLocalFilter(empty);
    setRangeDate({ from: undefined, to: undefined });
    setSingleDate(undefined);
    onChange(empty);
    setIsOpen(false);
  };

  const tabs = [
    { id: 'date', label: 'Specific Date' },
    { id: 'range', label: 'Date Range' },
    { id: 'month', label: 'By Month' }
  ];

  const getButtonText = () => {
    if (filter.type === 'all') return 'Filter updates';
    if (filter.type === 'date' && filter.date) {
      try { return format(parseISO(filter.date), 'MMM d, yyyy'); } catch(e) { return filter.date; }
    }
    if (filter.type === 'range' && (filter.dateFrom || filter.dateTo)) {
      try {
        const fromStr = filter.dateFrom ? format(parseISO(filter.dateFrom), 'MMM d') : '...';
        const toStr = filter.dateTo ? format(parseISO(filter.dateTo), 'MMM d') : '...';
        return `${fromStr} - ${toStr}`;
      } catch(e) {
        return `${filter.dateFrom || '...'} - ${filter.dateTo || '...'}`;
      }
    }
    if (filter.type === 'month' && filter.month) {
      try { return format(parseISO(filter.month + '-01'), 'MMM yyyy'); } catch(e) { return filter.month; }
    }
    return 'Filter updates';
  };

  return (
    <div className="relative inline-flex items-center gap-2" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary px-3 py-1.5"
      >
        <CalendarDays size={16} className={filter.type !== 'all' ? 'text-cyan-400' : 'text-[var(--text-muted)]'} />
        <span className="truncate max-w-[150px] sm:max-w-xs">{getButtonText()}</span>
        <ChevronDown size={16} className="text-[var(--text-muted)]" />
      </button>

      {filter.type !== 'all' && (
        <button 
          onClick={clearFilter} 
          className="text-xs font-medium whitespace-nowrap text-rose-400 hover:text-rose-300 transition-colors"
        >
          Clear
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] sm:w-fit min-w-[320px] glass-panel p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-semibold text-[var(--text-primary)]">Filter Updates</h4>
              <button onClick={() => setIsOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={16} />
              </button>
            </div>

            <div className="mb-4 flex rounded-lg bg-[var(--panel-soft)] border border-[var(--border-soft)] p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLocalFilter({ ...localFilter, type: tab.id })}
                  className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                    localFilter.type === tab.id
                      ? 'bg-[var(--panel-raised)] text-[var(--text-primary)] shadow-sm border border-[var(--border-soft)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mb-6 flex justify-center">
              {localFilter.type === 'date' && (
                <div className="rounded-md border border-[var(--border-soft)] bg-[var(--app-bg-soft)] p-1">
                  <Calendar
                    mode="single"
                    selected={singleDate}
                    onSelect={setSingleDate}
                    className="bg-transparent rounded-md"
                  />
                </div>
              )}

              {localFilter.type === 'range' && (
                <div className="rounded-md border border-[var(--border-soft)] bg-[var(--app-bg-soft)] p-1">
                  <Calendar
                    mode="range"
                    selected={rangeDate}
                    onSelect={setRangeDate}
                    numberOfMonths={1}
                    className="bg-transparent rounded-md"
                  />
                </div>
              )}

              {localFilter.type === 'month' && (
                <div className="w-full">
                  <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Select Month</label>
                  <input
                    type="month"
                    className="input-field w-full"
                    value={localFilter.month}
                    onChange={(e) => setLocalFilter({ ...localFilter, month: e.target.value })}
                  />
                </div>
              )}
              
              {localFilter.type === 'all' && (
                 <p className="text-xs text-[var(--text-muted)] text-center py-4 w-full">Select a tab above to filter.</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="btn-secondary flex-1 py-1.5"
                onClick={clearFilter}
              >
                Clear
              </button>
              <button
                type="button"
                className="btn-primary flex-1 py-1.5"
                onClick={applyFilter}
              >
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
