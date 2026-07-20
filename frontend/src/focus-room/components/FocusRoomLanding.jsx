import { ArrowRight, BookOpen, History, Settings2 } from "lucide-react";

export function FocusRoomLanding({ onStart, onWorkspace, onHistory }) {
  return (
    <div className="focus-landing-shell">
      <header className="focus-landing-header">
        <button type="button" className="focus-landing-brand" onClick={onWorkspace} aria-label="Return to Synapse workspace">
          <span className="focus-wordmark-mark">S</span>
          <span className="focus-landing-brand-copy"><strong>synapse</strong><small>Focus Room</small></span>
        </button>
        <nav className="focus-landing-actions" aria-label="Focus Room navigation">
          <button type="button" className="focus-landing-icon" onClick={onHistory} aria-label="Open Focus Trail" title="Open Focus Trail"><History size={16} aria-hidden="true" /></button>
          <button type="button" className="focus-landing-language" aria-label="Current language">中文 <span aria-hidden="true">⌄</span></button>
        </nav>
      </header>

      <section className="focus-landing-hero" aria-labelledby="focus-landing-title">
        <p className="focus-landing-eyebrow">FOCUS · LEARN · GROW</p>
        <h1 id="focus-landing-title">开启你的专注空间</h1>
        <p className="focus-landing-subtitle">选择场景、音乐与节奏，把最清醒的时间留给真正重要的学习。</p>
        <button type="button" className="focus-landing-enter" onClick={onStart}>
          <span>开始学习</span><ArrowRight size={17} aria-hidden="true" />
        </button>
        <div className="focus-landing-secondary" aria-label="Synapse Focus Room shortcuts">
          <span><BookOpen size={13} aria-hidden="true" /> Synapse Study Space</span>
          <button type="button" onClick={onWorkspace}><Settings2 size={13} aria-hidden="true" /> Workspace</button>
        </div>
      </section>

      <footer className="focus-landing-footer liquid-glass">
        <div className="focus-landing-footer-grid">
          <div className="focus-landing-footer-brand">
            <div className="focus-landing-footer-lockup"><span className="focus-wordmark-mark">S</span><span><strong>synapse</strong><small>AI Study Assistant</small></span></div>
            <p>一个专注学习与成长的空间，让每一次学习都更有深度。</p>
          </div>
          <div className="focus-landing-footer-resource"><strong>学习资源</strong><p>生成笔记、AI Tutor 与学习工具都会在你的 Focus Room 中保留。</p></div>
          <div className="focus-landing-footer-actions">
            <button type="button" className="focus-landing-icon" onClick={onHistory} aria-label="Open Focus Trail" title="Open Focus Trail"><History size={17} aria-hidden="true" /></button>
            <button type="button" className="focus-landing-icon" onClick={onWorkspace} aria-label="Open Synapse workspace" title="Open Synapse workspace"><Settings2 size={17} aria-hidden="true" /></button>
            <button type="button" className="focus-landing-icon" onClick={onStart} aria-label="Start studying" title="Start studying"><ArrowRight size={17} aria-hidden="true" /></button>
          </div>
        </div>
        <div className="focus-landing-footer-meta">Synapse Focus Room · Your materials, your pace, your space</div>
      </footer>
    </div>
  );
}
