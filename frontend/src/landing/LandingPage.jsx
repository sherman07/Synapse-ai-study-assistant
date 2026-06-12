import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { CTASection } from "./components/sections/CTASection.jsx";
import { ComparisonSection } from "./components/sections/ComparisonSection.jsx";
import { ContactSection } from "./components/sections/ContactSection.jsx";
import { FeaturesSection } from "./components/sections/FeaturesSection.jsx";
import { HeroSection } from "./components/sections/HeroSection.jsx";
import { HowItWorksSection } from "./components/sections/HowItWorksSection.jsx";
import { LearningIntelligenceSection } from "./components/sections/LearningIntelligenceSection.jsx";
import { PricingSection } from "./components/sections/PricingSection.jsx";
import { ProductDemoSection } from "./components/sections/ProductDemoSection.jsx";
import { Magnet } from "./components/react-bits/index.js";
import { navItems } from "./data/landingContent.js";

function scrollToId(id) {
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function AuthModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  return (
    <div className={`auth-modal ${open ? "active" : ""}`} id="authModal" role="dialog" aria-modal="true" aria-labelledby="authModalTitle" aria-hidden={!open}>
      <button type="button" className="auth-modal-overlay" aria-label="Close account options" onClick={onClose} />
      <div className="auth-modal-panel">
        <button type="button" className="auth-modal-close" aria-label="Close account options" onClick={onClose}>
          <X size={20} />
        </button>
        <img src="/logos/synapse.png" alt="Synapse" />
        <h2 id="authModalTitle">Get Started with Synapse</h2>
        <p>Choose how you want to continue.</p>
        <div className="auth-modal-actions">
          <a className="button button-primary button-wide" href="signup.html">Create New Account</a>
          <a className="button button-secondary button-wide" href="login.html">Login to Existing Account</a>
        </div>
      </div>
    </div>
  );
}

function Navigation({ onGetStarted }) {
  const [open, setOpen] = useState(false);

  function handleAnchorClick(event, href) {
    event.preventDefault();
    setOpen(false);
    scrollToId(href.slice(1));
  }

  return (
    <nav className="landing-nav" id="mainNav">
      <div className="landing-nav-container">
        <a className="landing-logo" href="landing.html" aria-label="Synapse home">
          <img src="/logos/synapse.png" alt="" />
          <span>Synapse</span>
        </a>
        <div className={`landing-nav-menu ${open ? "active" : ""}`} id="navMenu">
          {navItems.map((item) => (
            <a href={item.href} key={item.href} onClick={(event) => handleAnchorClick(event, item.href)}>
              {item.label}
            </a>
          ))}
        </div>
        <div className="landing-nav-actions">
          <a className="button button-ghost" href="login.html">Login</a>
          <Magnet strength={0.12}>
            <button type="button" className="button button-primary" data-action="get-started" onClick={onGetStarted}>Get Started</button>
          </Magnet>
        </div>
        <button
          type="button"
          className="mobile-toggle"
          id="mobileToggle"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="navMenu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-container footer-grid">
        <div>
          <a className="footer-logo" href="landing.html">
            <img src="/logos/synapse.png" alt="" />
            <span>Synapse</span>
          </a>
          <p>Turn passive study notes into active learning.</p>
        </div>
        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
          <a href="privacy.html">Privacy</a>
          <a href="terms.html">Terms</a>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);

  function handleGetStarted() {
    setAuthOpen(true);
  }

  function handleViewDemo() {
    scrollToId("product-demo");
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Navigation onGetStarted={handleGetStarted} />
      <main id="main-content">
        <HeroSection onGetStarted={handleGetStarted} onViewDemo={handleViewDemo} />
        <ProductDemoSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ComparisonSection />
        <LearningIntelligenceSection />
        <PricingSection onGetStarted={handleGetStarted} />
        <ContactSection />
        <CTASection onGetStarted={handleGetStarted} />
      </main>
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
