# Refactoring and Implementation Plan for `cli.ts`

### Introduction

This document contains the specific code changes required to address the structural flaws and incomplete features identified in commit `999a8bb`. The goal is to provide a clear, actionable path to a functional and robust CLI.

--- 

### 1. Correct the `loadConfig` Function

The current `loadConfig` function has a flawed priority hierarchy. It must be replaced entirely with the following implementation, which adheres to the standard `flags > system env > .env` precedence.

**Replace the existing `loadConfig` function with this:**

```typescript
function loadConfig(args: minimist.ParsedArgs): Config {
  // 1. Load .env file from the current working directory.
  // This loads variables into process.env but does NOT overwrite existing ones.
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });

  // 2. If a custom --env path is provided, load it and allow it to OVERRIDE
  // both the variables from the first .env file and any pre-existing system env vars.
  // This gives the --env flag priority over system vars, as per the design analysis.
  // NOTE: This is a specific interpretation. A common alternative is for system vars
  // to always have top priority. This implementation prioritizes the explicit --env flag.
  if (args.env) {
    dotenv.config({ path: args.env, override: true });
  }

  // 3. Construct config, starting with defaults and progressively overriding.
  const config: Config = {
    // Defaults
    memoryPath: path.join(process.cwd(), 'memory.jsonl'),
    currentChart: null,
    jsonOutput: false,
    noColor: false,
    // Environment Variables
    ... (process.env.COAIAN_MF && { memoryPath: process.env.COAIAN_MF }),
    ... (process.env.COAIAN_CURRENT_CHART && { currentChart: process.env.COAIAN_CURRENT_CHART }),
    // CLI Flags (highest priority)
    ... ((args['memory-path'] || args.M) && { memoryPath: args['memory-path'] || args.M }),
    ... ((args['current-chart'] || args.C) && { currentChart: args['current-chart'] || args.C }),
    ... (args.json === true && { jsonOutput: true }),
    ... (args['no-color'] === true && { noColor: true }),
  };

  return config;
}
```

--- 

### 2. Implement Functional Commands

The current editing commands are non-functional stubs. They need to be replaced with logic that can eventually call the MCP server. The following implementations provide the necessary argument handling and a clear placeholder for the actual tool call.

**Note:** These implementations do not perform the final MCP call but provide the complete structure for doing so.

#### `updateChart`

**Replace the `updateChart` stub with this:**
```typescript
async function updateChart(chartId: string, memoryPath: string, args: minimist.ParsedArgs): Promise<void> {
  const newOutcome = args.outcome || args.o;
  const newDueDate = args.date || args.d;

  if (!newOutcome && !newDueDate) {
    console.log(`\n❌ Error: Nothing to update. Provide --outcome or --date.\n`);
    console.log(`Usage: cnarrative up ${chartId} --outcome "New outcome" --date "YYYY-MM-DD"\n`);
    return;
  }
  
  console.log(`\n📝 Preparing to update chart: ${chartId}`);
  if (newOutcome) {
    console.log(`   - New Outcome: "${newOutcome}"`);
    // FUTURE: Call MCP tool 'update_desired_outcome'
    // Example: await mcp.callTool('update_desired_outcome', { chartId, newDesiredOutcome: newOutcome });
  }
  if (newDueDate) {
    console.log(`   - New Due Date: "${newDueDate}"`);
     // FUTURE: Update logic for 'set-date' could be merged here.
  }
  
  console.log('\n⚠️  Full implementation pending MCP integration.');
  console.log('    This is a functional stub demonstrating argument parsing.\n');
}
```

#### `addAction`

**Replace the `addAction` stub with this:**
```typescript
async function addAction(chartId: string, memoryPath: string, args: minimist.ParsedArgs): Promise<void> {
  const title = args.title || args.t;
  const reality = args.reality || args.r;

  if (!title || !reality) {
    console.log(`\n❌ Error: --title and --reality are required.\n`);
    console.log(`Usage: cnarrative aa ${chartId} --title "Action title" --reality "Current reality for this action"\n`);
    return;
  }
  
  console.log(`\n⚡ Preparing to add action to chart: ${chartId}`);
  console.log(`   - Title: "${title}"`);
  console.log(`   - Current Reality: "${reality}"`);
  
  // FUTURE: Call MCP tool 'manage_action_step'
  // Example: await mcp.callTool('manage_action_step', { parentReference: chartId, actionDescription: title, currentReality: reality });
  
  console.log('\n⚠️  Full implementation pending MCP integration.');
  console.log('    This is a functional stub demonstrating argument parsing.\n');
}
```

#### `addObservation`

**Replace the `addObservation` stub with this:**
```typescript
async function addObservation(chartId: string, memoryPath: string, args: minimist.ParsedArgs): Promise<void> {
  const observation = args._[2]; // e.g., cnarrative ao <id> "This happened"

  if (!observation) {
    console.log(`\n❌ Error: Observation text is required.\n`);
    console.log(`Usage: cnarrative ao ${chartId} "Your new observation text"\n`);
    return;
  }
  
  console.log(`\n🔍 Preparing to add observation to chart: ${chartId}`);
  console.log(`   - Observation: "${observation}"`);
  
  // FUTURE: Call MCP tool 'update_current_reality'
  // Example: await mcp.callTool('update_current_reality', { chartId, newObservations: [observation] });

  console.log('\n⚠️  Full implementation pending MCP integration.');
  console.log('    This is a functional stub demonstrating argument parsing.\n');
}
```
