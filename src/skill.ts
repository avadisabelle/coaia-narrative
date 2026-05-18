import {
  lstatSync,
  mkdirSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { homedir } from 'os';
import { dirname, relative as relativePath, resolve } from 'path';
import { createInterface } from 'readline/promises';
import type minimist from 'minimist';

type EmbeddedSkillFile = {
  relativePath: string;
  content: string;
};

const SKILL_NAME = 'coaia-narrative';

const COAIA_NARRATIVE_SKILL_MD = [
  '---',
  'name: coaia-narrative',
  'description: Use coaia-narrative to create and manage Structural Tension Charts, narrative beats, advancing patterns, MMOT evaluations, and MCP-backed creative-orientation memory.',
  'license: MIT',
  'compatibility: Requires the coaia-narrative package. CLI: cnarrative. MCP server: coaia-narrative.',
  'metadata:',
  '  author: Guillaume D. Isabelle',
  '  version: "1.0.0"',
  'allowed-tools: Bash(cnarrative:*), Bash(coaia-narrative:*)',
  '---',
  '',
  '# coaia-narrative',
  '',
  '`coaia-narrative` is the Structural Tension Chart and narrative beat memory surface in the COAIA family. Use it when an LLM should help create outcomes, hold current reality clearly, track strategic secondary choices, and archive significant learning as narrative beats.',
  '',
  '## Status',
  '',
  '!`cnarrative version 2>/dev/null || echo "Not installed: npm install -g coaia-narrative"`',
  '',
  '## First Principles',
  '',
  '- Work from creative orientation: ask what result the user wants to create, not what problem should disappear.',
  '- Hold desired outcome and current reality at the same time. Do not collapse the tension with "ready to begin" defaults.',
  '- Treat action steps as strategic secondary choices. They are not a to-do list.',
  '- Every action step is also a telescoped chart with its own desired outcome and current reality.',
  '- Use narrative beats for significant learning moments, not routine task tracking.',
  '',
  '## MCP Setup For LLM Tool Use',
  '',
  'Use the MCP server when the assistant needs write access to chart memory:',
  '',
  '```json',
  '{',
  '  "mcpServers": {',
  '    "coaia-narrative": {',
  '      "command": "npx",',
  '      "args": ["-y", "coaia-narrative", "--memory-path", "/absolute/path/to/memory.jsonl"],',
  '      "env": {',
  '        "COAIA_TOOLS": "STC_TOOLS,NARRATIVE_TOOLS,init_llm_guidance"',
  '      }',
  '    }',
  '  }',
  '}',
  '```',
  '',
  'When a new LLM session connects, call `init_llm_guidance` first, preferably with `format: "full"` for first use and `format: "quick"` for refreshes.',
  '',
  '## CLI Inspection Flow',
  '',
  'Use the human CLI for quick inspection, exports, and local chart context:',
  '',
  '```bash',
  'cnarrative list -M ./memory.jsonl',
  'cnarrative view <chartId> -M ./memory.jsonl',
  'cnarrative stats -M ./memory.jsonl',
  'cnarrative export <chartId> --output chart.md -M ./memory.jsonl',
  '```',
  '',
  '## Core MCP Workflow',
  '',
  '1. Start by reading chart state:',
  '',
  '```text',
  'list_active_charts',
  '```',
  '',
  '2. Create a new chart only when there is a new primary desired outcome:',
  '',
  '```json',
  '{',
  '  "tool": "create_structural_tension_chart",',
  '  "arguments": {',
  '    "desiredOutcome": "A working release process for coaia-narrative",',
  '    "currentReality": "Build and publish steps are manual and easy to miss",',
  '    "dueDate": "2026-06-01T00:00:00.000Z",',
  '    "actionSteps": ["Document release checks", "Verify npm package contents"]',
  '  }',
  '}',
  '```',
  '',
  '3. Add or expand action steps with `manage_action_step`:',
  '',
  '```json',
  '{',
  '  "tool": "manage_action_step",',
  '  "arguments": {',
  '    "parentReference": "chart_123",',
  '    "actionDescription": "Verify npm package contents",',
  '    "currentReality": "No package dry-run has been inspected for this release"',
  '  }',
  '}',
  '```',
  '',
  '4. Track advancement without pretending completion:',
  '',
  '```text',
  'update_action_progress',
  'update_current_reality',
  'mark_action_complete',
  '```',
  '',
  '5. Use `perform_mmot_evaluation` when output and expected performance diverge, or when a chart needs a truth-based review.',
  '',
  '6. Create a narrative beat when the work produced a significant learning moment across engineer-world, ceremony-world, and story-engine-world.',
  '',
  '## Tool Map',
  '',
  '| Tool | Use |',
  '|---|---|',
  '| `init_llm_guidance` | Load methodology and anti-pattern guidance |',
  '| `list_active_charts` | Start here; see chart IDs and progress |',
  '| `get_chart` | Inspect one full chart |',
  '| `create_structural_tension_chart` | Create a new primary desired outcome |',
  '| `manage_action_step` | Recommended action-step creation and expansion interface |',
  '| `update_action_progress` | Add progress notes without claiming completion |',
  '| `update_current_reality` | Add factual observations to current reality |',
  '| `mark_action_complete` | Complete an action and flow it into current reality |',
  '| `perform_mmot_evaluation` | Run acknowledge, analyze, update, recommit review |',
  '| `create_narrative_beat` | Archive significant multi-universe learning |',
  '| `list_narrative_beats` | Review narrative archive for a chart |',
  '',
  '## References',
  '',
  '- `references/creative-orientation.md` for the creation-vs-problem-solving distinction.',
  '- `references/structural-tension-charting.md` for chart and action-step rules.',
  '- `references/delayed-resolution.md` for current reality discipline.',
  '- `references/narrative-beats.md` for story archive usage.',
  '- `references/mcp-tools.md` for MCP tool groups and environment variables.',
].join('\n') + '\n';

const CREATIVE_ORIENTATION_MD = [
  '# Creative Orientation',
  '',
  'Creative orientation focuses on bringing desired results into being. Reactive orientation focuses on removing unwanted conditions. `coaia-narrative` should bias toward creation.',
  '',
  'Ask: "What do you want to create?" Then define current reality in relation to that desired outcome.',
  '',
  'Structural tension is not a gap to bridge. It is the active disequilibrium created by holding desired outcome and current reality clearly at the same time.',
  '',
  'Use this language:',
  '',
  '| Avoid | Prefer |',
  '|---|---|',
  '| bridge the gap | resolve the tension |',
  '| close the gap | advance toward the desired outcome |',
  '| tasks to fix the problem | strategic secondary choices |',
  '| ready to begin | factual current reality |',
  '',
  'A useful chart advances toward a created result. It does not merely remove a discomfort.',
].join('\n') + '\n';

const STRUCTURAL_TENSION_CHARTING_MD = [
  '# Structural Tension Charting',
  '',
  'A chart has three core parts:',
  '',
  '1. Desired Outcome: what the user wants to create.',
  '2. Current Reality: the honest present state in relation to the outcome.',
  '3. Action Steps: strategic secondary choices that support the primary choice.',
  '',
  'Action steps are not independent checklist items. They must make sense together as an overview strategy. Test them with: "If these steps were taken, would the desired outcome likely be created?"',
  '',
  'Each action step is a telescoped chart. Its title becomes the desired outcome of the child chart, and it needs its own current reality. Never use "ready to begin" as that reality.',
  '',
  'Good current reality examples:',
  '',
  '- "No Django experience."',
  '- "Package builds locally, publish dry-run not inspected."',
  '- "Budget: $5000."',
  '- "Completed models section, struggling with views."',
  '',
  'Poor current reality examples:',
  '',
  '- "Ready to begin."',
  '- "Need to retrieve the notes."',
  '- "Excited to start."',
  '- "Prepared to tackle the action step."',
].join('\n') + '\n';

const DELAYED_RESOLUTION_MD = [
  '# Delayed Resolution',
  '',
  'The LLM must tolerate discrepancy and delayed resolution. Do not smooth over the contradiction between desired outcome and current reality.',
  '',
  'When information is missing, ask for current reality or name the missing reality explicitly. Do not invent readiness.',
  '',
  'During MMOT review, keep the focus on truth:',
  '',
  '1. Acknowledge the difference between expected and delivered.',
  '2. Analyze how it came to pass.',
  '3. Update the chart and current reality.',
  '4. Recommit or redirect based on what is now true.',
].join('\n') + '\n';

const NARRATIVE_BEATS_MD = [
  '# Narrative Beats',
  '',
  'Narrative beats document significant learning moments. They are not replacements for charts or action steps.',
  '',
  'Create a beat when a moment matters across multiple perspectives:',
  '',
  '- engineer-world: technical structure and consequences',
  '- ceremony-world: relational protocol and accountability',
  '- story-engine-world: narrative progression and meaning',
  '',
  'A useful beat includes title, act, dramatic type, universes, description, prose, and lessons. Use beats after a real transition, discovery, crisis, MMOT, or integration moment.',
].join('\n') + '\n';

const MCP_TOOLS_MD = [
  '# MCP Tools And Environment',
  '',
  'Default tools are controlled by `COAIA_TOOLS`. The package default enables `STC_TOOLS,NARRATIVE_TOOLS,init_llm_guidance`.',
  '',
  'Tool groups:',
  '',
  '- `STC_TOOLS`: chart creation, action-step management, progress, current reality, desired outcome, MMOT.',
  '- `NARRATIVE_TOOLS`: narrative beat creation, telescoping, listing.',
  '- `KG_TOOLS`: lower-level knowledge graph entities and relations.',
  '- `CORE_TOOLS`: minimal list/create/add/complete workflow.',
  '',
  'Useful environment variables:',
  '',
  '| Variable | Purpose |',
  '|---|---|',
  '| `COAIA_TOOLS` | Comma or space separated enabled groups/tools |',
  '| `COAIA_DISABLED_TOOLS` | Comma or space separated disabled tools |',
  '| `COAIAN_MF` | Default memory file path for `cnarrative` |',
  '| `COAIAN_CC` | Default current chart ID for `cnarrative` |',
  '',
  'Prefer STC tools for chart work. Use KG tools only when deliberately managing generic entities and relations.',
].join('\n') + '\n';

const INSTALL_AND_ENVIRONMENT_MD = [
  '# Install And Environment',
  '',
  'Install globally:',
  '',
  '```bash',
  'npm install -g coaia-narrative',
  'cnarrative skill show',
  'cnarrative skill install --yes',
  '```',
  '',
  'Use MCP directly:',
  '',
  '```bash',
  'coaia-narrative --memory-path ./memory.jsonl',
  '```',
  '',
  'Use CLI inspection:',
  '',
  '```bash',
  'cnarrative list -M ./memory.jsonl',
  'cnarrative view <chartId> -M ./memory.jsonl',
  '```',
  '',
  '`cnarrative skill install` writes `.agents/skills/coaia-narrative`. Add `--global` for `~/.agents/skills/coaia-narrative`. Add `--yes` to create the matching `.claude/skills/coaia-narrative` symlink.',
].join('\n') + '\n';

const EMBEDDED_SKILL_FILES: EmbeddedSkillFile[] = [
  { relativePath: 'SKILL.md', content: COAIA_NARRATIVE_SKILL_MD },
  { relativePath: 'references/creative-orientation.md', content: CREATIVE_ORIENTATION_MD },
  { relativePath: 'references/structural-tension-charting.md', content: STRUCTURAL_TENSION_CHARTING_MD },
  { relativePath: 'references/delayed-resolution.md', content: DELAYED_RESOLUTION_MD },
  { relativePath: 'references/narrative-beats.md', content: NARRATIVE_BEATS_MD },
  { relativePath: 'references/mcp-tools.md', content: MCP_TOOLS_MD },
  { relativePath: 'references/install-and-environment.md', content: INSTALL_AND_ENVIRONMENT_MD },
];

function getSkillInstallDir(globalInstall: boolean): string {
  return globalInstall
    ? resolve(homedir(), '.agents', 'skills', SKILL_NAME)
    : resolve(process.cwd(), '.agents', 'skills', SKILL_NAME);
}

function getClaudeSkillLinkPath(globalInstall: boolean): string {
  return globalInstall
    ? resolve(homedir(), '.claude', 'skills', SKILL_NAME)
    : resolve(process.cwd(), '.claude', 'skills', SKILL_NAME);
}

function pathExists(pathName: string): boolean {
  try {
    lstatSync(pathName);
    return true;
  } catch {
    return false;
  }
}

function removePath(pathName: string): void {
  const stat = lstatSync(pathName);
  if (stat.isDirectory() && !stat.isSymbolicLink()) {
    rmSync(pathName, { recursive: true, force: true });
  } else {
    unlinkSync(pathName);
  }
}

function writeEmbeddedSkill(targetDir: string, force: boolean): void {
  if (pathExists(targetDir)) {
    if (!force) {
      throw new Error(`Skill already exists: ${targetDir} (use --force to replace it)`);
    }
    removePath(targetDir);
  }

  mkdirSync(targetDir, { recursive: true });
  for (const file of EMBEDDED_SKILL_FILES) {
    const destination = resolve(targetDir, file.relativePath);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, file.content, 'utf-8');
  }
}

