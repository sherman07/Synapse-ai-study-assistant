import { CheckCircle2, MinusCircle, TrendingUp } from "lucide-react";
import { activeComparison, passiveComparison } from "../../data/landingContent.js";
import { AnimatedList, CountUp, GlassSurface, SpotlightCard } from "../react-bits/index.js";

export function ComparisonSection() {
  return (
    <section className="section comparison-section" id="about">
      <div className="landing-container">
        <div className="section-heading">
          <h2>Synapse is built for understanding, not passive summaries.</h2>
          <p>Summaries compress information. Synapse turns it into a feedback loop students can repeat before exams.</p>
        </div>

        <div className="comparison-grid">
          <SpotlightCard className="comparison-card passive-card">
            <MinusCircle size={28} />
            <h3>Passive AI summaries</h3>
            <AnimatedList items={passiveComparison} />
          </SpotlightCard>

          <GlassSurface className="comparison-card active-card">
            <div className="active-card-top">
              <CheckCircle2 size={30} />
              <span>Synapse active learning</span>
            </div>
            <AnimatedList items={activeComparison} />
            <div className="active-progress" aria-label="Active learning progress indicators">
              <div>
                <span>Recall confidence</span>
                <strong><CountUp value={86} suffix="%" /></strong>
              </div>
              <div>
                <span>Weak gaps found</span>
                <strong><CountUp value={12} /></strong>
              </div>
              <div>
                <span>Revision focus</span>
                <strong><TrendingUp size={20} /> high</strong>
              </div>
            </div>
          </GlassSurface>
        </div>
      </div>
    </section>
  );
}
