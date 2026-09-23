"use client";

import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function Airplane({ isDark }) {
  const bodyTop = isDark ? "#ececec" : "#ffffff";
  const bodyMid = isDark ? "#ffffff" : "#f1f5f9";
  const bodyBot = isDark ? "#d0d0d0" : "#cbd5e1";
  const wingLight = isDark ? "#f8f8f8" : "#ffffff";
  const wingDark = isDark ? "#bababa" : "#94a3b8";
  const tail = isDark ? "#c8c8c8" : "#64748b";
  const nose = isDark ? "#f4f4f4" : "#e2e8f0";

  return (
    <svg
      className="w-[52px] sm:w-[72px] h-auto"
      viewBox="0 0 72 46"
      fill="none"
      style={{
        filter: isDark
          ? "drop-shadow(0 4px 12px rgba(0,0,0,0.75)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
          : "drop-shadow(0 2px 8px rgba(0,0,0,0.35)) drop-shadow(0 1px 3px rgba(0,0,0,0.2))",
      }}
    >
      <defs>
        <linearGradient id="rl-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bodyTop} />
          <stop offset="40%" stopColor={bodyMid} />
          <stop offset="100%" stopColor={bodyBot} />
        </linearGradient>
        <linearGradient id="rl-wing-t" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={wingLight} />
          <stop offset="100%" stopColor={wingDark} />
        </linearGradient>
        <linearGradient id="rl-wing-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={wingLight} />
          <stop offset="100%" stopColor={wingDark} />
        </linearGradient>
      </defs>

      <path d="M44,21 L28,21 L8,2 L18,0 Z" fill="url(#rl-wing-t)" />
      <path d="M44,25 L28,25 L8,44 L18,46 Z" fill="url(#rl-wing-b)" />

      <path d="M8,21 L2,14 L6,14 L12,21 Z" fill={tail} />
      <path d="M8,25 L2,32 L6,32 L12,25 Z" fill={tail} />

      <ellipse cx="34" cy="23" rx="29" ry="7" fill="url(#rl-body)" />

      <path
        d="M61,19.5 C66,21.5 67.5,23 67,23 C67.5,23 66,24.5 61,26.5 L58,23 Z"
        fill={nose}
      />

      <ellipse cx="57" cy="23" rx="4" ry="3" fill="#38bdf8" opacity="0.9" />
    </svg>
  );
}

