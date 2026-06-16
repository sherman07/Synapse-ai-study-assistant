import { useEffect, useMemo, useRef } from "react";

export function CountUp({ value, prefix = "", suffix = "", decimals = 0, duration = 1100, className = "" }) {
  const ref = useRef(null);
  const numberFormatter = useMemo(() => new Intl.NumberFormat(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }), [decimals]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const renderValue = (nextValue) => {
      element.textContent = `${prefix}${numberFormatter.format(nextValue)}${suffix}`;
    };

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      renderValue(value);
      return undefined;
    }

    let frame = 0;
    let started = false;
    let startTime = 0;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      renderValue(value * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        started = true;
        frame = requestAnimationFrame(animate);
      }
    }, { threshold: 0.35 });

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [duration, numberFormatter, prefix, suffix, value]);

  return <span className={`count-up ${className}`} ref={ref}>{prefix}{numberFormatter.format(0)}{suffix}</span>;
}
