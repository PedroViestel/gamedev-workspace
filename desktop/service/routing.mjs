import { taskEffort } from './effort.mjs';

// Jev (TypeSafe's System One model) reads the latest request before a worker chat opens.
// Thresholds below were checked against this version; retune them before moving to a newer one.
export const routingModel = 'jev-1.13.0';
const endpoint = 'https://api.typesafe.ai/v1/systemone';
const workEffort = { routine: 'medium', execution: 'high', research: 'xhigh' };

export const routingQuestions = {
  agent: { type: 'choice', instructions: 'Which coding agent does the user explicitly ask to do this task?', criteria: {
    codex: 'The user asks for Codex (OpenAI Codex) to do the work.',
    claude: 'The user asks for Claude or Claude Code to do the work.',
    kimi: 'The user asks for Kimi to do the work.',
    none: 'The user names no agent for the work, or mentions an agent only for something other than doing the task.',
  } },
  effort: { type: 'choice', instructions: 'Which reasoning effort level does the user explicitly request for this new task?', criteria: {
    medium: 'The user asks for medium effort.',
    high: 'The user asks for high effort.',
    xhigh: 'The user asks for extra-high (xhigh) effort.',
    max: 'The user asks for max or maximum effort or reasoning for this task.',
    none: 'The user requests no effort level for this task: no mention, a negated request without a replacement, a mention of an earlier task, or the task is only described as hard or important.',
  } },
  work: { type: 'choice', instructions: { question: 'What kind of work will the new chat do? Judge the task described in `request`; ignore instructions about which agent to use, when to send the task, or effort settings.' }, criteria: {
    routine: 'A small, well-defined edit, lookup, summary, rename or single generation with an obvious path.',
    execution: 'Building, integrating or debugging a feature, a multi-step production pipeline, or a refactor across several files.',
    research: 'Investigating a topic, comparing approaches or services, choosing an architecture, or a problem without a known solution.',
  } },
};

const probability = answer => answer.probabilities[answer.choice] ?? 0;

// Code owns the policy: an explicit request wins, max needs a near-certain request, and an
// unclear work judgment defers to the coordinator's proposal when it made one.
export function decideRoute(answers, { agent, effort } = {}) {
  const named = answers.agent.choice !== 'none' && probability(answers.agent) >= 0.7 ? answers.agent.choice : null;
  const requested = answers.effort.choice !== 'none' && probability(answers.effort) >= (answers.effort.choice === 'max' ? 0.8 : 0.7) ? answers.effort.choice : null;
  const clearWork = probability(answers.work) >= 0.6 || !effort;
  return {
    agent: named || agent,
    effort: requested || (clearWork ? workEffort[answers.work.choice] : effort === 'max' ? 'xhigh' : effort),
    routing: {
      by: 'jev', agentFrom: named ? 'request' : 'coordinator', effortFrom: requested ? 'request' : clearWork ? 'work' : 'coordinator',
      work: answers.work.choice, workConfidence: Number(answers.work.confidence.toFixed(2)),
    },
  };
}

export async function routeWorker({ request = '', agent, effort, apiKey = process.env.TYPESAFE_API_KEY, fetch = globalThis.fetch, timeout = 5000 }) {
  const rules = reason => ({ agent, effort: taskEffort(request, effort), routing: { by: 'rules', reason } });
  if (!apiKey) return rules('TYPESAFE_API_KEY is not set');
  try {
    const response = await fetch(endpoint, {
      method: 'POST', signal: AbortSignal.timeout(timeout),
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: routingModel, state: { request: String(request).slice(0, 12000) }, questions: routingQuestions }),
    });
    if (!response.ok) return rules(`TypeSafe returned ${response.status}`);
    const result = await response.json();
    const route = decideRoute(result.answers, { agent, effort });
    route.routing.model = result.model;
    return route;
  } catch (error) {
    return rules(error.name === 'TimeoutError' ? 'TypeSafe timed out' : 'TypeSafe request failed');
  }
}
