import { AnimatedList, CountUp, GlassSurface, SpotlightCard } from "../react-bits/index.js";
import { intelligenceCards, weakTopicList } from "../../data/landingContent.js";

export function LearningIntelligenceSection() {
  return (
    <section className="section intelligence-section" id="learning-intelligence">
      <div className="landing-container intelligence-grid">
        <div className="section-heading">
          <h2>Know what to revise next.</h2>
          <p>Synapse turns study activity into a clear signal: what is strong, what is weak, and what deserves the next session.</p>
        </div>

        <GlassSurface className="intelligence-board">
          {intelligenceCards.map((card) => {
            const Icon = card.icon;
            return (
              <SpotlightCard className="intelligence-card" key={card.label}>
                <Icon size={22} />
                <span>{card.label}</span>
                <strong><CountUp value={card.value} suffix={card.suffix} /></strong>
                <p>{card.detail}</p>
              </SpotlightCard>
            );
          })}
          <SpotlightCard className="intelligence-card weak-topic-card">
            <span>Weak Topics</span>
            <AnimatedList items={weakTopicList} />
          </SpotlightCard>
        </GlassSurface>
      </div>
    </section>
  );
}
