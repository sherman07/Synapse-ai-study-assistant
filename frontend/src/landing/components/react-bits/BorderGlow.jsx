export function BorderGlow({ children, className = "" }) {
  return (
    <div className={`border-glow ${className}`}>
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}
