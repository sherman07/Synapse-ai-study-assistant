export function GlassButton({
  children,
  className = "",
  variant = "ghost",
  type = "button",
  ...props
}) {
  return (
    <button
      className={`glass-button glass-button-${variant} ${className}`.trim()}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
