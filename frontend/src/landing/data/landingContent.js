import {
  BadgeCheck,
  BrainCircuit,
  CircleHelp,
  ClipboardCheck,
  FileUp,
  GitBranch,
  Layers3,
  LineChart,
  MessageSquareText,
  NotebookTabs,
  Radar,
  Repeat2,
  Sparkles,
  Target,
  TimerReset,
  Waypoints
} from "lucide-react";

export const heroBadges = [
  "Upload Material",
  "Generate Notes",
  "Mind Map",
  "Teach-Back Feedback"
];

// Honest product capabilities as short labels — avoid KPI-counter chrome that
// reads like fabricated performance metrics.
export const heroStats = [
  { label: "PDFs, slides, video & more", value: "", suffix: "" },
  { label: "Notes, maps, practice, tutor", value: "", suffix: "" },
  { label: "Revision whenever you need it", value: "", suffix: "" }
];

export const demoNotes = [
  "Photosynthesis converts light into chemical energy.",
  "Chlorophyll absorbs blue and red wavelengths most strongly.",
  "The Calvin cycle fixes carbon into glucose precursors."
];

export const demoQuestions = [
  "Why does chlorophyll reflect green light?",
  "What changes if CO2 availability drops?",
  "Teach back the light-dependent reaction in one minute."
];

export const features = [
  {
    icon: FileUp,
    title: "Upload Any Study Material",
    description: "Bring PDFs, slides, images, videos, or notes into one source-aware learning workspace.",
    preview: "PDF -> transcript -> concepts"
  },
  {
    icon: NotebookTabs,
    title: "Generate Structured Notes",
    description: "Synapse extracts key points, definitions, examples, and citations into revision-ready notes.",
    preview: "Key ideas appear line by line"
  },
  {
    icon: GitBranch,
    title: "Build Visual Mind Maps",
    description: "Turn dense material into connected concepts so relationships are easier to inspect and remember.",
    preview: "Concept nodes connect in context"
  },
  {
    icon: CircleHelp,
    title: "Practice Questions",
    description: "Generate targeted questions that challenge recall instead of letting summaries do the thinking.",
    preview: "Question bank adapts to gaps"
  },
  {
    icon: MessageSquareText,
    title: "Teach-Back Feedback",
    description: "Explain the topic back to Synapse and get precise feedback on missing steps or weak reasoning.",
    preview: "Feedback updates live"
  },
  {
    icon: BadgeCheck,
    title: "Source-Aware Learning",
    description: "Every note, map, and practice item can stay grounded in the material you uploaded.",
    preview: "Answers trace back to sources"
  }
];

export const journeySteps = [
  {
    title: "Upload Material",
    description: "Drop in PDFs, slides, videos, images, or raw notes.",
    icon: FileUp
  },
  {
    title: "Generate Notes",
    description: "Synapse extracts key ideas and builds structured notes.",
    icon: Sparkles
  },
  {
    title: "Organise Ideas",
    description: "Concepts cluster into maps, source groups, and revision themes.",
    icon: Waypoints
  },
  {
    title: "Teach and Practice",
    description: "Explain, answer, and actively retrieve the material.",
    icon: BrainCircuit
  },
  {
    title: "Get Feedback",
    description: "Weak points and missed reasoning steps become visible.",
    icon: Radar
  },
  {
    title: "Revise and Master",
    description: "A repeatable queue guides your next high-impact session.",
    icon: Target
  }
];

export const intelligenceCards = [
  {
    icon: Target,
    label: "Mastery Score",
    value: 87,
    suffix: "%",
    detail: "Up 19 points after teach-back review"
  },
  {
    icon: Layers3,
    label: "Weak Topics",
    value: 4,
    suffix: "",
    detail: "Carbon fixation, enzyme limits, exam phrasing"
  },
  {
    icon: Repeat2,
    label: "Revision Queue",
    value: 12,
    suffix: " items",
    detail: "Prioritised by confidence and source weight"
  },
  {
    icon: ClipboardCheck,
    label: "Practice Accuracy",
    value: 74,
    suffix: "%",
    detail: "Questions adjust as recall improves"
  },
  {
    icon: TimerReset,
    label: "Study Streak",
    value: 9,
    suffix: " days",
    detail: "Momentum without noisy gamification"
  }
];

export const weakTopicList = [
  "Light-dependent reactions need a clearer sequence.",
  "Explain ATP and NADPH roles with less memorised wording.",
  "Connect limiting factors to graph interpretation."
];

export const pricingPlans = [
  {
    name: "Free",
    price: 0,
    credits: 500,
    description: "Core study generation for getting started.",
    features: ["Basic uploads", "Generate notes", "Create mind maps", "Limited practice", "Free forever"]
  },
  {
    name: "Pro Monthly",
    price: 9,
    credits: 4000,
    recommended: true,
    description: "Upgrade to Pro with monthly billing.",
    features: [
      "More uploads",
      "All note generation features",
      "Interactive mind maps",
      "More practice questions",
      "Teach-back sessions",
      "Knowledge gap analysis",
      "Stripe Customer Portal"
    ]
  },
  {
    name: "Pro Yearly",
    price: 90,
    credits: 4000,
    description: "Upgrade to Pro with one-time annual access.",
    features: ["Everything in Pro Monthly", "Best long-term value", "Priority processing", "Advanced analytics", "Export to PDF/Word", "Webhook-verified access"]
  }
];

export const passiveComparison = [
  "Summarises content",
  "No understanding check",
  "No feedback loop",
  "Easy to forget"
];

export const activeComparison = [
  "Tests understanding",
  "Finds knowledge gaps",
  "Gives targeted questions",
  "Builds repeatable revision workflow"
];

export const navItems = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Compare", href: "#about" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" }
];
