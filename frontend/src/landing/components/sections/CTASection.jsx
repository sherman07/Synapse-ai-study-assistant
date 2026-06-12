import { ArrowRight } from "lucide-react";
import { Aurora, Magnet } from "../react-bits/index.js";

export function CTASection({ onGetStarted }) {
  return (
    <section className="section cta-section">
      <div className="landing-container">
        <Aurora className="final-cta" intensity="soft">
          <h2>Ready to turn study material into active learning?</h2>
          <p>Start with one upload and watch Synapse build the next revision loop.</p>
          <Magnet>
            <button type="button" className="button button-primary button-large" data-action="get-started" onClick={onGetStarted}>
              Get Started for Free
              <ArrowRight size={18} />
            </button>
          </Magnet>
        </Aurora>
      </div>
    </section>
  );
}
