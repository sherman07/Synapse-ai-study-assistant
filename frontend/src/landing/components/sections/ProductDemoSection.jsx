import { CheckCircle2, FileText, MessageSquareText, Sparkles, UploadCloud } from "lucide-react";
import { AnimatedList, CountUp, GlassSurface, SpotlightCard } from "../react-bits/index.js";
import { demoNotes, demoQuestions } from "../../data/landingContent.js";

export function ProductDemoSection() {
  return (
    <section className="section product-demo-section" id="product-demo">
      <div className="landing-container">
        <div className="section-heading">
          <h2>Watch source material become an active study system.</h2>
          <p>One flow shows the core Synapse loop: upload, extract, organise, practice, teach back, and improve.</p>
        </div>

        <GlassSurface className="demo-dashboard">
          <div className="demo-left">
            <SpotlightCard className="upload-card">
              <div className="demo-card-icon"><UploadCloud size={22} /></div>
              <div>
                <h3>Biology lecture.pdf</h3>
                <p>32 pages, diagrams, lecture transcript</p>
              </div>
              <div className="upload-progress" aria-label="Upload progress">
                <span style={{ width: "92%" }} />
              </div>
            </SpotlightCard>

            <SpotlightCard className="extract-card">
              <Sparkles size={22} />
              <div>
                <h3>AI extracting key points</h3>
                <p>Definitions, relationships, misconceptions, and source anchors.</p>
              </div>
            </SpotlightCard>
          </div>

          <div className="demo-center">
            <SpotlightCard className="notes-panel">
              <div className="panel-title">
                <FileText size={18} />
                <span>Generated Notes</span>
              </div>
              <AnimatedList items={demoNotes} />
            </SpotlightCard>

            <SpotlightCard className="mind-map-panel">
              <div className="mind-map-preview" aria-label="Mind map preview">
                <span className="map-node map-node-core">Photosynthesis</span>
                <span className="map-node map-node-a">Light</span>
                <span className="map-node map-node-b">Chlorophyll</span>
                <span className="map-node map-node-c">Calvin Cycle</span>
                <span className="map-line line-a" />
                <span className="map-line line-b" />
                <span className="map-line line-c" />
              </div>
            </SpotlightCard>
          </div>

          <div className="demo-right">
            <SpotlightCard className="questions-panel">
              <div className="panel-title">
                <MessageSquareText size={18} />
                <span>Practice Questions</span>
              </div>
              <AnimatedList items={demoQuestions} />
            </SpotlightCard>

            <SpotlightCard className="score-panel">
              <CheckCircle2 size={22} />
              <div>
                <span className="score-label">Feedback Score</span>
                <strong><CountUp value={87} suffix="%" /></strong>
                <p>Improved after teach-back review.</p>
              </div>
            </SpotlightCard>
          </div>
        </GlassSurface>
      </div>
    </section>
  );
}
