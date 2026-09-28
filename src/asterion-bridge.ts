/**
 * A write that also reaches Asterion.
 *
 * Every chart write made through the MCP server funnels through
 * KnowledgeGraphManager.saveGraph. When three environment names are set, each of
 * those saves is followed by one POST of the memory file to Asterion's ingest
 * door, so a chart written by an agent appears on the site without anyone running
 * an importer. The `cnarrative` CLI writes the file directly and does not post;
 * the next MCP save, or Asterion's registry sync, carries what it wrote:
 *
 *   COAIA_ASTERION_URL      Asterion's base URL, e.g. http://127.0.0.1:3336
 *   COAIA_ASTERION_TOKEN    the door's bearer token (ASTERION_INGEST_TOKEN on that side)
 *   COAIA_ASTERION_PROJECT  the registered project key this memory file belongs to
 *   COAIA_ASTERION_ACTOR    optional: who is writing, recorded on Asterion's event log
 *   COAIA_ASTERION_TIMEOUT_MS optional: how long one post may take (default 60000, the door's own limit)
 *
 * None set: the server behaves exactly as before, file only, no network.
 * Some set: the bridge stays off and says why when the server starts, on stderr.
 *
 * The file is the record and is already written before anything is sent. A post
 * that fails is logged and dropped, never raised: Asterion being down must never
 * cost a chart. Posts do not overlap. Saves that land while one is in flight
 * collapse into a single follow-up carrying the latest file, so a burst of writes
 * sends at most two requests and the last one is always current.
 *
 * stdout is the MCP protocol channel. Everything here speaks on stderr.
 */

import { readFile } from 'fs/promises';
import { basename } from 'path';

export interface AsterionConfig {
  url: string;
  token: string;
  project: string;
  actor: string;
  timeoutMs?: number;
}

export const ASTERION_PROJECT_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/;
export const ASTERION_INGEST_PATH = '/api/ingest/coaia-narrative';

const NAMES = ['COAIA_ASTERION_URL', 'COAIA_ASTERION_TOKEN', 'COAIA_ASTERION_PROJECT'] as const;

/**
 * Read the bridge settings. Returns a config, or null with the reason it is off.
 * A null with no problem means nobody asked for the bridge.
 */
export function readAsterionConfig(
  env: Record<string, string | undefined> = process.env
): { config: AsterionConfig | null; problem: string | null } {
  const values = NAMES.map((n) => (env[n] ?? '').trim());
  const set = values.filter(Boolean).length;
  if (set === 0) return { config: null, problem: null };
  if (set < NAMES.length) {
    const missing = NAMES.filter((_, i) => !values[i]);
    return { config: null, problem: `the Asterion bridge is off: ${missing.join(', ')} not set (all three of ${NAMES.join(', ')} are needed)` };
  }
  const [url, token, project] = values;
  const unexpanded = NAMES.filter((_, i) => /\$\{?[A-Za-z_]/.test(values[i]));
  if (unexpanded.length) {
    return { config: null, problem: `the Asterion bridge is off: ${unexpanded.join(', ')} carries an unexpanded shell variable` };
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { config: null, problem: 'the Asterion bridge is off: COAIA_ASTERION_URL is not a URL' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { config: null, problem: `the Asterion bridge is off: COAIA_ASTERION_URL must be http or https, not ${parsed.protocol}` };
  }
  // Credentials in the URL would be printed in every log line; the token is the credential.
  if (parsed.username || parsed.password) {
    return { config: null, problem: 'the Asterion bridge is off: COAIA_ASTERION_URL must not carry a user or password' };
  }
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
  if (parsed.protocol === 'http:' && !loopback) {
    return { config: null, problem: `the Asterion bridge is off: plain http to ${parsed.hostname} would send the token and the memory file unencrypted; use https` };
  }
  if (!ASTERION_PROJECT_PATTERN.test(project)) {
    return { config: null, problem: `the Asterion bridge is off: COAIA_ASTERION_PROJECT must match ${ASTERION_PROJECT_PATTERN}, got "${project}"` };
  }
  const actor = (env.COAIA_ASTERION_ACTOR ?? '').trim() || `coaia-narrative (${project})`;
  const timeoutMs = Number(env.COAIA_ASTERION_TIMEOUT_MS ?? '') || 60000;
  return { config: { url: url.replace(/\/+$/, ''), token, project, actor, timeoutMs }, problem: null };
}

export interface AsterionNotifier {
  /** Send the memory file now, or once more after the post in flight. Never rejects. */
  notify(): Promise<void>;
  /** Resolves when nothing is in flight or pending. */
  idle(): Promise<void>;
}

export function createAsterionNotifier(
  memoryFilePath: string,
  config: AsterionConfig,
  options: {
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
    log?: (message: string) => void;
  } = {}
): AsterionNotifier {
  const fetchImpl = options.fetchImpl ?? fetch;
  // As long as the door may work on one file (its maxDuration), so a large file is not abandoned
  // mid-apply and re-sent over itself. Posts never overlap, so a long wait never piles up.
  const timeoutMs = options.timeoutMs ?? config.timeoutMs ?? 60000;
  const log = options.log ?? ((m: string) => console.error(m));
  const endpoint = `${config.url}${ASTERION_INGEST_PATH}`;

  let inFlight: Promise<void> | null = null;
  let pending = false;

  async function send(): Promise<void> {
    try {
      const jsonl = await readFile(memoryFilePath, 'utf8');
      const res = await fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${config.token}` },
        body: JSON.stringify({ project: config.project, jsonl, file: basename(memoryFilePath), actor: config.actor }),
        signal: AbortSignal.timeout(timeoutMs),
        // A redirect would carry the whole memory file to wherever it points.
        redirect: 'error',
      });
      if (!res.ok) {
        const detail = (await res.text().catch(() => '')).slice(0, 200);
        log(`asterion: ${endpoint} answered ${res.status} for project ${config.project}${detail ? ` — ${detail}` : ''}`);
      }
    } catch (err) {
      log(`asterion: could not post project ${config.project} to ${endpoint} — ${err instanceof Error ? err.message : String(err)}. The chart is saved; the registry sync will carry it.`);
    }
  }

  function notify(): Promise<void> {
    if (inFlight) {
      pending = true;
      return inFlight;
    }
    inFlight = send().finally(() => {
      inFlight = null;
      if (pending) {
        pending = false;
        void notify();
      }
    });
    return inFlight;
  }

  async function idle(): Promise<void> {
    while (inFlight) await inFlight;
  }

  return { notify, idle };
}
