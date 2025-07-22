# Architecture Decision Record (ADR) Standards

Architecture Decision Records (ADRs) are short text documents that capture a single architectural decision, its context, the options considered, and the consequences. They serve as a historical log of important architectural choices.

---

## ADR File Naming Convention

ADRs are typically stored in the `docs/decisions/` directory.

**Path:** `docs/decisions/{YYYYMMDD}-{kebab-case-decision-title}.md`

- **`YYYYMMDD`**: Date of the decision.
- **`kebab-case-decision-title`**: Concise, hyphenated title describing the decision.

## ADR Content Template

```markdown
---
title: '{ADR Title}'
date: {YYYY-MM-DD}
status: { proposed | accepted | superseded | deprecated }
approved_by: { comma-separated list of names or roles }
dri: { Name or Role of Directly Responsible Individual }
---

# {ADR Title}

## Context
{Describe the forces at play, including the technical, political, and project concerns. What problem are we trying to solve? What are the constraints?}

## Decision
{State the decision clearly and concisely. This is the core of the ADR.}

## Alternatives Considered
{List and briefly describe the alternatives that were considered. For each alternative, explain why it was not chosen.}

## Consequences
{Describe the positive and negative consequences of the decision. What are the implications for the system, team, and future development?}

## Rationale
{Explain *why* this decision was made, referencing the context and consequences. This is the justification for the chosen solution.}

## Status
{Current status of the ADR: proposed, accepted, superseded by [ADR-00X], or deprecated.}

## References
{Links to any related documents, such as design specs, other ADRs, or external resources.}
```
