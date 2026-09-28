#!/usr/bin/env node
/**
 * Verification: a save can also reach Asterion, and never at the chart's expense.
 *
 * With COAIA_ASTERION_URL, _TOKEN and _PROJECT set, every save posts the memory
 * file to Asterion's ingest door (src/asterion-bridge.ts). The file is the record
 * and is written first: a door that is down, slow or refusing costs a log line,
 * never a chart. Nothing set means no network at all. Half set means off, said once.
 *
 * Earned in miadi-chronicle episode 060 (2026-09-28): the only thing standing
 * between an agent's chart and the Asterion site was a person remembering to run
 * an importer. Ref: miadisabelle/asterion#9
 */

import { createServer } from 'http';
import { mkdtempSync, rmSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { readAsterionConfig } from './dist/src/asterion-bridge.js';
import { KnowledgeGraphManager } from './dist/src/graph-manager.js';

let passed = 0;
let failed = 0;
function check(label, condition, detail) {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else { console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`); failed++; }
}

const dir = mkdtempSync(join(tmpdir(), 'coaia-asterion-'));
const NAMES = ['COAIA_ASTERION_URL', 'COAIA_ASTERION_TOKEN', 'COAIA_ASTERION_PROJECT', 'COAIA_ASTERION_ACTOR'];
const clearEnv = () => NAMES.forEach((n) => delete process.env[n]);
const entity = (name) => ({ name, entityType: 'concept', observations: [`observation of ${name}`] });

// A door that records what it is sent. `status` and `delayMs` shape its answers.
function startDoor({ status = 200, delayMs = 0 } = {}) {
  const requests = [];
  const server = createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      requests.push({ url: req.url, auth: req.headers.authorization, body: JSON.parse(body) });
      setTimeout(() => { res.writeHead(status, { 'content-type': 'application/json' }); res.end('{}'); }, delayMs);
    });
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, requests, url: `http://127.0.0.1:${server.address().port}` })));
}

try {
  console.log('\n📋 the three names decide, and a half-set bridge says why it is off');
  clearEnv();
  let r = readAsterionConfig({});
  check('nothing set: off and silent', r.config === null && r.problem === null);
  r = readAsterionConfig({ COAIA_ASTERION_URL: 'http://127.0.0.1:3336' });
  check('one of three: off, naming what is missing', r.config === null && /COAIA_ASTERION_TOKEN/.test(r.problem ?? '') && /COAIA_ASTERION_PROJECT/.test(r.problem ?? ''), r.problem);
  r = readAsterionConfig({ COAIA_ASTERION_URL: 'http://h', COAIA_ASTERION_TOKEN: 't', COAIA_ASTERION_PROJECT: '${PROJECT}' });
  check('an unexpanded shell variable: off', r.config === null && /unexpanded/.test(r.problem ?? ''), r.problem);
  r = readAsterionConfig({ COAIA_ASTERION_URL: 'ftp://h', COAIA_ASTERION_TOKEN: 't', COAIA_ASTERION_PROJECT: 'p' });
  check('a non-http URL: off', r.config === null && /http or https/.test(r.problem ?? ''), r.problem);
  r = readAsterionConfig({ COAIA_ASTERION_URL: 'https://user:pw@h', COAIA_ASTERION_TOKEN: 't', COAIA_ASTERION_PROJECT: 'p' });
  check('a URL carrying credentials: off, and the password is not repeated', r.config === null && /user or password/.test(r.problem ?? '') && !(r.problem ?? '').includes('pw'), r.problem);
  r = readAsterionConfig({ COAIA_ASTERION_URL: 'http://asterion.example.com', COAIA_ASTERION_TOKEN: 't', COAIA_ASTERION_PROJECT: 'p' });
  check('plain http to another host: off', r.config === null && /unencrypted/.test(r.problem ?? ''), r.problem);
  r = readAsterionConfig({ COAIA_ASTERION_URL: 'https://h', COAIA_ASTERION_TOKEN: 't', COAIA_ASTERION_PROJECT: 'Not A Key' });
  check('a project key Asterion would refuse: off', r.config === null && /COAIA_ASTERION_PROJECT must match/.test(r.problem ?? ''), r.problem);
  r = readAsterionConfig({ COAIA_ASTERION_URL: 'http://127.0.0.1:1/', COAIA_ASTERION_TOKEN: 't', COAIA_ASTERION_PROJECT: 'ep060' });
  check('all three: on, trailing slash dropped, actor and timeout defaulted',
    r.config?.url === 'http://127.0.0.1:1' && r.config?.project === 'ep060' && r.config?.actor === 'coaia-narrative (ep060)' && r.config?.timeoutMs === 60000, JSON.stringify(r));

  console.log('\n📋 a save posts the file it just wrote');
  const door = await startDoor({ delayMs: 400 });
  Object.assign(process.env, { COAIA_ASTERION_URL: door.url, COAIA_ASTERION_TOKEN: 'secret-token', COAIA_ASTERION_PROJECT: 'test-project', COAIA_ASTERION_ACTOR: 'test-writer' });
  const file = join(dir, 'on.coaia-narrative.jsonl');
  const on = new KnowledgeGraphManager(file);
  await on.createEntities([entity('first')]);
  await on.asterionIdle();
  const first = door.requests[0];
  check('one request after one save', door.requests.length === 1, `got ${door.requests.length}`);
  check('to the ingest door', first?.url === '/api/ingest/coaia-narrative', first?.url);
  check('with the bearer token', first?.auth === 'Bearer secret-token');
  check('naming the project, the file and the writer',
    first?.body.project === 'test-project' && first?.body.file === 'on.coaia-narrative.jsonl' && first?.body.actor === 'test-writer', JSON.stringify(first?.body ?? {}).slice(0, 160));
  check('carrying the file exactly as written', first?.body.jsonl === readFileSync(file, 'utf8'));

  console.log('\n📋 a burst of saves sends at most two posts, the last one current');
  const before = door.requests.length;
  await on.createEntities([entity('second')]);
  await on.createEntities([entity('third')]);
  await on.createEntities([entity('fourth')]);
  await on.asterionIdle();
  const burst = door.requests.slice(before);
  const last = burst[burst.length - 1]?.body.jsonl ?? '';
  check('three saves, at most two posts', burst.length >= 1 && burst.length <= 2, `got ${burst.length}`);
  check('the last post holds every save', ['second', 'third', 'fourth'].every((n) => last.includes(`"${n}"`)));
  door.server.close();

  console.log('\n📋 a refusing door costs nothing but a log line');
  const refusing = await startDoor({ status: 500 });
  process.env.COAIA_ASTERION_URL = refusing.url;
  const file500 = join(dir, 'refused.coaia-narrative.jsonl');
  const m500 = new KnowledgeGraphManager(file500);
  let threw = null;
  try { await m500.createEntities([entity('kept')]); await m500.asterionIdle(); } catch (err) { threw = err; }
  check('the save does not throw', threw === null, threw?.message);
  check('the chart is on disk', readFileSync(file500, 'utf8').includes('"kept"'));
  check('the door was asked once', refusing.requests.length === 1, `got ${refusing.requests.length}`);
  refusing.server.close();

  console.log('\n📋 an unreachable door costs nothing but a log line');
  process.env.COAIA_ASTERION_URL = 'http://127.0.0.1:1';
  const fileDown = join(dir, 'down.coaia-narrative.jsonl');
  const down = new KnowledgeGraphManager(fileDown);
  threw = null;
  const t0 = Date.now();
  try { await down.createEntities([entity('still-saved')]); await down.asterionIdle(); } catch (err) { threw = err; }
  check('the save does not throw', threw === null, threw?.message);
  check('the chart is on disk', readFileSync(fileDown, 'utf8').includes('"still-saved"'));
  check('and it gives up within the timeout', Date.now() - t0 < 7000, `${Date.now() - t0} ms`);

  console.log('\n📋 with nothing set there is no network at all');
  const quiet = await startDoor();
  clearEnv();
  const offFile = join(dir, 'off.coaia-narrative.jsonl');
  const off = new KnowledgeGraphManager(offFile);
  await off.createEntities([entity('local-only')]);
  await off.asterionIdle();
  check('no request reaches any door', quiet.requests.length === 0, `got ${quiet.requests.length}`);
  check('the chart is on disk', readFileSync(offFile, 'utf8').includes('"local-only"'));
  quiet.server.close();
} finally {
  clearEnv();
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
