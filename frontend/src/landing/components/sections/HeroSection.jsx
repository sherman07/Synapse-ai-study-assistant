import { lazy, Suspense } from "react";
import { ArrowRight, PlayCircle } from "lucide-react";
import { BlurText, CountUp, GlassSurface, GradientText, Magnet, SplitText } from "../react-bits/index.js";
import { heroBadges, heroStats } from "../../data/landingContent.js";
import { SceneFallback } from "../three/SceneFallback.jsx";

const Hero3DScene = lazy(() => import("../three/Hero3DScene.jsx"));

export function HeroSection({ onGetStarted, onViewDemo }) {
  return (
    <section className="section hero-section" id="product">
      <div className="hero-noise" aria-hidden="true" />
      <div className="landing-container synapse-hero-grid">
        <div className="hero-copy">
          <h1 aria-label="Turn passive study notes into active learning.">
            <span className="hero-title-line">
              <SplitText text="Turn passive" />
            </span>{" "}
            <span className="hero-title-line">
              <SplitText text="study notes into" startDelay={150} />
            </span>{" "}
            <GradientText className="hero-title-line hero-title-accent">active learning.</GradientText>
          </h1>
          <p className="hero-subtitle">
            <BlurText>
              Upload PDFs, lectures, slides, images, or notes. Synapse analyses the source, builds notes and mind maps, generates practice, and updates feedback as your mastery improves.
            </BlurText>
          </p>
          <div className="hero-actions">
            <Magnet>
              <button type="button" className="button button-primary" data-action="get-started" onClick={onGetStarted}>
                Get Started
                <ArrowRight size={18} />
              </button>
            </Magnet>
            <Magnet strength={0.16}>
              <button type="button" className="button button-secondary" data-action="view-demo" onClick={onViewDemo}>
                <PlayCircle size={18} />
                View Demo
              </button>
            </Magnet>
          </div>
          <div className="hero-stats" aria-label="Synapse product signals">
            {heroStats.map((stat) => (
              <GlassSurface className="hero-stat" key={stat.label}>
                <strong><CountUp value={stat.value} suffix={stat.suffix} /></strong>
                <span>{stat.label}</span>
              </GlassSurface>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <GlassSurface className="hero-scene-card">
            <Suspense fallback={<SceneFallback />}>
              <Hero3DScene />
            </Suspense>
            <div className="hero-badges" aria-label="Synapse learning flow">
              {heroBadges.map((badge, index) => (
                <span className={`hero-flow-badge hero-flow-badge-${index + 1}`} key={badge}>
                  {badge}
                </span>
              ))}
            </div>
          </GlassSurface>
        </div>
      </div>
    </section>
  );
}
