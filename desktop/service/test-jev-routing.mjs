// Real Jev routing decisions for representative worker requests. Uses the TypeSafe API key.
import assert from 'node:assert/strict';
import { routeWorker } from './routing.mjs';

if (!process.argv.includes('--use-typesafe')) throw new Error('Pass --use-typesafe to check routing with the TypeSafe API.');
if (!process.env.TYPESAFE_API_KEY) throw new Error('Set TYPESAFE_API_KEY first.');
const cases = [
  ['Create a new Codex chat for a deep research into game character animation methods. Only open the chat for now.', 'claude', 'codex', 'xhigh'],
  ['Открой отдельный новый Claude чат для исследования физики ткани. Для этой задачи я явно прошу max effort.', 'codex', 'claude', 'max'],
  ['Используй максимальные усилия: переделай систему сохранений.', 'codex', 'codex', 'max'],
  ['Throw everything at this: rebuild the save system with maximum reasoning.', 'codex', 'codex', 'max'],
  ['Last time you used max effort and it was slow; open a chat to rename the export folder.', 'codex', 'codex', 'medium'],
  ['Debug why the Blender export has sliding feet; do not use max effort, high is enough.', 'codex', 'codex', 'high'],
  ['Research animation methods. Не используй max, хватит high.', 'codex', 'codex', 'high'],
  ['Fix the typo in the Dream Game card title, use xhigh reasoning.', 'codex', 'codex', 'xhigh'],
  ['Fix the typo in the Dream Game card title.', 'codex', 'codex', 'medium'],
  ['Have Kimi summarize the arachne concept notes.', 'codex', 'kimi', 'medium'],
  ['Ask Claude what it thinks, but let Codex actually build the inventory UI.', 'claude', 'codex', 'high'],
  ['Implement the combat system prototype for My Dream Game in Three.js, with hit detection and a health bar.', 'claude', 'claude', 'high'],
  ['Rig and animate the arachne character in Blender with a walk cycle, then export to GLB for the game.', 'codex', 'codex', 'high'],
  ['Compare three approaches for procedural spider locomotion and recommend an architecture. This is hard, take your time.', 'codex', 'codex', 'xhigh'],
  ['Research which 3D generation service gives the cleanest topology for game-ready meshes and write a research card.', 'codex', 'codex', 'xhigh'],
];
const failures = [];
await Promise.all(cases.map(async ([request, proposed, agent, effort]) => {
  const start = performance.now();
  const route = await routeWorker({ request, agent: proposed });
  assert.equal(route.routing.by, 'jev', route.routing.reason);
  const passed = route.agent === agent && route.effort === effort;
  if (!passed) failures.push(request);
  console.log(JSON.stringify({ passed, milliseconds: Math.round(performance.now() - start), request: request.slice(0, 70), agent: route.agent, effort: route.effort, routing: route.routing }));
}));
assert.deepEqual(failures, []);
