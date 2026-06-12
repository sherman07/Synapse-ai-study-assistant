export function MagicBento({ children, className = "" }) {
  return <div className={`magic-bento-grid ${className}`}>{children}</div>;
}

export function MagicBentoCard({ children, className = "", ...props }) {
  return (
    <div className={`magic-bento-card ${className}`} {...props}>
      {children}
    </div>
  );
}
