import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '../../lib/utils';

const DEFAULT_MAGNIFICATION = 56;
const DEFAULT_DISTANCE = 140;

const DockContext = createContext(undefined);

function DockProvider({ children, value }) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

export function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within a DockProvider');
  }
  return context;
}

export function Dock({
  children,
  className,
  orientation = 'horizontal',
  spring = { mass: 0.1, stiffness: 180, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
}) {
  const mouseX = useMotionValue(Infinity);
  const mouseY = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  return (
    <motion.div
      onMouseMove={(e) => {
        isHovered.set(1);
        mouseX.set(e.pageX);
        mouseY.set(e.pageY);
      }}
      onMouseLeave={() => {
        isHovered.set(0);
        mouseX.set(Infinity);
        mouseY.set(Infinity);
      }}
      className={cn(
        orientation === 'vertical'
          ? 'flex flex-col items-center gap-2 py-2'
          : 'flex items-end gap-3 px-4 py-2',
        className
      )}
      role="toolbar"
      aria-label="Application dock"
    >
      <DockProvider value={{ mouseX, mouseY, orientation, isHovered, spring, distance, magnification }}>
        {children}
      </DockProvider>
    </motion.div>
  );
}

export function DockItem({ children, className, onClick }) {
  const ref = useRef(null);
  const { distance, magnification, mouseX, mouseY, orientation, spring } = useDock();
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(orientation === 'vertical' ? mouseY : mouseX, (val) => {
    const domRect = ref.current?.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 };
    if (orientation === 'vertical') {
      const scrollY = window.scrollY || 0;
      const center = domRect.y + scrollY + domRect.height / 2;
      return val - center;
    }
    const scrollX = window.scrollX || 0;
    const center = domRect.x + scrollX + domRect.width / 2;
    return val - center;
  });

  const baseSize = orientation === 'vertical' ? 44 : 40;

  const sizeTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseSize, magnification, baseSize]
  );

  const scaleTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [1, magnification / baseSize, 1]
  );

  const size = useSpring(sizeTransform, spring);
  const scale = useSpring(scaleTransform, spring);

  return (
    <motion.div
      ref={ref}
      style={orientation === 'vertical' ? { height: size, scale } : { width: size }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center transition-colors',
        className
      )}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, (child) =>
        child ? cloneElement(child, { width: size, scale, isHovered, orientation }) : null
      )}
    </motion.div>
  );
}

export function DockLabel({ children, className, side = 'top', ...rest }) {
  const restProps = rest;
  const isHovered = restProps['isHovered'];
  const orientation = restProps['orientation'] || 'horizontal';
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on('change', (latest) => {
      setIsVisible(latest === 1);
    });

    return () => unsubscribe();
  }, [isHovered]);

  const effectiveSide = side || (orientation === 'vertical' ? 'right' : 'top');

  const sidePositionClasses = {
    top: '-top-7 left-1/2 -translate-x-1/2',
    bottom: '-bottom-7 left-1/2 -translate-x-1/2',
    right: 'left-full ml-3 top-1/2 -translate-y-1/2',
    left: 'right-full mr-3 top-1/2 -translate-y-1/2',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: effectiveSide === 'top' ? 2 : 0, x: effectiveSide === 'right' ? -4 : 0 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'pointer-events-none absolute z-[120] w-fit whitespace-nowrap rounded-md border border-slate-200/90 bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-md backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/95 dark:text-white',
            sidePositionClasses[effectiveSide] || sidePositionClasses.top,
            className
          )}
          role="tooltip"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DockIcon({ children, className, ...rest }) {
  const restProps = rest;
  const scale = restProps['scale'];

  return (
    <motion.div
      style={scale ? { scale } : {}}
      className={cn('flex items-center justify-center shrink-0', className)}
    >
      {children}
    </motion.div>
  );
}
