import { ScrollStack } from "../react-bits/index.js";
import { journeySteps } from "../../data/landingContent.js";

export function HowItWorksSection() {
  return (
    <section className="section how-section" id="how-it-works">
      <div className="landing-container how-grid">
        <div className="section-heading sticky-heading">
          <span className="section-kicker">How It Works</span>
          <h2>A learning journey that keeps checking understanding.</h2>
          <p>Synapse guides the path from raw material to a targeted revision queue, with each step feeding the next.</p>
        </div>
        <ScrollStack steps={journeySteps} />
      </div>
    </section>
  );
}
