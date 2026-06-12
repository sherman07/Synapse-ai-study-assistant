import { useEffect, useRef, useState } from "react";

export function ScrollStack({ steps, className = "" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.dataset?.stepIndex) {
        setActiveIndex(Number(visible.target.dataset.stepIndex));
      }
    }, { rootMargin: "-30% 0px -45% 0px", threshold: [0.2, 0.5, 0.8] });

    itemRefs.current.forEach((item) => item && observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`scroll-stack ${className}`} style={{ "--active-step": activeIndex }}>
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <article
            className={`scroll-stack-card ${activeIndex === index ? "is-active" : ""}`}
            data-cycle-step={index + 1}
            data-step-index={index}
            key={step.title}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
          >
            <div className="step-rail">
              <span className="step-number">{index + 1}</span>
            </div>
            <div className="step-icon" aria-hidden="true">
              <Icon size={22} />
            </div>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
