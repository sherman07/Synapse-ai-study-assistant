import {
  MAX_DURATION_SECONDS,
  MIN_DURATION_SECONDS,
  clampDurationSeconds
} from "./utils.js";

export const TIMER_SEGMENTS = ["minutes", "seconds"];

export const SEGMENT_MAX = {
  minutes: Math.floor(MAX_DURATION_SECONDS / 60),
  seconds: 59
};

export const SEGMENT_DIGITS = {
  minutes: 3,
  seconds: 2
};

export function splitDuration(totalSeconds) {
  const total = clampDurationSeconds(totalSeconds, MIN_DURATION_SECONDS);
  return {
    minutes: Math.floor(total / 60),
    seconds: total % 60
  };
}

export function joinDuration(minutes, seconds) {
  const safeMinutes = Math.max(0, Math.floor(Number(minutes) || 0));
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  return clampDurationSeconds(safeMinutes * 60 + safeSeconds, MIN_DURATION_SECONDS);
}

export function padSegment(value, segment) {
  const width = segment === "minutes" ? 2 : 2;
  return String(Math.max(0, Math.floor(Number(value) || 0))).padStart(width, "0");
}

export function formatDuration(totalSeconds) {
  const { minutes, seconds } = splitDuration(totalSeconds);
  return `${padSegment(minutes, "minutes")}:${padSegment(seconds, "seconds")}`;
}

// Step a single segment up or down without disturbing the other segment.
// steps is signed (e.g. +1, -1, +5). Minutes and seconds each clamp to their
// own range so a nudge only ever changes the digits the user is looking at.
export function stepSegment(totalSeconds, segment, steps = 1) {
  const parts = splitDuration(totalSeconds);
  const amount = Math.trunc(Number(steps) || 0);
  if (segment === "seconds") {
    const nextSeconds = Math.min(SEGMENT_MAX.seconds, Math.max(0, parts.seconds + amount));
    return joinDuration(parts.minutes, nextSeconds);
  }
  const nextMinutes = Math.min(SEGMENT_MAX.minutes, Math.max(0, parts.minutes + amount));
  return joinDuration(nextMinutes, parts.seconds);
}

// Type-to-overwrite buffer, mirroring how native clock pickers behave: the
// first digit after focusing a segment replaces its value, later digits shift
// left. Returns the new buffer string capped to the segment digit width.
export function pushDigit(buffer, digit, segment) {
  const maxDigits = SEGMENT_DIGITS[segment] || 2;
  const clean = String(buffer || "").replace(/\D/g, "");
  const next = `${clean}${String(digit).replace(/\D/g, "")}`.slice(-maxDigits);
  return next || "";
}

export function bufferToValue(buffer, segment) {
  const numeric = Number(String(buffer || "").replace(/\D/g, "")) || 0;
  return Math.min(SEGMENT_MAX[segment], numeric);
}

// Commit a typed buffer for one segment back into a full duration in seconds.
export function commitBuffer(totalSeconds, segment, buffer) {
  const parts = splitDuration(totalSeconds);
  const value = bufferToValue(buffer, segment);
  if (segment === "seconds") return joinDuration(parts.minutes, value);
  return joinDuration(value, parts.seconds);
}

export function nextSegment(segment, direction) {
  const index = TIMER_SEGMENTS.indexOf(segment);
  if (index < 0) return TIMER_SEGMENTS[0];
  const nextIndex = Math.min(TIMER_SEGMENTS.length - 1, Math.max(0, index + (direction < 0 ? -1 : 1)));
  return TIMER_SEGMENTS[nextIndex];
}
