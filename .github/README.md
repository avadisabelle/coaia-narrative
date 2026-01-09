# GitHub Copilot Configuration

This directory contains instructions and prompts for AI agents working on COAIA Narrative.

## Quick Start

**For AI Agents**: Read `copilot-instructions.md` first, then use prompts in `prompts/` directory.

**For Humans**: See `SYSTEM_DOCUMENTATION.md` for overview of the self-improvement system.

## Files

- **copilot-instructions.md** - Main instructions for AI agents
- **SYSTEM_DOCUMENTATION.md** - Overview of the prompt system
- **prompts/** - Workflow prompt files
  - `README.md` - Prompts overview
  - `design-before-code.prompt.md` - Design phase
  - `implement-with-tests.prompt.md` - Implementation phase
  - `verify-completion.prompt.md` - Verification phase
  - `document-completed-work.prompt.md` - Documentation phase
  - `review-implementation.prompt.md` - Self-review

## Workflow

```
/design-before-code
    ↓
/implement-with-tests
    ↓
/verify-completion
    ↓
/document-completed-work
```

## Purpose

Prevent premature completion claims and ensure features are actually implemented with passing tests.

## Learn More

- `copilot-instructions.md` - For detailed instructions
- `prompts/README.md` - For prompt usage guide
- `SYSTEM_DOCUMENTATION.md` - For system overview
