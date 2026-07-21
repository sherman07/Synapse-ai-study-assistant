import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  SEGMENT_MAX,
  commitBuffer,
  formatDuration,
  padSegment,
  pushDigit,
  splitDuration,
  stepSegment
} from "../timerInput.js";

const SEGMENT_LABELS = { minutes: "Minutes", seconds: "Seconds" };

function TimerSegment({
  segment,
  value,
  disabled,
  active,
  size,
  onFocusSegment,
  onStep,
  onType,
  onCommit,
  segmentRef
}) {
  const label = SEGMENT_LABELS[segment];

  const handleKeyDown = event => {
    if (disabled) return;
    const { key } = event;
    if (key >= "0" && key <= "9") {
      event.preventDefault();
      onType(segment, key);
      return;
    }
    if (key === "ArrowUp") {
      event.preventDefault();
      onStep(segment, 1);
      return;
    }
    if (key === "ArrowDown") {
      event.preventDefault();
      onStep(segment, -1);
      return;
    }
    if (key === "PageUp") {
      event.preventDefault();
      onStep(segment, 5);
      return;
    }
    if (key === "PageDown") {
      event.preventDefault();
      onStep(segment, -5);
      return;
    }
    if (key === "Backspace" || key === "Delete") {
      event.preventDefault();
      onCommit();
    }
  };

  return (
    <span className={`timer-editor-segment${active ? " is-active" : ""}`}>
      <button
        type="button"
        className="timer-editor-step timer-editor-step-up"
        tabIndex={-1}
        aria-label={`Increase ${label.toLowerCase()}`}
        disabled={disabled}
        onClick={() => onStep(segment, 1)}
      >
        <ChevronUp size={size === "hero" ? 20 : 14} aria-hidden="true" />
      </button>
      <span
        ref={segmentRef}
        className="timer-editor-digits"
        role="spinbutton"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={SEGMENT_MAX[segment]}
        aria-valuenow={value}
        aria-valuetext={`${value} ${label.toLowerCase()}`}
        aria-disabled={disabled || undefined}
        onFocus={() => onFocusSegment(segment)}
        onKeyDown={handleKeyDown}
      >
        {padSegment(value, segment)}
      </span>
      <button
        type="button"
        className="timer-editor-step timer-editor-step-down"
        tabIndex={-1}
        aria-label={`Decrease ${label.toLowerCase()}`}
        disabled={disabled}
        onClick={() => onStep(segment, -1)}
      >
        <ChevronDown size={size === "hero" ? 20 : 14} aria-hidden="true" />
      </button>
    </span>
  );
}

export function EditableTimer({
  valueSeconds,
  onChange,
  disabled = false,
  size = "hero",
  ariaLabel = "Set focus block length",
  className = ""
}) {
  const { minutes, seconds } = splitDuration(valueSeconds);
  const [activeSegment, setActiveSegment] = useState(null);
  const bufferRef = useRef("");
  const minutesRef = useRef(null);
  const secondsRef = useRef(null);
  const rootRef = useRef(null);

  const refFor = segment => (segment === "minutes" ? minutesRef : secondsRef);

  const commit = useCallback(() => {
    bufferRef.current = "";
  }, []);

  const focusSegment = useCallback(segment => {
    bufferRef.current = "";
    setActiveSegment(segment);
  }, []);

  const stepValue = useCallback(
    (segment, steps) => {
      if (disabled) return;
      bufferRef.current = "";
      setActiveSegment(segment);
      onChange?.(stepSegment(valueSeconds, segment, steps));
      refFor(segment).current?.focus();
    },
    [disabled, onChange, valueSeconds]
  );

  const typeDigit = useCallback(
    (segment, digit) => {
      if (disabled) return;
      const nextBuffer = pushDigit(bufferRef.current, digit, segment);
      bufferRef.current = nextBuffer;
      setActiveSegment(segment);
      onChange?.(commitBuffer(valueSeconds, segment, nextBuffer));
    },
    [disabled, onChange, valueSeconds]
  );

  // Native wheel listeners so we can adjust without scroll-jacking the page.
  useEffect(() => {
    if (disabled) return undefined;
    const targets = [
      [minutesRef.current, "minutes"],
      [secondsRef.current, "seconds"]
    ].filter(([node]) => node);
    const handlers = targets.map(([node, segment]) => {
      const handler = event => {
        event.preventDefault();
        stepValue(segment, event.deltaY < 0 ? 1 : -1);
      };
      node.addEventListener("wheel", handler, { passive: false });
      return [node, handler];
    });
    return () => {
      handlers.forEach(([node, handler]) => node.removeEventListener("wheel", handler));
    };
  }, [disabled, stepValue]);

  const handleBlur = event => {
    if (!rootRef.current?.contains(event.relatedTarget)) {
      commit();
      setActiveSegment(null);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`timer-editor timer-editor-${size}${disabled ? " is-readonly" : ""} ${className}`.trim()}
      role="group"
      aria-label={ariaLabel}
      onBlur={handleBlur}
    >
      {disabled ? (
        <span className="timer-editor-static" aria-hidden="true">{formatDuration(valueSeconds)}</span>
      ) : (
        <>
          <TimerSegment
            segment="minutes"
            value={minutes}
            disabled={disabled}
            active={activeSegment === "minutes"}
            size={size}
            segmentRef={minutesRef}
            onFocusSegment={focusSegment}
            onStep={stepValue}
            onType={typeDigit}
            onCommit={commit}
          />
          <span className="timer-editor-colon" aria-hidden="true">:</span>
          <TimerSegment
            segment="seconds"
            value={seconds}
            disabled={disabled}
            active={activeSegment === "seconds"}
            size={size}
            segmentRef={secondsRef}
            onFocusSegment={focusSegment}
            onStep={stepValue}
            onType={typeDigit}
            onCommit={commit}
          />
        </>
      )}
      {!disabled && (
        <span className="sr-only">
          Editable focus timer. Click minutes or seconds, then type a number or use the arrow keys to adjust.
        </span>
      )}
    </div>
  );
}