function ensureClaudeSymlink(linkPath: string, targetDir: string, force: boolean): boolean {
  const parentDir = dirname(linkPath);
  if (pathExists(parentDir)) {
    const resolvedTargetParent = realpathSync(dirname(targetDir));
    const resolvedLinkParent = realpathSync(parentDir);

    if (resolvedTargetParent === resolvedLinkParent) {
      return false;
    }
  }

  const linkTarget = relativePath(parentDir, targetDir) || '.';
  mkdirSync(parentDir, { recursive: true });

  if (pathExists(linkPath)) {
    const stat = lstatSync(linkPath);
    if (stat.isSymbolicLink() && readlinkSync(linkPath) === linkTarget) {
      return true;
    }
    if (!force) {
      throw new Error(`Claude skill path already exists: ${linkPath} (use --force to replace it)`);
    }
    removePath(linkPath);
  }

  symlinkSync(linkTarget, linkPath, 'dir');
  return true;
}

async function shouldCreateClaudeSymlink(linkPath: string, autoYes: boolean): Promise<boolean> {
  if (autoYes) {
    return true;
  }
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.log(`Tip: create a Claude symlink manually at ${linkPath}`);
    return false;
  }

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = await rl.question(`Create a symlink in ${linkPath}? [y/N] `);
    const normalized = answer.trim().toLowerCase();
    return normalized === 'y' || normalized === 'yes';
  } finally {
    rl.close();
  }
}

