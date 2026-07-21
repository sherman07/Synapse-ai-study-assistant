import { useCallback, useRef, useState } from "react";
import {
  SEGMENT_MAX,
  commitBuffer,
  formatDuration,
  padSegment,
  pushDigit,
  splitDuration
} from "../timerInput.js";

const SEGMENT_LABELS = { minutes: "Minutes", seconds: "Seconds" };

function TimerSegment({
  segment,
  value,
  disabled,
  active,
  onFocusSegment,
  onType,
  onCommit,
  onMove,
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
    if (key === "ArrowLeft") {
      event.preventDefault();
      onMove(-1);
      return;
    }
    if (key === "ArrowRight" || key === "Tab" && !event.shiftKey && segment === "minutes") {
      if (key === "ArrowRight") {
        event.preventDefault();
        onMove(1);
      }
      return;
    }
    if (key === "Backspace" || key === "Delete") {
      event.preventDefault();
      onCommit();
    }
  };

  return (
    <span className={`timer-editor-segment${active ? " is-active" : ""}`}>
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

  const commit = useCallback(() => {
    bufferRef.current = "";
  }, []);

  const focusSegment = useCallback(segment => {
    bufferRef.current = "";
    setActiveSegment(segment);
  }, []);

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

  const moveSegment = useCallback(direction => {
    const next = direction < 0 ? "minutes" : "seconds";
    bufferRef.current = "";
    setActiveSegment(next);
    (direction < 0 ? minutesRef : secondsRef).current?.focus();
  }, []);

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
            segmentRef={minutesRef}
            onFocusSegment={focusSegment}
            onType={typeDigit}
            onCommit={commit}
            onMove={moveSegment}
          />
          <span className="timer-editor-colon" aria-hidden="true">:</span>
          <TimerSegment
            segment="seconds"
            value={seconds}
            disabled={disabled}
            active={activeSegment === "seconds"}
            segmentRef={secondsRef}
            onFocusSegment={focusSegment}
            onType={typeDigit}
            onCommit={commit}
            onMove={moveSegment}
          />
        </>
      )}
      {!disabled && (
        <span className="sr-only">
          Editable focus timer. Click minutes or seconds, then type digits to set the value.
        </span>
      )}
    </div>
  );
}
