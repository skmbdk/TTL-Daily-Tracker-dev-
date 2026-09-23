import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../context/ThemeContext';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ─── PatternLines ────────────────────────────────────────────────────────────

export function PatternLines({
  id,
  width = 8,
  height = 8,
  stroke = "rgba(255, 255, 255, 0.35)",
  strokeWidth = 2,
  orientation = ["diagonal"],
  background,
}) {
  const paths = [];

  for (const o of orientation) {
    if (o === "diagonal") {
      paths.push(`M0,${height}l${width},${-height}`);
      paths.push(`M${-width / 4},${height / 4}l${width / 2},${-height / 2}`);
      paths.push(
        `M${(3 * width) / 4},${height + height / 4}l${width / 2},${-height / 2}`
      );
    } else if (o === "horizontal") {
      paths.push(`M0,${height / 2}l${width},0`);
    } else if (o === "vertical") {
      paths.push(`M${width / 2},0l0,${height}`);
    }
  }

  return (
    <pattern
      id={id}
      width={width}
      height={height}
      patternUnits="userSpaceOnUse"
    >
      {background && (
        <rect width={width} height={height} fill={background} />
      )}
      <path
        d={paths.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
      />
    </pattern>
  );
}

PatternLines.displayName = "PatternLines";

// ─── Defaults & Formatters ───────────────────────────────────────────────────

const fmtPct = (p) => `${Math.round(p)}%`;
const fmtVal = (v) => {
  if (v === null || v === undefined) return '0';
  const num = Number(v);
  if (isNaN(num)) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toLocaleString("en-US");
};

const springConfig = { stiffness: 120, damping: 20, mass: 1 };
const hoverSpring = { stiffness: 300, damping: 24 };

// ─── SVG Wave Path Helpers ───────────────────────────────────────────────────

function hSegmentPath(
  normStart,
  normEnd,
  segW,
  H,
  layerScale,
  straight = false
) {
  const my = H / 2;
  const h0 = normStart * H * 0.44 * layerScale;
  const h1 = normEnd * H * 0.44 * layerScale;

  if (straight) {
    return `M 0 ${my - h0} L ${segW} ${my - h1} L ${segW} ${my + h1} L 0 ${my + h0} Z`;
  }

  const cx = segW * 0.55;
  const top = `M 0 ${my - h0} C ${cx} ${my - h0}, ${segW - cx} ${my - h1}, ${segW} ${my - h1}`;
  const bot = `L ${segW} ${my + h1} C ${segW - cx} ${my + h1}, ${cx} ${my + h0}, 0 ${my + h0}`;
  return `${top} ${bot} Z`;
}

function vSegmentPath(
  normStart,
  normEnd,
  segH,
  W,
  layerScale,
  straight = false
) {
  const mx = W / 2;
  const w0 = normStart * W * 0.44 * layerScale;
  const w1 = normEnd * W * 0.44 * layerScale;

  if (straight) {
    return `M ${mx - w0} 0 L ${mx - w1} ${segH} L ${mx + w1} ${segH} L ${mx + w0} 0 Z`;
  }

  const cy = segH * 0.55;
  const left = `M ${mx - w0} 0 C ${mx - w0} ${cy}, ${mx - w1} ${segH - cy}, ${mx - w1} ${segH}`;
  const right = `L ${mx + w1} ${segH} C ${mx + w1} ${segH - cy}, ${mx + w0} ${cy}, ${mx + w0} 0`;
  return `${left} ${right} Z`;
}

// ─── Animated Ring Components ────────────────────────────────────────────────

function HRing({
  d,
  color,
  fill,
  opacity,
  hovered,
  ringIndex,
  totalRings,
}) {
  const extraScale = 1 + (ringIndex / Math.max(totalRings - 1, 1)) * 0.12;
  const ringSpring = {
    stiffness: 300 - ringIndex * 60,
    damping: 24 - ringIndex * 3,
  };
  const scaleY = useSpring(1, ringSpring);

  useEffect(() => {
    scaleY.set(hovered ? extraScale : 1);
  }, [hovered, scaleY, extraScale]);

  return (
    <motion.path
      d={d}
      fill={fill ?? color}
      opacity={opacity}
      style={{ scaleY, transformOrigin: "center center" }}
    />
  );
}

function VRing({
  d,
  color,
  fill,
  opacity,
  hovered,
  ringIndex,
  totalRings,
}) {
  const extraScale = 1 + (ringIndex / Math.max(totalRings - 1, 1)) * 0.12;
  const ringSpring = {
    stiffness: 300 - ringIndex * 60,
    damping: 24 - ringIndex * 3,
  };
  const scaleX = useSpring(1, ringSpring);

  useEffect(() => {
    scaleX.set(hovered ? extraScale : 1);
  }, [hovered, scaleX, extraScale]);

  return (
    <motion.path
      d={d}
      fill={fill ?? color}
      opacity={opacity}
      style={{ scaleX, transformOrigin: "center center" }}
    />
  );
}

// ─── Animated Segments ───────────────────────────────────────────────────────

function HSegment({
  index,
  normStart,
  normEnd,
  segW,
  fullH,
  color,
  layers,
  staggerDelay,
  hovered,
  dimmed,
  renderPattern,
  straight,
  gradientStops,
}) {
  const patternId = `funnel-h-pattern-${index}`;
  const gradientId = `funnel-h-grad-${index}`;
  const growProgress = useSpring(0, springConfig);
  const entranceScaleX = useTransform(growProgress, [0, 1], [0, 1]);
  const entranceScaleY = useTransform(growProgress, [0, 1], [0, 1]);
  const dimOpacity = useSpring(1, hoverSpring);

  useEffect(() => {
    dimOpacity.set(dimmed ? 0.4 : 1);
  }, [dimmed, dimOpacity]);

  useEffect(() => {
    const timeout = setTimeout(
      () => growProgress.set(1),
      index * staggerDelay * 1000
    );
    return () => clearTimeout(timeout);
  }, [growProgress, index, staggerDelay]);

  const rings = Array.from({ length: layers }, (_, l) => {
    const scale = 1 - (l / layers) * 0.35;
    const opacity = 0.18 + (l / (layers - 1 || 1)) * 0.65;
    return {
      d: hSegmentPath(normStart, normEnd, segW, fullH, scale, straight),
      opacity,
    };
  });

  return (
    <motion.div
      className="pointer-events-none relative shrink-0 overflow-visible"
      style={{
        width: segW,
        height: fullH,
        zIndex: hovered ? 10 : 1,
        opacity: dimOpacity,
      }}
    >
      <motion.div
        className="absolute inset-0 overflow-visible"
        style={{
          scaleX: entranceScaleX,
          scaleY: entranceScaleY,
          transformOrigin: "left center",
        }}
      >
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full overflow-visible"
          preserveAspectRatio="none"
          role="presentation"
          viewBox={`0 0 ${segW} ${fullH}`}
        >
          <defs>
            {gradientStops && (
              <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
                {gradientStops.map((stop) => (
                  <stop
                    key={`${stop.offset}-${stop.color}`}
                    offset={
                      typeof stop.offset === "number"
                        ? `${stop.offset * 100}%`
                        : stop.offset
                    }
                    stopColor={stop.color}
                  />
                ))}
              </linearGradient>
            )}
            {renderPattern
              ? renderPattern(patternId, color)
              : (
                <PatternLines
                  id={patternId}
                  width={8}
                  height={8}
                  stroke="rgba(255, 255, 255, 0.35)"
                  strokeWidth={2}
                  orientation={["diagonal"]}
                  background={color}
                />
              )}
          </defs>
          {rings.map((r, i) => {
            const isInnermost = i === rings.length - 1;
            let ringFill;
            if (isInnermost && renderPattern) {
              ringFill = `url(#${patternId})`;
            } else if (isInnermost && gradientStops) {
              ringFill = `url(#${gradientId})`;
            } else if (isInnermost) {
              ringFill = `url(#${patternId})`;
            }
            return (
              <HRing
                color={color}
                d={r.d}
                fill={ringFill}
                hovered={hovered}
                key={`h-ring-${i}-${r.opacity.toFixed(2)}`}
                opacity={r.opacity}
                ringIndex={i}
                totalRings={layers}
              />
            );
          })}
        </svg>
      </motion.div>
    </motion.div>
  );
}

function VSegment({
  index,
  normStart,
  normEnd,
  segH,
  fullW,
  color,
  layers,
  staggerDelay,
  hovered,
  dimmed,
  renderPattern,
  straight,
  gradientStops,
}) {
  const patternId = `funnel-v-pattern-${index}`;
  const gradientId = `funnel-v-grad-${index}`;
  const growProgress = useSpring(0, springConfig);
  const entranceScaleY = useTransform(growProgress, [0, 1], [0, 1]);
  const entranceScaleX = useTransform(growProgress, [0, 1], [0, 1]);
  const dimOpacity = useSpring(1, hoverSpring);

  useEffect(() => {
    dimOpacity.set(dimmed ? 0.4 : 1);
  }, [dimmed, dimOpacity]);

  useEffect(() => {
    const timeout = setTimeout(
      () => growProgress.set(1),
      index * staggerDelay * 1000
    );
    return () => clearTimeout(timeout);
  }, [growProgress, index, staggerDelay]);

  const rings = Array.from({ length: layers }, (_, l) => {
    const scale = 1 - (l / layers) * 0.35;
    const opacity = 0.18 + (l / (layers - 1 || 1)) * 0.65;
    return {
      d: vSegmentPath(normStart, normEnd, segH, fullW, scale, straight),
      opacity,
    };
  });

  return (
    <motion.div
      className="pointer-events-none relative shrink-0 overflow-visible"
      style={{
        width: fullW,
        height: segH,
        zIndex: hovered ? 10 : 1,
        opacity: dimOpacity,
      }}
    >
      <motion.div
        className="absolute inset-0 overflow-visible"
        style={{
          scaleY: entranceScaleY,
          scaleX: entranceScaleX,
          transformOrigin: "center top",
        }}
      >
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full overflow-visible"
          preserveAspectRatio="none"
          role="presentation"
          viewBox={`0 0 ${fullW} ${segH}`}
        >
          <defs>
            {gradientStops && (
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                {gradientStops.map((stop) => (
                  <stop
                    key={`${stop.offset}-${stop.color}`}
                    offset={
                      typeof stop.offset === "number"
                        ? `${stop.offset * 100}%`
                        : stop.offset
                    }
                    stopColor={stop.color}
                  />
                ))}
              </linearGradient>
            )}
            {renderPattern
              ? renderPattern(patternId, color)
              : (
                <PatternLines
                  id={patternId}
                  height={8}
                  width={8}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth={2}
                  orientation={["diagonal"]}
                  background={color}
                />
              )}
          </defs>
          {rings.map((r, i) => {
            const isInnermost = i === rings.length - 1;
            let ringFill;
            if (isInnermost && renderPattern) {
              ringFill = `url(#${patternId})`;
            } else if (isInnermost && gradientStops) {
              ringFill = `url(#${gradientId})`;
            } else if (isInnermost) {
              ringFill = `url(#${patternId})`;
            }
            return (
              <VRing
                color={color}
                d={r.d}
                fill={ringFill}
                hovered={hovered}
                key={`v-ring-${i}-${r.opacity.toFixed(2)}`}
                opacity={r.opacity}
                ringIndex={i}
                totalRings={layers}
              />
            );
          })}
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─── Label Overlay ───────────────────────────────────────────────────────────

function SegmentLabel({
  stage,
  pct,
  isHorizontal,
  showValues,
  showPercentage,
  showLabels,
  formatPercentage,
  formatValue,
  index,
  staggerDelay,
  layout = "spread",
  orientation,
  align = "center",
  isLight,
}) {
  const display = stage.displayValue ?? formatValue(stage.value ?? stage.count ?? 0);

  const valueEl = showValues && (
    <span className={cn(
      "whitespace-nowrap font-black text-sm tracking-tight",
      isLight ? "text-slate-900" : "text-white"
    )}>
      {display}
    </span>
  );

  const pctEl = showPercentage && (
    <span className="rounded-full bg-amber-500 px-3 py-1 font-bold text-slate-950 text-xs shadow-sm">
      {formatPercentage(pct)}
    </span>
  );

  const labelEl = showLabels && (
    <span className={cn(
      "whitespace-nowrap font-semibold text-xs tracking-wide",
      isLight ? "text-slate-600" : "text-slate-300"
    )}>
      {stage.label ?? stage.stage}
    </span>
  );

  if (layout === "spread") {
    return (
      <motion.div
        animate={{ opacity: 1 }}
        className={cn(
          "absolute inset-0 flex",
          isHorizontal ? "flex-col items-center" : "flex-row items-center"
        )}
        initial={{ opacity: 0 }}
        transition={{
          delay: index * staggerDelay + 0.25,
          duration: 0.35,
          ease: "easeOut",
        }}
      >
        {isHorizontal ? (
          <>
            <div className="flex h-[20%] items-end justify-center pb-1">
              {valueEl}
            </div>
            <div className="flex flex-1 items-center justify-center">
              {pctEl}
            </div>
            <div className="flex h-[20%] items-start justify-center pt-1">
              {labelEl}
            </div>
          </>
        ) : (
          <>
            <div className="flex w-[20%] items-center justify-end pr-2">
              {valueEl}
            </div>
            <div className="flex flex-1 items-center justify-center">
              {pctEl}
            </div>
            <div className="flex w-[20%] items-center justify-start pl-2">
              {labelEl}
            </div>
          </>
        )}
      </motion.div>
    );
  }

  // Grouped layout
  const resolvedOrientation =
    orientation ?? (isHorizontal ? "vertical" : "horizontal");
  const isVerticalStack = resolvedOrientation === "vertical";

  const justifyMap = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
  };
  const itemsMap = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className={cn(
        "absolute inset-0 flex",
        isHorizontal
          ? cn("flex-col items-center", justifyMap[align])
          : cn("flex-row items-center", justifyMap[align])
      )}
      initial={{ opacity: 0 }}
      style={{
        padding: isHorizontal ? "8% 0" : "0 8%",
      }}
      transition={{
        delay: index * staggerDelay + 0.25,
        duration: 0.35,
        ease: "easeOut",
      }}
    >
      <div
        className={cn(
          "flex gap-1.5",
          isVerticalStack
            ? cn("flex-col", itemsMap[isHorizontal ? "center" : align])
            : cn("flex-row", itemsMap.center)
        )}
      >
        {valueEl}
        {pctEl}
        {labelEl}
      </div>
    </motion.div>
  );
}

// ─── Default Warm Palette ────────────────────────────────────────────────────

const DEFAULT_PALETTE = [
  "#F59E0B", // Amber-500
  "#D97706", // Amber-600
  "#B45309", // Amber-700
  "#92400E", // Amber-800
  "#78350F", // Amber-900
];

// ─── FunnelChart Main Component ──────────────────────────────────────────────

export function FunnelChart({
  data = [],
  orientation = "horizontal",
  color = "var(--chart-3)",
  layers = 3,
  className,
  style,
  showPercentage = false, // Hidden by default as requested by user
  showValues = true,
  showLabels = true,
  hoveredIndex: hoveredIndexProp,
  onHoverChange,
  activeStage,
  onHoverStage,
  formatPercentage = fmtPct,
  formatValue = fmtVal,
  staggerDelay = 0.12,
  gap = 4,
  renderPattern,
  edges = "curved",
  labelLayout = "spread",
  labelOrientation,
  labelAlign = "center",
  grid: gridProp = false,
}) {
  const { isLight } = useTheme();
  const ref = useRef(null);
  const [sz, setSz] = useState({ w: 0, h: 0 });
  const [internalHoveredIndex, setInternalHoveredIndex] = useState(null);

  const isControlled = hoveredIndexProp !== undefined;
  const hoveredIndex = isControlled ? hoveredIndexProp : internalHoveredIndex;
  const setHoveredIndex = useCallback(
    (index) => {
      if (isControlled) {
        onHoverChange?.(index);
      } else {
        setInternalHoveredIndex(index);
      }
    },
    [isControlled, onHoverChange]
  );

  const measure = useCallback(() => {
    if (!ref.current) return;
    const { width: w, height: h } = ref.current.getBoundingClientRect();
    if (w > 0 && h > 0) setSz({ w, h });
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, [measure]);

  // Sort funnel data high -> low to create optimal funnel wave progression
  const processedData = useMemo(() => {
    if (!data || !data.length) return [];
    return [...data]
      .map((item) => ({
        ...item,
        label: item.label ?? item.stage ?? '',
        value: Number(item.value ?? item.count ?? 0),
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  if (!processedData.length) return null;

  const first = processedData[0];
  const max = Math.max(1, first.value);
  const n = processedData.length;

  // Calculate normalized values (ensure smooth decreasing progression so wave curves pop out)
  const rawNorms = processedData.map((d) => Math.max(0.1, d.value / max));

  const horiz = orientation === "horizontal";
  const { w: W, h: H } = sz;

  const totalGap = gap * (n - 1);
  const segW = (W - (horiz ? totalGap : 0)) / n;
  const segH = (H - (horiz ? 0 : totalGap)) / n;

  // Grid config
  const gridEnabled = gridProp !== false;
  const gridCfg = typeof gridProp === "object" ? gridProp : {};
  const showBands = gridEnabled && (gridCfg.bands ?? true);
  const bandColor = gridCfg.bandColor ?? (isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)");
  const showGridLines = gridEnabled && (gridCfg.lines ?? true);
  const gridLineColor = gridCfg.lineColor ?? (isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)");
  const gridLineOpacity = gridCfg.lineOpacity ?? 1;
  const gridLineWidth = gridCfg.lineWidth ?? 1;

  // Render pattern callback wrapper
  const patternRenderer = renderPattern ?? ((id, c) => (
    <PatternLines
      id={id}
      height={8}
      width={8}
      stroke="rgba(255,255,255,0.35)"
      strokeWidth={2}
      orientation={["diagonal"]}
      background={c}
    />
  ));

  return (
    <div
      className={cn("relative w-full select-none overflow-visible", className)}
      ref={ref}
      style={{
        aspectRatio: horiz ? "2.2 / 1" : "1 / 1.8",
        ...style,
      }}
    >
      {W > 0 && H > 0 && (
        <>
          {/* Grid background bands */}
          {gridEnabled && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              role="presentation"
              viewBox={`0 0 ${W} ${H}`}
            >
              {showBands &&
                processedData.map((stage, i) => {
                  if (i % 2 !== 0) return null;
                  if (horiz) {
                    const x = (segW + gap) * i;
                    return (
                      <rect
                        fill={bandColor}
                        height={H}
                        key={`band-${stage.label}`}
                        width={segW}
                        x={x}
                        y={0}
                      />
                    );
                  }
                  const y = (segH + gap) * i;
                  return (
                    <rect
                      fill={bandColor}
                      height={segH}
                      key={`band-${stage.label}`}
                      width={W}
                      x={0}
                      y={y}
                    />
                  );
                })}
            </svg>
          )}

          {/* Segments */}
          <div
            className={cn(
              "absolute inset-0 flex overflow-visible",
              horiz ? "flex-row" : "flex-col"
            )}
            style={{ gap }}
          >
            {processedData.map((stage, i) => {
              const normStart = rawNorms[i];
              // For smooth wave transition, normEnd is the next stage's norm, or tapered down if last stage
              const normEnd = i < n - 1 ? rawNorms[i + 1] : rawNorms[i] * 0.55;
              const firstStop = stage.gradient?.[0];
              const fallbackColor = DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
              const segColor = firstStop
                ? firstStop.color
                : (stage.color ?? fallbackColor);

              const isStageActive =
                hoveredIndex === i ||
                (activeStage && (activeStage === stage.label || activeStage === stage.stage));

              return horiz ? (
                <HSegment
                  color={segColor}
                  dimmed={hoveredIndex !== null && hoveredIndex !== i}
                  fullH={H}
                  gradientStops={stage.gradient}
                  hovered={isStageActive}
                  index={i}
                  key={stage.label}
                  layers={layers}
                  normEnd={normEnd}
                  normStart={normStart}
                  renderPattern={patternRenderer}
                  segW={segW}
                  staggerDelay={staggerDelay}
                  straight={edges === "straight"}
                />
              ) : (
                <VSegment
                  color={segColor}
                  dimmed={hoveredIndex !== null && hoveredIndex !== i}
                  fullW={W}
                  gradientStops={stage.gradient}
                  hovered={isStageActive}
                  index={i}
                  key={stage.label}
                  layers={layers}
                  normEnd={normEnd}
                  normStart={normStart}
                  renderPattern={patternRenderer}
                  segH={segH}
                  staggerDelay={staggerDelay}
                  straight={edges === "straight"}
                />
              );
            })}
          </div>

          {/* Grid lines */}
          {gridEnabled && showGridLines && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              role="presentation"
              viewBox={`0 0 ${W} ${H}`}
            >
              {Array.from({ length: n - 1 }, (_, i) => {
                const idx = i + 1;
                if (horiz) {
                  const x = segW * idx + gap * i + gap / 2;
                  return (
                    <line
                      key={`grid-${idx}`}
                      stroke={gridLineColor}
                      strokeOpacity={gridLineOpacity}
                      strokeWidth={gridLineWidth}
                      x1={x}
                      x2={x}
                      y1={0}
                      y2={H}
                    />
                  );
                }
                const y = segH * idx + gap * i + gap / 2;
                return (
                  <line
                    key={`grid-${idx}`}
                    stroke={gridLineColor}
                    strokeOpacity={gridLineOpacity}
                    strokeWidth={gridLineWidth}
                    x1={0}
                    x2={W}
                    y1={y}
                    y2={y}
                  />
                );
              })}
            </svg>
          )}

          {/* Label overlays & hover triggers */}
          {processedData.map((stage, i) => {
            const pct = (stage.value / max) * 100;
            const posStyle = horiz
              ? { left: (segW + gap) * i, width: segW, top: 0, height: H }
              : { top: (segH + gap) * i, height: segH, left: 0, width: W };
            const isDimmed = hoveredIndex !== null && hoveredIndex !== i;

            return (
              <motion.div
                animate={{ opacity: isDimmed ? 0.4 : 1 }}
                className="absolute cursor-pointer"
                key={`lbl-${stage.label}`}
                onMouseEnter={() => {
                  setHoveredIndex(i);
                  onHoverStage?.(stage.label);
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  onHoverStage?.(null);
                }}
                style={{ ...posStyle, zIndex: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <SegmentLabel
                  align={labelAlign}
                  formatPercentage={formatPercentage}
                  formatValue={formatValue}
                  index={i}
                  isHorizontal={horiz}
                  isLight={isLight}
                  layout={labelLayout}
                  orientation={labelOrientation}
                  pct={pct}
                  showLabels={showLabels}
                  showPercentage={showPercentage}
                  showValues={showValues}
                  stage={stage}
                  staggerDelay={staggerDelay}
                />
              </motion.div>
            );
          })}
        </>
      )}
    </div>
  );
}

FunnelChart.displayName = "FunnelChart";

export default FunnelChart;
