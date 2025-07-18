# Design Spec Standards

Design specs are the bridge between the "what" of a user story and the "how" of the technical tasks. They provide a detailed technical plan before implementation begins.

---

## Design Spec File Naming Convention

Design specs are stored within their corresponding user story directory.

**Path:** `work_items/{epic_name}/{story_number}_{kebab-case-title}/01_design-spec.md`

## Design Spec Content Template

```markdown
---
title: '{Design Spec Title}'
project_name: { project_name }
epic_name: { epic_name }
story_id: { story_id }
spec_id: { spec_id }
status: { draft | in-review | approved | deprecated }
date_created: { iso date LA timezone }
date_approved: { iso date LA timezone }
touched: { a star is added here every day that we try to work on this doc }
---

## 1. Objective

{A brief, one-sentence statement describing the goal of this design, directly linked to the user story's goal.}

## 2. Technical Design

{A high-level overview of the proposed solution. This section should describe the new components, services, or modules to be created and how they will interact with existing parts of the system. Diagrams or flowcharts are encouraged if they add clarity.}

## 3. Key Changes

### 3.1. API Contracts
{Details of any new or modified API endpoints. Include request/response formats, and status codes.}

### 3.2. Data Models
{Description of any new or modified database schemas, tables, or data structures.}

### 3.3. Component Responsibilities
{A breakdown of the new or modified frontend and backend components and their specific roles.}

## 4. Alternatives Considered

{A brief summary of other approaches that were considered and why the proposed design was chosen. This is crucial for future context.}

## 5. Out of Scope

{A clear list of what this design does *not* address to prevent scope creep.}
```
