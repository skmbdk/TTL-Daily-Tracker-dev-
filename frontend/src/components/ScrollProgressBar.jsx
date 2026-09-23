import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const clampProgress = (value) => Math.min(100, Math.max(0, value));

const getElementProgress = (element) => {
  const maxScrollTop = element.scrollHeight - element.clientHeight;
  const maxScrollLeft = element.scrollWidth - element.clientWidth;

  if (maxScrollTop > 1) {
    return clampProgress((element.scrollTop / maxScrollTop) * 100);
  }

  if (maxScrollLeft > 1) {
    return clampProgress((element.scrollLeft / maxScrollLeft) * 100);
  }

  return 0;
};

const getDocumentProgress = () => {
  const body = document.body;
  const documentElement = document.documentElement;
  const scrollTop = window.scrollY || documentElement.scrollTop || body.scrollTop || 0;
  const scrollHeight =
    Math.max(
      body.scrollHeight,
      documentElement.scrollHeight,
      body.offsetHeight,
      documentElement.offsetHeight,
      body.clientHeight,
      documentElement.clientHeight
    ) - window.innerHeight;

  if (scrollHeight <= 0) return 0;
  return clampProgress((scrollTop / scrollHeight) * 100);
};

const findScrollableTarget = (target) => {
  let element = target instanceof Element ? target : null;

  while (element && element !== document.documentElement) {
    const styles = window.getComputedStyle(element);
    const canScrollY = /(auto|scroll|overlay)/.test(styles.overflowY) && element.scrollHeight > element.clientHeight + 1;
    const canScrollX = /(auto|scroll|overlay)/.test(styles.overflowX) && element.scrollWidth > element.clientWidth + 1;

    if (canScrollY || canScrollX) {
      return element;
    }

    element = element.parentElement;
  }

  return null;
};

const getScrollProgress = (target) => {
  const scrollTarget = findScrollableTarget(target);

  if (scrollTarget) {
    return getElementProgress(scrollTarget);
  }

  return getDocumentProgress();
};

const ScrollProgressBar = () => {
  const barRef = useRef(null);
  const frameRef = useRef(null);
  const lastTargetRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const updateProgress = (event) => {
      const target = event?.target instanceof Element ? event.target : lastTargetRef.current;
      const scrollTarget = findScrollableTarget(target);

      if (scrollTarget) {
        lastTargetRef.current = scrollTarget;
      }

      if (frameRef.current) return;

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        if (barRef.current) {
          barRef.current.style.width = `${getScrollProgress(scrollTarget || target)}%`;
        }
      });
    };

    updateProgress();
    const refreshTimer = window.setTimeout(updateProgress, 350);

    document.addEventListener('scroll', updateProgress, { passive: true, capture: true });
    document.addEventListener('wheel', updateProgress, { passive: true, capture: true });
    document.addEventListener('touchmove', updateProgress, { passive: true, capture: true });
    document.addEventListener('keydown', updateProgress, { passive: true });
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.clearTimeout(refreshTimer);
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
      document.removeEventListener('scroll', updateProgress, { capture: true });
      document.removeEventListener('wheel', updateProgress, { capture: true });
      document.removeEventListener('touchmove', updateProgress, { capture: true });
      document.removeEventListener('keydown', updateProgress);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [location.pathname]);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={barRef} className="scroll-progress__bar" />
    </div>
  );
};

export default ScrollProgressBar;
