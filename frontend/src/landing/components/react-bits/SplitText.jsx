import { Fragment } from "react";

export function SplitText({ text, as: Tag = "span", className = "", startDelay = 0 }) {
  const words = text.split(" ");

  return (
    <Tag className={`split-text ${className}`} aria-label={text}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span
            className="split-word"
            aria-hidden="true"
            style={{ "--split-delay": `${startDelay + index * 72}ms` }}
          >
            {word}
          </span>
          {index < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </Tag>
  );
}
