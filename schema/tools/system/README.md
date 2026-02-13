# System Tools

This directory contains meta-tools that configure and initialize the COAIA system behavior.

## 📋 Tools in This Directory

**[init_llm_guidance.json](init_llm_guidance.json)** / **[.yaml](init_llm_guidance.yaml)**
- Initialize LLM with creative orientation guidance
- Loads comprehensive prompts about structural tension methodology
- Provides context on advancing vs oscillating patterns
- Teaches creative orientation language
- Returns guidance text for LLM context window

## 🎯 Purpose

The `init_llm_guidance` tool provides Language Models with deep context about:

**Creative Orientation:**
- Focus on creation (not problem-solving)
- Structural tension = desired outcome + current reality
- Advancing patterns vs oscillating patterns
- Creative language vs problem-solving language

**Methodology:**
- Robert Fritz's structural tension framework
- Three phases of creative process (germination, assimilation, completion)
- How structural tension naturally seeks resolution
- Why honest current reality assessment matters

**System Usage:**
- How to create effective charts
- When to use which tools
- Common patterns and anti-patterns
- Best practices for chart creation

## 🚀 Usage

This tool is typically called once at the start of an LLM session to provide foundational context:

```javascript
// No parameters required
{}

// Returns comprehensive guidance text
{
  "guidance": "🧠 COAIA Creative Orientation Guidance\n\n..."
}
```

The returned text is designed to be added to the LLM's system prompt or context window.

## 📖 What's Included in Guidance

### Core Concepts

**Structural Tension:**
```
The productive gap between:
- WHERE YOU ARE (current reality)
- WHERE YOU WANT TO BE (desired outcome)

This tension naturally seeks resolution through the path of least resistance.
```

**Advancing Patterns:**
```
Creation → Success → More Creation
- Completed actions flow into current reality
- Reality changes create new tension
- Momentum builds naturally
- System advances toward desired outcome
```

**Oscillating Patterns:**
```
Problem → Solution → New Problem → New Solution...
- Focus on "fixing" or "avoiding"
- Reality seen as "what's wrong"
- Actions as "fixes"
- No structural change → oscillation continues
```

### Language Patterns

**Creative Orientation (Use):**
- "I want to create..."
- "My desired outcome is..."
- "Current reality is..."
- "Action steps that advance toward..."

**Problem Orientation (Avoid):**
- "I need to fix..."
- "The problem is..."
- "I want to stop/avoid..."
- "Actions to prevent..."

### Tool Usage Guidance

**Creating Charts:**
- Start with clear desired outcome
- Honest current reality assessment
- Strategic action steps (not fixes)
- Due dates for momentum

**Advancing Work:**
- Complete actions
- Observations flow to reality
- Reality changes → new tension
- Continue advancing

**Maintaining Integrity:**
- Don't oscillate (problem → solution → problem)
- Stay in creative orientation
- Honest assessments (not optimistic or pessimistic)
- Strategic choices (not reactive fixes)

## 🎨 Integration with Other Tools

`init_llm_guidance` provides the **philosophical foundation** for using all other COAIA tools effectively:

**STC Tools:**
- How to create charts with proper creative orientation
- Why current reality observations matter
- How completing actions creates advancement

**Narrative Tools:**
- Capturing the story of creative work
- Lessons from the journey
- Dramatic structure of creation

**KG Tools:**
- How traditional graph tools support STC
- When to use low-level operations
- Integration patterns

## 🔧 Technical Details

**Returns:**
- Comprehensive guidance text (multi-line string)
- Markdown formatted for readability
- Includes examples and anti-patterns
- Typically 2000-4000 tokens

**Best Practices:**
- Call once at session start
- Add to system prompt or initial context
- Refresh if LLM seems to forget creative orientation
- Use as reference when coaching users

## 🎯 Tool Group: SYSTEM_TOOLS

Not part of a tool group by default, but can be enabled:

```bash
# Enable explicitly
COAIA_TOOLS="STC_TOOLS,init_llm_guidance" npx coaia-memory

# Included in default configuration
# (check index.ts TOOL_GROUPS for current defaults)
```

## 🌟 Why This Matters

Language models are primarily trained on problem-solving patterns because that's most of the training data. Creative orientation is **fundamentally different** and requires explicit guidance.

**Without guidance:**
- LLM creates problem-focused "outcomes"
- Current reality becomes "what's wrong"
- Actions become "fixes" or "solutions"
- Charts oscillate rather than advance

**With guidance:**
- LLM helps users articulate what they want to create
- Current reality is honest assessment
- Actions are strategic choices
- Charts create advancing patterns

## 📚 Philosophical Background

Based on **Robert Fritz's** work:
- "The Path of Least Resistance" (1984)
- "Creating" (1991)
- Structural Tension methodology
- Creative vs reactive orientation

**Key Insight:**
Structure determines behavior. By organizing around structural tension (outcome + reality), the system naturally forms advancing patterns rather than oscillating patterns.

## 🔗 Related Documentation

- **[../stc/README.md](../stc/README.md)** - How guidance applies to STC tools
- **[../../README.md](../../README.md)** - Schema overview
- **Main README:** `/README.md` - Project philosophy
- **LLM Guidance:** `/llms/*.txt` - Detailed creative orientation texts

## 💡 Advanced Usage

### Custom Guidance

You can extend or customize guidance by:
1. Modifying the `LLM_GUIDANCE` constant in `generated-llm-guidance.ts`
2. Adding domain-specific creative orientation patterns
3. Including project-specific examples

### Session Refresh

If an LLM conversation seems to drift into problem-solving:
1. Call `init_llm_guidance` again
2. Explicitly reference the guidance
3. Ask LLM to reformulate in creative orientation

### Teaching Tool

Use the guidance text to:
- Teach users about creative methodology
- Explain why charts are structured this way
- Show the difference between creation and problem-solving
- Provide examples of advancing patterns

---

**Remember:** This tool provides the **why** behind the system. Understanding creative orientation makes all other tools more effective.
