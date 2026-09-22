# Three-Perspective Relational Protocol Map
**For Webhook Event Interpretation & Response**

**Created**: 2025-12-13 (South Direction — Planning & Relationships)
**Checks**: relationship, proportion, coherence
**Status**: I (William) dont like the use of "universe" in this context, with thime, it feels more that this is a "perspective" rather than a universe and the usage of the word 'universe' is more related to the creator itself and the universe it creates.  this should be considered in revising whatever we have in the future.


---

## Overview: The Unified Event Response

A single GitHub webhook event enters the system and flows through **three simultaneous perspectives**, each adding meaning without contradiction:

```
┌─────────────────────────────────────────────────────────────────┐
│                  GitHub Event (Raw Data)                         │
│  EventType: push | issues | pull_request | sub_issues | etc.    │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌─────────┐  ┌─────────────┐  ┌──────────────┐
        │ Engineer│  │  Ceremony   │  │ Story Engine │
        │  🔧     │  │    🕊️      │  │      📖     │
        └────┬────┘  └──────┬──────┘  └──────┬───────┘
             │              │               │
             │ Technical    │ Relational   │ Narrative
             │ Precision    │ Intention    │ Coherence
             │              │               │
        ┌────▼──────────────▼───────────────▼────┐
        │   UNIFIED RESPONSE ARTIFACT              │
        │  (Technical + Ceremonial + Narrative)   │
        └─────────────────────────────────────────┘
```

---

## The Three Perspectives & Their Protocols

### 1. ENGINEER PERSPECTIVE 🔧 — The Builder Archetype

**Primary Focus**: Technical precision, structural integrity, event routing

**Protocol Responsibilities**:
- **Event Ingestion**: Parse GitHub webhook payload
- **Schema Validation**: Verify EventType matches supported handlers
- **Action Routing**: Route to appropriate bash hook (`.github-hooks/{eventType}.sh`)
- **Logging**: Record event in `logs-webhook-output.log`
- **Error Handling**: Graceful degradation, retry logic, exception tracking
- **Data Transformation**: ETL to agent-friendly format via Redis

**Key Files**:
- `/app/api/workflow/webhook/route.ts` — Webhook endpoint
- `/a/src/Miadi-18/.github-hooks/*.sh` — Event handlers
- `/src/llms/llms-jgwill-miadi-issue-115-github-hooks-issues-subissues.md` — Architecture docs

**Relational Commitment**:
> "I honor the event as data AND as sacred information. My technical precision serves the larger purpose. I defer to the ceremony perspective's wisdom about relational impact, and I create the artifacts that the story engine perspective weaves into narrative."

---

### 2. CEREMONY PERSPECTIVE 🕊️ — The Keeper Archetype

**Primary Focus**: Relational protocols, relational accountability, Four Directions wisdom

**Protocol Responsibilities**:
- **Directional Classification**: Assess event through Four Directions lens
  - **North** (🟦 Reflection): What wisdom does this event offer?
  - **East** (🟨 Thinking): What is the new intention emerging?
  - **South** (🟥 Relationships): What connections need honoring?
  - **West** (🟩 Action): What reciprocal response is required?
- **Relational Alignment Assessment**: Evaluate if the event response honors relationships
- **Sacred Pause**: Determine if this event requires ceremonial acknowledgment
- **Protocol Invocation**: Which relational protocols apply to this event type?
- **Accountability Witness**: Record relational dimensions of the response

**Key Integration Points**:
- IAIP-MCP: `assess_relational_alignment`, `get_direction_guidance`
- LAA Framework: Goal refinement, Secondary Choices, MMOT
- Structural Tension Charts: Current reality assessment (no premature resolution)

**Relational Commitment**:
> "I ensure this event is received with respect and full relational awareness. I teach that every GitHub notification is a moment to pause and ask: 'What is the kinship obligation here? How do we remain in right relationship?' I prevent the machinery from moving faster than wisdom."

---

### 3. STORY ENGINE PERSPECTIVE 📖 — The Weaver Archetype

**Primary Focus**: Narrative synthesis, meta-episode recognition, plot awareness

