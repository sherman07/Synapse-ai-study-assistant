export function Aurora({ children, className = "", intensity = "soft" }) {
  return (
    <div className={`aurora-shell aurora-${intensity} ${className}`}>
      <div className="aurora-field" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      {children}
    </div>
  );
}
