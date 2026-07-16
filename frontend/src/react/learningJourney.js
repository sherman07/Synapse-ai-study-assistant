const FINAL_STAGE_LABELS = {
  hobby: "Try it your way",
  skill: "Apply it",
  project: "Ship a checkpoint",
  assessment: "Prove it under pressure",
};

function buildLearningJourney({ intention = "skill", hasSession = false, evidence = [] } = {}) {
  const items = Array.isArray(evidence) ? evidence : [];
  const hasExplanationEvidence = items.some(item => ["self_check", "practice", "assessment", "project"].includes(item?.evidenceType));
  const finalEvidenceType = intention === "assessment"
    ? "assessment"
    : intention === "project"
      ? "project"
      : "practice";
  return [
    { id: "orient", label: "Orient", complete: Boolean(hasSession) },
    { id: "explain", label: "Explain it", complete: hasExplanationEvidence },
    { id: "apply", label: FINAL_STAGE_LABELS[intention] || FINAL_STAGE_LABELS.skill, complete: items.some(item => item?.evidenceType === finalEvidenceType) },
  ];
}

export { buildLearningJourney };
