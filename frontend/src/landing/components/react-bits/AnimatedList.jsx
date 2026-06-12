export function AnimatedList({ items, className = "", renderItem }) {
  return (
    <ul className={`animated-list ${className}`}>
      {items.map((item, index) => (
        <li key={`${typeof item === "string" ? item : item.title}-${index}`} style={{ "--item-delay": `${index * 120}ms` }}>
          {renderItem ? renderItem(item, index) : item}
        </li>
      ))}
    </ul>
  );
}
