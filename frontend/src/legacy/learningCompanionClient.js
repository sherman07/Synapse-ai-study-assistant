import { API_BASE } from "./apiConfig.js?v=ai-learning-companion-v1";
import { SynapseApiClient } from "./apiClient.js?v=ai-learning-companion-v1";
import { dataApiFetch } from "./dataApiClient.js?v=ai-learning-companion-v1";

const companionApiClient = new SynapseApiClient(API_BASE);

async function fetchLearningSubjects(limit = 50) {
  const payload = await dataApiFetch(`/api/learning/subjects?limit=${encodeURIComponent(limit)}`);
  return Array.isArray(payload.items) ? payload.items : [];
}

async function createLearningSubject(subject) {
  const payload = await dataApiFetch("/api/learning/subjects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subject || {}),
  });
  return payload.item;
}

async function createLearningSession(subjectId, session) {
  const payload = await dataApiFetch(`/api/learning/subjects/${encodeURIComponent(subjectId)}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session || {}),
  });
  return payload.item;
}

async function fetchLearningMessages(sessionId, limit = 100) {
  const payload = await dataApiFetch(`/api/learning/sessions/${encodeURIComponent(sessionId)}/messages?limit=${encodeURIComponent(limit)}`);
  return Array.isArray(payload.items) ? payload.items : [];
}

async function appendLearningMessage(sessionId, message) {
  const payload = await dataApiFetch(`/api/learning/sessions/${encodeURIComponent(sessionId)}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message || {}),
  });
  return payload.item;
}

async function requestLearningCompanionDecision(payload) {
  const response = await companionApiClient.fetch("/learning-companion/respond", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
    timeoutMs: 45000,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.error) {
    throw new Error(body?.error || `Synapse companion returned HTTP ${response.status}`);
  }
  return body;
}

export {
  appendLearningMessage,
  createLearningSession,
  createLearningSubject,
  fetchLearningMessages,
  fetchLearningSubjects,
  requestLearningCompanionDecision,
};