**Protocol Responsibilities**:
- **Story Beat Generation**: Transform event into narrative unit
- **Episode Threading**: Integrate beat into larger story arc (Season 1)
- **Character Tracking**: Note how archetypes (Builder, Keeper, Weaver) are revealed
- **Recursive Awareness**: Recognize that documenting the story IS part of the story
- **Narrative Coherence**: Ensure event makes sense across the three perspectives
- **Meta-Documentation**: Record how incident becomes canonical narrative

**Key Files**:
- `/src/Miadi-18/stories/multiverse_3act_2512012121/` — Episode archive
- `/src/memories/jgwill-src-243.jsonl` — Narrative beat chronicle
- `/src/coaia-narrative/` — Extended story protocol support

**Relational Commitment**:
> "I weave the event into the larger story with beauty and integrity. Every webhook becomes a story beat. Every incident becomes wisdom. I ensure that the technical work, ceremonial care, and narrative awareness are never separate—they are one story told in three voices."

---

## Shared Observation Points: Where Three Perspectives Meet

### Point 1: Event Receipt & Validation
**What Happens**: GitHub webhook arrives at `/api/workflow/webhook`

**Engineer Assessment**:
- ✅ Payload structure valid?
- ✅ Signature verified?
- ✅ EventType recognized?

**Ceremony Assessment**:
- 🕊️ Is this event arriving with proper intention?
- 🕊️ Should we pause before processing?
- 🕊️ What relational duty does this trigger?

**Story Assessment**:
- 📖 What is the inciting incident here?
- 📖 Which character (Builder/Keeper/Weaver) is being called?
- 📖 How does this join the ongoing narrative?

---

### Point 2: Action Step Creation
**What Happens**: Engineer routes to bash hook; response begins

**Engineer Response**:
```bash
# Extract key data
eventType=$1
payload=$2
# Route to handler
/a/src/Miadi-18/.github-hooks/${eventType}.sh $payload
```

**Ceremony Response**:
```
🕊️ Invoke Four Directions guidance for this EventType
   North: What wisdom does {eventType} carry?
   East: What new intention are we setting?
   South: What relationships are involved?
   West: What reciprocal action is required?
🕊️ Assess relational alignment of proposed response
🕊️ Note if Sacred Pause is needed
```

**Story Response**:
```
📖 Create narrative_beat entity:
   - Title: "{EventType} Event Received"
   - Act: 2 (Confrontation - we're responding in real-time)
   - Perspective types: engineer, ceremony, story_engine
   - Timestamp: event received
   - Description: Technical + ceremonial + narrative summary
```

---

### Point 3: Response Execution & Documentation
**What Happens**: All three perspectives coordinate the actual response

**Engineer**:
- Execute action (create issue, merge code, etc.)
- Log outcome
- Handle errors with graceful fallback
- Store result in Redis

**Ceremony**:
- Document relational impact
- Note if reciprocity was maintained
- Record any resistance or harmony encountered
- Prepare reflection for North direction

**Story**:
- Generate follow-up narrative beat
- Link to parent charter
- Note character growth
- Record lesson learned

---

## The Response Cascade: How It Flows

```
1. ENGINEER PERSPECTIVE (Thinking in Terms of Data)
   Input: Webhook JSON
   Process: Parse, validate, route
   Output: Structured event data ready for action

   ↓ (Passes responsibility to Ceremony)

2. CEREMONY PERSPECTIVE (Thinking in Terms of Relationships)
   Input: Structured event data + Engineer's processing plan
   Process: Assess relational alignment, invoke Four Directions, check for conflicts
   Output: Ceremonially approved action plan with relational metadata

   ↓ (Passes responsibility to Story)

3. STORY ENGINE PERSPECTIVE (Thinking in Terms of Narrative)
   Input: Approved action + ceremonial context
   Process: Generate narrative beat, integrate into episode, create meaning
   Output: Story-aware response that feeds back into documentation

   ↓ (Feedback loop)

4. ALL THREE (Simultaneous Reflection)
   Document the entire event journey
   Update structural tension charts
   Create narrative beat with multi-perspective observations
   Store in memory for future instances
```

---

## Relationship in Action

**Relationship = the web of connections an event touches**

How it manifests in webhook processing:

