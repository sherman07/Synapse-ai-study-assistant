import { MagicBento, MagicBentoCard, SpotlightCard } from "../react-bits/index.js";
import { features } from "../../data/landingContent.js";

export function FeaturesSection() {
  return (
    <section className="section features-section" id="features">
      <div className="landing-container">
        <div className="section-heading">
          <span className="section-kicker">Features</span>
          <h2>Everything your notes need to become active learning.</h2>
          <p>Each feature is part of one study loop, not a disconnected AI trick.</p>
        </div>

        <MagicBento>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <MagicBentoCard className={index === 0 || index === 2 ? "is-large" : ""} key={feature.title}>
                <SpotlightCard className="feature-card">
                  <div className="feature-icon"><Icon size={24} /></div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <div className="feature-preview" aria-hidden="true">
                    <span>{feature.preview}</span>
                    <i />
                    <i />
                    <i />
                  </div>
                </SpotlightCard>
              </MagicBentoCard>
            );
          })}
        </MagicBento>
      </div>
    </section>
  );
}
