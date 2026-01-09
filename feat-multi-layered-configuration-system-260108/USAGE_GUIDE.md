# Quick Usage Guide - Multi-Layered Configuration System

## Getting Started in 3 Minutes

### Option 1: Use Environment Variables (Recommended)

```bash
# Create .env in your project directory
cat > .env << 'EOF'
COAIAN_MF=/path/to/your/charts.jsonl
COAIAN_CURRENT_CHART=chart_your_main_chart
EOF

# Now use CLI without any flags!
cnarrative ls                    # List all charts
cnarrative v chart_123           # View specific chart
cnarrative st                    # Show statistics
```

### Option 2: Use Custom Environment File

```bash
# Create env file anywhere
cat > ~/my-project.env << 'EOF'
COAIAN_MF=/home/user/data/charts.jsonl
COAIAN_CURRENT_CHART=chart_project1
EOF

# Use with --env flag
cnarrative --env ~/my-project.env ls
cnarrative --env ~/my-project.env v chart_123
```

### Option 3: Use CLI Flags (Classic)

```bash
# Specify everything on command line
cnarrative ls -M /path/to/charts.jsonl
cnarrative v chart_123 -M /path/to/charts.jsonl
```

## All Available Commands

### Short Aliases Cheat Sheet

| Full Command | Short Alias | Description |
|-------------|-------------|-------------|
| `list` | `ls` | List all charts |
| `view <id>` | `v <id>` | View chart details |
| `current [id]` | `cur [id]` | Get/set current chart |
| `stats` | `st` | Show statistics |
| `progress <id>` | `pg <id>` | Show chart progress |
| `help` | `h` | Show help |
| `version` | `ver` | Show version |
| `update <id>` | `up <id>` | Update chart* |
| `add-action <id>` | `aa <id>` | Add action* |
| `add-observation <id>` | `ao <id>` | Add observation* |
| `complete <name>` | `done <name>` | Mark complete ✅ |
| `set-date <id> <date>` | `sd <id> <date>` | Set due date ✅ |

*Placeholder commands - use MCP tools for now

### Flag Aliases

| Full Flag | Short | Description |
|-----------|-------|-------------|
| `--memory-path <path>` | `-M <path>` | Memory file path |
| `--current-chart <id>` | `-C <id>` | Current chart ID |
| `--env <path>` | N/A | Load env file |
| `--json` | N/A | JSON output |
| `--no-color` | N/A | Disable colors |

## Real-World Examples

### Development Workflow

```bash
# Setup once
echo "COAIAN_MF=./dev-charts.jsonl" > .env

# Daily usage
cnarrative ls                              # Quick view of all charts
cnarrative v chart_feature_123            # Deep dive into feature chart
cnarrative pg chart_feature_123           # Check progress
cnarrative done chart_feature_123_action_1 # Mark action complete
cnarrative st                              # Overall statistics
```

### Multi-Project Setup

```bash
# Project 1
cat > ~/project1.env << EOF
COAIAN_MF=/srv/project1/charts.jsonl
COAIAN_CURRENT_CHART=chart_project1_main
EOF

# Project 2
cat > ~/project2.env << EOF
COAIAN_MF=/srv/project2/charts.jsonl
COAIAN_CURRENT_CHART=chart_project2_main
EOF

# Switch between projects easily
cnarrative --env ~/project1.env ls
cnarrative --env ~/project2.env ls

# Or use aliases
alias cn1='cnarrative --env ~/project1.env'
alias cn2='cnarrative --env ~/project2.env'

cn1 ls
cn2 ls
```

### Production Environment

```bash
# Set system-wide environment variables
export COAIAN_MF=/srv/production/charts.jsonl
export COAIAN_CURRENT_CHART=chart_production_main

# Add to ~/.bashrc or ~/.zshrc for persistence
echo 'export COAIAN_MF=/srv/production/charts.jsonl' >> ~/.bashrc

# Use anywhere without flags
cd /any/directory
cnarrative ls
cnarrative st
```

## Configuration Priority Examples

### Example: Override System Env with Local .env

```bash
# System has this
export COAIAN_MF=/srv/system/charts.jsonl

# Your project has this
echo "COAIAN_MF=./local-charts.jsonl" > .env

# Running from project directory uses local .env
cnarrative ls  # Uses ./local-charts.jsonl (local .env wins)
```

### Example: Override Everything with CLI Flag

```bash
# System env + local .env both set
export COAIAN_MF=/srv/system/charts.jsonl
echo "COAIAN_MF=./local-charts.jsonl" > .env

# CLI flag overrides everything
cnarrative ls -M /tmp/test.jsonl  # Uses /tmp/test.jsonl (CLI flag wins)
```

### Example: Custom Env File Overrides Local .env

```bash
# Local .env exists
echo "COAIAN_MF=./local.jsonl" > .env

# Custom env file
echo "COAIAN_MF=/custom/charts.jsonl" > /tmp/custom.env

# Custom env via --env wins over local .env
cnarrative --env /tmp/custom.env ls  # Uses /custom/charts.jsonl
```

## Tips & Tricks

### Tip 1: Project-Specific Configuration
Keep `.env` in your project root and add to `.gitignore`:
```bash
echo ".env" >> .gitignore
echo "COAIAN_MF=./project-charts.jsonl" > .env
```

### Tip 2: Team Shared Configuration
Commit `.env.example` with your project:
```bash
cat > .env.example << 'EOF'
# Copy this to .env and customize
COAIAN_MF=./charts.jsonl
COAIAN_CURRENT_CHART=chart_main
EOF
```

### Tip 3: Quick Chart Switching
```bash
export COAIAN_CURRENT_CHART=chart_feature_x
cnarrative cur  # Shows: chart_feature_x

export COAIAN_CURRENT_CHART=chart_feature_y
cnarrative cur  # Shows: chart_feature_y
```

### Tip 4: JSON Output for Scripts
```bash
# Get stats as JSON for processing
cnarrative st --json | jq '.overallProgress'

# Pipe to other tools
cnarrative st --json | python process_stats.py
```

## Troubleshooting

### Problem: Commands not finding charts
```bash
# Check what config is being used
cnarrative ls  # Error shows which file it tried to open

# Set explicitly
cnarrative ls -M /correct/path/to/charts.jsonl
```

### Problem: Environment variables not loading
```bash
# Check if .env exists
ls -la .env

# Manually load and test
source .env
echo $COAIAN_MF

# Try with explicit env file
cnarrative --env ./.env ls
```

### Problem: Wrong priority order
Remember the order:
1. CLI flags (always wins)
2. --env custom file
3. ./.env in current directory
4. System environment variables
5. Defaults

## Next Steps

1. Create your .env file
2. Try the short aliases (`ls`, `v`, `st`)
3. Mark some actions complete with `done`
4. Set due dates with `sd`
5. Explore the help with `h`

Enjoy your streamlined CLI experience! 🚀