export default function RunwayLoader({ className = "" }) {
  const themeContext = useTheme();
  const containerRef = useRef(null);

  const [isDark, setIsDark] = useState(() => {
    if (themeContext?.isLight !== undefined) return !themeContext.isLight;
    return typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false;
  });

  useEffect(() => {
    if (themeContext?.isLight !== undefined) {
      setIsDark(!themeContext.isLight);
    }
  }, [themeContext?.isLight]);

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const check = () => {
      const card = el.closest("[data-card-theme]");
      if (card) {
        setIsDark(card.classList.contains("dark"));
      } else if (themeContext?.isLight !== undefined) {
        setIsDark(!themeContext.isLight);
      } else {
        setIsDark(document.documentElement.classList.contains("dark"));
      }
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const cardWrapper = el.closest("[data-card-theme]");
    if (cardWrapper)
      observer.observe(cardWrapper, {
        attributes: true,
        attributeFilter: ["class"],
      });
    return () => observer.disconnect();
  }, [themeContext?.isLight]);

  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("taxiing");
  const [cycle, setCycle] = useState(0);

  const rafRef = useRef(0);
  const startRef = useRef(undefined);
  const aliveRef = useRef(true);
  const disappearedRef = useRef(false);

  const WALL_PCT = 91;

  useEffect(() => {
    aliveRef.current = true;
    disappearedRef.current = false;
    const TAXI_MS = 5500;

    function tick(ts) {
      if (!aliveRef.current) return;
      if (!startRef.current) startRef.current = ts;
      const t = Math.min((ts - startRef.current) / TAXI_MS, 1);

      const eased =
        t <= 0.75
          ? (t / 0.75) * 82
          : 82 + (1 - Math.pow(1 - (t - 0.75) / 0.25, 2)) * 18;
      const p = Math.min(eased, 100);
      setProgress(p);

      if (p >= WALL_PCT && !disappearedRef.current) {
        disappearedRef.current = true;
        setPhase("takeoff");
      }

      if (p < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          if (!aliveRef.current) return;
          setPhase("resetting");
          setTimeout(() => {
            if (!aliveRef.current) return;
            disappearedRef.current = false;
            startRef.current = undefined;
            setProgress(0);
            setPhase("taxiing");
            setCycle((c) => c + 1);
            rafRef.current = requestAnimationFrame(tick);
          }, 400);
        }, 600);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      aliveRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const planePct = Math.min(progress, WALL_PCT);

  const trackBg = isDark
    ? "linear-gradient(to bottom, #404040, #252525)"
    : "linear-gradient(to bottom, #bab7b2, #a09d98)";
  const trackShadow = isDark
    ? "inset 0 4px 12px rgba(0,0,0,0.85), inset 0 -1px 3px rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.5)"
    : "inset 0 3px 8px rgba(0,0,0,0.22), inset 0 -1px 3px rgba(255,255,255,0.28), 0 2px 5px rgba(0,0,0,0.12)";
  const dashColor = isDark
    ? "rgba(255,255,255,0.3)"
    : "rgba(255,255,255,0.65)";

  const progressGradient = isDark
    ? "linear-gradient(to right, #003f9e 0%, #0052d0 60%, #38bdf8 100%)"
    : "linear-gradient(to right, #002866 0%, #0052d0 60%, #0066e6 100%)";

  const progressGlow = isDark
    ? "inset 0 1px 3px rgba(255,255,255,0.4), 0 0 14px rgba(56,189,248,0.6)"
    : "inset 0 1px 3px rgba(255,255,255,0.4), 0 0 12px rgba(0,82,208,0.5)";

  const engineGlow = isDark
    ? "radial-gradient(ellipse at right, rgba(56,189,248,0.8), transparent)"
    : "radial-gradient(ellipse at right, rgba(0,82,208,0.8), transparent)";

  return (
    <div
      ref={containerRef}
      className={`flex h-full w-full items-center justify-center p-4 bg-transparent ${className}`}
    >
      <div className="flex w-full max-w-[440px] flex-col items-center gap-4 px-4 sm:gap-6 sm:px-6">
        {/* Track Runway */}
        <div
          className="relative h-11 w-full overflow-visible rounded-full sm:h-14"
          style={{ backgroundImage: trackBg, boxShadow: trackShadow }}
        >
          {/* Dashed Line */}
          <div
            className="pointer-events-none absolute top-1/2 -translate-y-px z-0"
            style={{
              left: 14,
              right: 14,
              height: 2,
              backgroundImage: `repeating-linear-gradient(to right, ${dashColor} 0, ${dashColor} 10px, transparent 10px, transparent 22px)`,
            }}
          />

          {/* Progress Bar Fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full z-10"
            style={{
              width: `${planePct}%`,
              backgroundImage: progressGradient,
              boxShadow: progressGlow,
            }}
          />

          {/* Jet Engine Glow */}
          {phase === "taxiing" && progress > 20 && (
            <motion.div
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full z-15"
              style={{
                right: `calc(${100 - planePct}% + 20px)`,
                width: Math.min(((progress - 20) / 80) * 50, 50),
                height: 18,
                background: engineGlow,
                filter: "blur(6px)",
              }}
              animate={{ opacity: [0.3, 0.8, 0.3, 0.7, 0.3] }}
              transition={{ duration: 0.2, repeat: Infinity }}
            />
          )}

          {/* Airplane Animated */}
          <AnimatePresence>
            {phase !== "resetting" && (
              <div
                key={`plane-${cycle}`}
                className="pointer-events-none absolute top-1/2 z-20"
                style={{
                  left: `${planePct}%`,
                  transform: "translateX(-50%) translateY(-50%)",
                }}
              >
                {phase === "taxiing" ? (
                  <Airplane isDark={isDark} />
                ) : (
                  <motion.div
                    initial={{ opacity: 1, x: 0, scale: 1 }}
                    animate={{ opacity: 0, x: 100, scale: 1.6 }}
                    transition={{ duration: 0.6, ease: "easeIn" }}
                  >
                    <Airplane isDark={isDark} />
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Labels & Progress Text */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex items-baseline gap-1">
            <span
              className="text-2xl font-extrabold tabular-nums sm:text-[26px]"
              style={{ color: isDark ? "#f8fafc" : "#002866" }}
            >
              {Math.round(progress)}
            </span>
            <span
              className="text-sm font-bold sm:text-base"
              style={{ color: isDark ? "#38bdf8" : "#0052d0" }}
            >
              %
            </span>
          </div>
          <span
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: isDark ? "#94a3b8" : "#0041a8" }}
          >
            {phase === "takeoff"
              ? "Taking off!"
              : phase === "resetting"
                ? "Connecting..."
                : "Signing in to portal..."}
          </span>
        </div>
      </div>
    </div>
  );
}
