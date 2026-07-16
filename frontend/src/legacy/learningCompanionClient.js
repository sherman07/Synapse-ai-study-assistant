import { API_BASE } from "./apiConfig.js?v=ai-learning-companion-v1";
import { SynapseApiClient } from "./apiClient.js?v=ai-learning-companion-v1";

const companionApiClient = new SynapseApiClient(API_BASE);

async function requestLearningCompanionDecision({ message, messages = [], availableTimeMinutes = null } = {}) {
  const response = await companionApiClient.fetch("/learning-companion/respond", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, messages, availableTimeMinutes }),
    timeoutMs: 45000,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.error) throw new Error(body?.error || "Synapse could not reply right now.");
  return body;
}

export { requestLearningCompanionDecision };
