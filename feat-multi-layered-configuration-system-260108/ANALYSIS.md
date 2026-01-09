# Task Decomposition & Analysis

## Core Requirements Breakdown

### 1. Multi-Layered Configuration System
**Priority: CRITICAL - Foundation for all other features**

Configuration resolution order (highest to lowest priority):
1. Command-line flags (e.g., `-M <path>`, `--memory-path <path>`)
2. Custom env file via `--env` flag (e.g., `cnarrative --env /src/.env`)
3. `.env` file in current working directory
4. System environment variables

Key environment variables to support:
- `COAIAN_MF` - Memory file path (JSONL)
- `COAIAN_CURRENT_CHART` - Currently active/viewed chart ID

### 2. Short Command Aliases
**Priority: HIGH - User experience**

Ensure every command and flag has a short version:
- Commands: `list` → `ls`, etc.
- Flags: `--memory-path` → `-M`, etc.

### 3. Implement Missing Commands
**Priority: HIGH - Core functionality**

Currently missing but hinted at:
- `update <chart-id>` - Update chart details
- `view <chart-id>` - View detailed chart information
- Commands for chart manipulation:
  - Add new actions
  - Add observations
  - Update due dates
  - Mark actions complete
  - etc.

### 4. Credits & Attribution Fix
**Priority: MEDIUM - Documentation accuracy**

Update `--help` output:
- Author: Guillaume D.Isabelle
- Credits to: Robert Fritz (Structural Tension principles)
- Fork credits: shaneholloman/mcp-knowledge-graph
- Additional work: MiaDisabelle's mcp-knowledge-graph

### 5. Output Cleanup
**Priority: MEDIUM - User experience**

Remove redundant help hints from `list` command outputs:
```
💡 Use 'cnarrative view <chartId>' to see detailed chart information
💡 Use 'cnarrative help' to see all available commands
```

## Implementation Plan

### Phase 1: Configuration System ✅
- [ ] Install/import dotenv package
- [ ] Create config resolution function
- [ ] Support --env flag for custom env files
- [ ] Implement priority-based config loading
- [ ] Add COAIAN_MF environment variable support
- [ ] Add COAIAN_CURRENT_CHART environment variable support

### Phase 2: Command Aliases ✅
- [ ] Add short aliases for existing commands
- [ ] Add short flags for all options
- [ ] Update help documentation

### Phase 3: New Commands Implementation ✅
- [ ] `view <chart-id>` - Detailed chart view
- [ ] `update <chart-id>` - Update chart properties
- [ ] `add-action <chart-id>` - Add action step
- [ ] `add-observation <chart-id>` - Add observation to current reality
- [ ] `complete <action-name>` - Mark action complete
- [ ] `set-date <chart-id>` - Update due date
- [ ] `current [chart-id]` - Get/set current chart context

### Phase 4: Polish ✅
- [ ] Fix credits in help output
- [ ] Remove redundant hints from list output
- [ ] Test all configuration layers
- [ ] Verify all short aliases work

## Technical Notes

### Configuration Loading Strategy
```typescript
function loadConfig(cliArgs) {
  // 1. Start with defaults
  let config = { memoryPath: './coaia-memory.jsonl', currentChart: null };
  
  // 2. Load system environment
  if (process.env.COAIAN_MF) config.memoryPath = process.env.COAIAN_MF;
  if (process.env.COAIAN_CURRENT_CHART) config.currentChart = process.env.COAIAN_CURRENT_CHART;
  
  // 3. Load .env from cwd
  dotenv.config({ path: '.env' });
  
  // 4. Load custom env file if --env specified
  if (cliArgs.env) dotenv.config({ path: cliArgs.env });
  
  // 5. Override with CLI flags
  if (cliArgs.memoryPath) config.memoryPath = cliArgs.memoryPath;
  
  return config;
}
```

### Command Structure Pattern
Each command should follow:
- Main command name (e.g., `list`)
- Short alias (e.g., `ls`)
- Description
- Arguments/options with short flags
- Action handler

## Success Criteria
- [ ] Can run `cnarrative ls` without flags if COAIAN_MF is set
- [ ] Can run `cnarrative --env /custom/.env ls` to use custom env
- [ ] All commands have short aliases
- [ ] `update` command works as advertised
- [ ] Credits properly attributed in help
- [ ] No redundant hints in list output
- [ ] Current chart context can be set and used
