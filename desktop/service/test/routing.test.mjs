import test from 'node:test';
import assert from 'node:assert/strict';
import { decideRoute, routeWorker, routingModel } from '../routing.mjs';

const choice = (value, probabilities, confidence = 0.9) => ({ type: 'choice', choice: value, probabilities, confidence });
const answers = ({ agent = choice('none', { none: 1 }), effort = choice('none', { none: 1 }), work = choice('execution', { execution: 0.95 }) } = {}) => ({ agent, effort, work });
const respond = (body, status = 200) => async () => ({ ok: status < 400, status, json: async () => body });

test('an explicitly named agent overrides the coordinator; otherwise its proposal stays', () => {
  assert.equal(decideRoute(answers({ agent: choice('claude', { claude: 0.97, none: 0.03 }) }), { agent: 'codex' }).agent, 'claude');
  assert.equal(decideRoute(answers({ agent: choice('kimi', { kimi: 0.6, none: 0.4 }) }), { agent: 'codex' }).agent, 'codex');
  const route = decideRoute(answers(), { agent: 'codex' });
  assert.equal(route.agent, 'codex'); assert.equal(route.routing.agentFrom, 'coordinator');
});

test('an explicit effort wins, and max needs a near-certain request', () => {
  assert.equal(decideRoute(answers({ effort: choice('high', { high: 0.99 }) }), { effort: 'xhigh' }).effort, 'high');
  assert.equal(decideRoute(answers({ effort: choice('max', { max: 0.98 }) })).effort, 'max');
  const unsure = decideRoute(answers({ effort: choice('max', { max: 0.75, none: 0.25 }) }), { effort: 'max' });
  assert.equal(unsure.effort, 'high'); assert.equal(unsure.routing.effortFrom, 'work');
});

test('the kind of work sets effort; an unclear judgment defers to the capped coordinator proposal', () => {
  assert.equal(decideRoute(answers({ work: choice('research', { research: 1 }) })).effort, 'xhigh');
  assert.equal(decideRoute(answers({ work: choice('routine', { routine: 0.9 }) }), { effort: 'xhigh' }).effort, 'medium');
  const unclear = answers({ work: choice('research', { research: 0.5, execution: 0.5 }, 0.1) });
  assert.equal(decideRoute(unclear, { effort: 'high' }).effort, 'high');
  assert.equal(decideRoute(unclear, { effort: 'max' }).effort, 'xhigh');
  assert.equal(decideRoute(unclear).effort, 'xhigh');
});

test('routeWorker sends the latest request to Jev and reports the answering model', async () => {
  let sent;
  const fetch = async (url, options) => { sent = { url, ...options, body: JSON.parse(options.body) }; return respond({ model: routingModel, answers: answers({ work: choice('research', { research: 1 }) }) })(); };
  const route = await routeWorker({ request: 'x'.repeat(20000), agent: 'codex', apiKey: 'test-key', fetch });
  assert.equal(sent.url, 'https://api.typesafe.ai/v1/systemone');
  assert.equal(sent.headers.Authorization, 'Bearer test-key');
  assert.equal(sent.body.model, routingModel);
  assert.equal(sent.body.state.request.length, 12000);
  assert.deepEqual(Object.keys(sent.body.questions), ['agent', 'effort', 'work']);
  assert.deepEqual(route, { agent: 'codex', effort: 'xhigh', routing: { by: 'jev', agentFrom: 'coordinator', effortFrom: 'work', work: 'research', workConfidence: 0.9, model: routingModel } });
});

test('routeWorker keeps the keyword rules without a key or when TypeSafe fails', async () => {
  let calls = 0;
  const noKey = await routeWorker({ request: 'Research cloth physics', agent: 'codex', apiKey: '', fetch: async () => { calls++; } });
  assert.equal(calls, 0);
  assert.deepEqual(noKey, { agent: 'codex', effort: 'xhigh', routing: { by: 'rules', reason: 'TYPESAFE_API_KEY is not set' } });
  const failed = await routeWorker({ request: 'Use max effort for this', agent: 'claude', apiKey: 'k', fetch: respond({}, 529) });
  assert.deepEqual(failed, { agent: 'claude', effort: 'max', routing: { by: 'rules', reason: 'TypeSafe returned 529' } });
  const malformed = await routeWorker({ request: 'Rename a file', agent: 'codex', effort: 'high', apiKey: 'k', fetch: respond({ answers: {} }) });
  assert.equal(malformed.effort, 'high'); assert.equal(malformed.routing.reason, 'TypeSafe request failed');
  const slow = await routeWorker({ request: 'Rename a file', agent: 'codex', apiKey: 'k', timeout: 20, fetch: (url, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason))) });
  assert.equal(slow.routing.reason, 'TypeSafe timed out');
});