async function installSkill(globalInstall: boolean, force: boolean, autoYes: boolean): Promise<void> {
  const installDir = getSkillInstallDir(globalInstall);
  writeEmbeddedSkill(installDir, force);
  console.log(`Installed coaia-narrative skill to ${installDir}`);

  const claudeLinkPath = getClaudeSkillLinkPath(globalInstall);
  if (!(await shouldCreateClaudeSymlink(claudeLinkPath, autoYes))) {
    return;
  }

  const linked = ensureClaudeSymlink(claudeLinkPath, installDir, force);
  if (linked) {
    console.log(`Linked Claude skill at ${claudeLinkPath}`);
  } else {
    console.log(`Claude already sees the skill via ${dirname(claudeLinkPath)}`);
  }
}

export function showCoaiaNarrativeSkill(): void {
  console.log('coaia-narrative Skill (embedded)');
  console.log('');
  process.stdout.write(COAIA_NARRATIVE_SKILL_MD);
}

export function showSkillCommandHelp(): void {
  console.log([
    'Usage: cnarrative skill <show|install|help> [options]',
    '',
    'Commands:',
    '  show                Print the packaged coaia-narrative skill',
    '  install             Install into ./.agents/skills/coaia-narrative',
    '  help                Show this help',
    '',
    'Options for install:',
    '  --global            Install into ~/.agents/skills/coaia-narrative',
    '  --yes, -y           Also create the .claude/skills/coaia-narrative symlink',
    '  --force, -f         Replace existing install or symlink',
  ].join('\n'));
}

export async function handleSkillCommand(args: minimist.ParsedArgs): Promise<void> {
  const subcommand = String(args._[1] || '');

  if (args.help || args.h || subcommand === 'help') {
    showSkillCommandHelp();
    return;
  }

  if (!subcommand) {
    showSkillCommandHelp();
    return;
  }

  if (subcommand === 'show') {
    showCoaiaNarrativeSkill();
    return;
  }

  if (subcommand === 'install') {
    await installSkill(Boolean(args.global), Boolean(args.force || args.f), Boolean(args.yes || args.y));
    return;
  }

  throw new Error(`Unknown skill command: ${subcommand}`);
}
