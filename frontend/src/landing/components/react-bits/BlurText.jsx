import { Fragment } from "react";

export function BlurText({ children, className = "", delayStep = 55 }) {
  const text = String(children);
  const words = text.split(" ");

  return (
    <span className={`blur-text ${className}`} aria-label={text}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span
            aria-hidden="true"
            className="blur-word"
            style={{ "--blur-delay": `${index * delayStep}ms` }}
          >
            {word}
          </span>
          {index < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </span>
  );
}
