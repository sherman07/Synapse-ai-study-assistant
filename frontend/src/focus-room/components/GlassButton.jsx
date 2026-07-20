export function GlassButton({
  children,
  className = "",
  variant = "ghost",
  type = "button",
  ...props
}) {
  const { onPointerMove, onPointerLeave, ...buttonProps } = props;
  return (
    <button
      className={`glass-button glass-button-${variant} ${className}`.trim()}
      type={type}
      onPointerMove={event => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--glass-x", `${Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))}%`);
        event.currentTarget.style.setProperty("--glass-y", `${Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))}%`);
        onPointerMove?.(event);
      }}
      onPointerLeave={event => {
        event.currentTarget.style.setProperty("--glass-x", "50%");
        event.currentTarget.style.setProperty("--glass-y", "0%");
        onPointerLeave?.(event);
      }}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