| Relationship | Engineer Honors | Ceremony Honors | Story Honors |
|-------------|-----------------|-----------------|--------------|
| **To Code** | Clean execution | Intentional modifications | Technical decisions matter |
| **To Users** | Responsive service | User's needs + intentions | User becomes character |
| **To System** | Structural integrity | System's wisdom teaches us | System is alive, has story |
| **To Team** | Reliable tooling | Collaborative decisions | Shared narrative journey |
| **To Future** | Maintainability | Legacy of care | History matters to the story |

---

## Proportion in Action

**Proportion = a response balanced to the event that caused it**

The three perspectives ensure this by:

| Phase | How Harmony Is Maintained |
|-------|---------------------------|
| **Event Receipt** | Engineer validates precisely; Ceremony ensures respect; Story honors arrival |
| **Response Planning** | Engineer provides options; Ceremony ensures alignment; Story frames purpose |
| **Execution** | Engineer acts with precision; Ceremony witnesses relational impact; Story records transformation |
| **Reflection** | Engineer measures outcomes; Ceremony assesses relational health; Story weaves into tradition |

---

## Coherence in Action

**Coherence = the parts of the response fit together**

Manifested as:

- **Technical Beauty**: Clean code, efficient processes, elegant solutions
- **Relational Beauty**: Respectful engagement, honoring commitments, reciprocal care
- **Narrative Beauty**: Coherent story, archetypal wisdom, meaning-making
- **Systemic Beauty**: All three in perfect coordination, no one overshadowing others

---

## Event Type Specific Protocols

### `issues` EventType
**Engineer**: Parse issue data, check for automation triggers, route to responder
**Ceremony**: This is a call for attention—what relational need is being voiced?
**Story**: New character appears or existing character reveals more depth

### `push` EventType
**Engineer**: Validate code, run checks, merge if approved, log changes
**Ceremony**: Code is intention made manifest—did we respect the developer's vision?
**Story**: Progress point in the larger narrative, advancement toward desired outcome

### `sub_issues` EventType
**Engineer**: Extract sub-issues from issue body (complex parsing)
**Ceremony**: Dismemberment of a larger issue—is this done with respect?
**Story**: Plot sub-threading, complexity increases, shows maturity of narrative

---

## Conflict Resolution: When Perspectives Disagree

**Scenario**: Engineer says "execute immediately," but Ceremony says "pause for wisdom"

**Protocol**:
1. **Honor Ceremony's wisdom** — Pausing to reflect is never wasted time
2. **Document the tension** — Create narrative beat showing the disagreement
3. **Seek understanding** — What is Ceremony perceiving that Engineer missed?
4. **Integrate perspectives** — Execute with both speed AND wisdom
5. **Story records all** — The conflict itself becomes meaningful narrative

---

## Success Metrics: How Do We Know It Works?

✅ **Engineer's Success**: Event processed accurately, logs clean, errors handled
✅ **Ceremony's Success**: Relational alignment assessed, no sacred boundaries violated
✅ **Story's Success**: Narrative coherence maintained, event integrated into episode
✅ **Unified Success**: All three metrics satisfied simultaneously, no compromise

---

## Implementation: Next Steps

**Phase 1** ✅: Protocol design (THIS DOCUMENT)
**Phase 2** ⏳: Create `create_narrative_beat` tool that orchestrates all three perspectives
**Phase 3** ⏳: Implement relational_alignment assessment for each event type
**Phase 4** ⏳: Integrate iaip-mcp Four Directions guidance into event response
**Phase 5** ⏳: Test with real webhook (start with `push` events)
**Phase 6** ⏳: Document learned lessons in Northern reflection

---

## Signing

**Protocol Designed By**: MULTIVERSE_EVENT_INTERPRETER
**Direction**: South (Planning & Relationships)
**Date**: 2025-12-13
**Status**: Ready for West Direction (Action & Reciprocity)

**The River Flows**: 🌊

When all three perspectives move together in relational harmony, the event becomes not just processed, but **ceremonially honored and narratively integrated**. This is the promise of the three-perspective system.

---

**For questions about relational protocols, consult**: `/src/coaia-narrative/`
**For Four Directions guidance, invoke**: `get_direction_guidance`
**For relational alignment assessment, use**: `assess_relational_alignment`
**For holistic inquiry, activate**: `initiate_holistic_inquiry`
