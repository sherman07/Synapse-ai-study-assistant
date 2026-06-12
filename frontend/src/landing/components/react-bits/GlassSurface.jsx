export function GlassSurface({ as: Tag = "div", children, className = "", ...props }) {
  return (
    <Tag className={`glass-surface ${className}`} {...props}>
      {children}
    </Tag>
  );
}
