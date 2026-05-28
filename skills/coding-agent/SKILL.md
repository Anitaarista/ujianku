---
name: coding-agent
slug: code
version: 1.0.4
homepage: https://clawic.com/skills/code
description: Coding workflow with planning, implementation, verification, and testing for clean software development.
changelog: Improved description for better discoverability
metadata: {"clawdbot":{"emoji":"💻","requires":{"bins":[]},"os":["linux","darwin","win32"]}}
---

## When to Use

User explicitly requests code implementation. Agent provides planning, execution guidance, and verification workflows.

## Architecture

User preferences stored in `~/code/` when user explicitly requests.

```
~/code/
  - memory.md    # User-provided preferences only
```

Create on first use: `mkdir -p ~/code`

## Quick Reference

| Topic | File |
|-------|------|
| Memory setup | `memory-template.md` |
| Task breakdown | `planning.md` |
| Execution flow | `execution.md` |
| Verification | `verification.md` |
| Multi-task state | `state.md` |
| User criteria | `criteria.md` |

## Scope

This skill ONLY:
- Provides coding workflow guidance
- Stores preferences user explicitly provides in `~/code/`
- Reads included reference files

This skill NEVER:
- Executes code automatically
- Makes network requests
- Accesses files outside `~/code/` and the user's project
- Modifies its own SKILL.md or auxiliary files
- Takes autonomous action without user awareness

## Core Rules

### 1. Check Memory First
Read `~/code/memory.md` for user's stated preferences if it exists.

### 2. User Controls Execution
- This skill provides GUIDANCE, not autonomous execution
- User decides when to proceed to next step
- Sub-agent delegation requires user's explicit request

### 3. Plan Before Code
- Break requests into testable steps
- Each step independently verifiable
- See `planning.md` for patterns

### 4. Verify Everything
| After | Do |
|-------|-----|
| Each function | Suggest running tests |
| UI changes | Suggest taking screenshot |
| Before delivery | Suggest full test suite |

### 5. Store Preferences on Request
| User says | Action |
|-----------|--------|
| "Remember I prefer X" | Add to memory.md |
| "Never do Y again" | Add to memory.md Never section |

Only store what user explicitly asks to save.

## Workflow

```
Request -> Plan -> Execute -> Verify -> Deliver
```

## Integrated Reference Library (from antigravity-fullstack-hq)

### Skills References (`references/`)

| Topic | File | Description |
|-------|------|-------------|
| Brainstorming | `references/brainstorming.md` | Six Thinking Hats, HMW, Pre-Mortem, RICE |
| Prompt Engineering | `references/prompt-engineering.md` | LLM prompt design, chain-of-thought, few-shot |
| Software Architecture | `references/software-architecture.md` | Clean Architecture, SOLID, DDD, CQRS |
| TDD | `references/test-driven-development.md` | Red-Green-Refactor, Vitest, mocking |
| Webapp Testing | `references/webapp-testing.md` | Playwright, RTL, MSW, E2E patterns |
| Code Review | `references/code-review-patterns.md` | PR review flow, priority system, feedback |
| Systematic Debugging | `references/systematic-debugging.md` | Scientific method, stack traces, isolation |

### Agent Roles (`references/agents/`)

| Agent | Specialization |
|-------|---------------|
| Architect | System design, scalability, ADRs |
| Backend Specialist | NestJS, API design, Prisma |
| Code Reviewer | Quality, maintainability, patterns |
| Database Specialist | PostgreSQL, Prisma, migrations |
| DevOps Engineer | CI/CD, Docker, deployment |
| Documentation Writer | READMEs, API docs, guides |
| Frontend Specialist | React, Next.js, TypeScript |
| Performance Optimizer | Core Web Vitals, caching, optimization |
| Security Auditor | OWASP, input validation, auth |
| Test Engineer | TDD, coverage, E2E |

### Workflows (`references/workflows/`)

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| Brainstorm | `/brainstorm` | Explore ideas before committing |
| Create | `/create` | Build new features from scratch |
| Debug | `/debug` | Systematic bug investigation |
| Enhance | `/enhance` | Refactor, optimize, cleanup |
| Orchestrate | `/orchestrate` | Multi-agent coordination |
| Plan | `/plan` | Task breakdown, implementation plan |
| Preview | `/preview` | Pre-commit review checklist |
| Status | `/status` | Progress checkpoint |
| Test | `/test` | Generate and organize tests |
| UI/UX Pro Max | `/ui-ux-pro-max` | Design-focused UI improvements |

---

## Common Traps

- **Delivering untested code** -> always verify first
- **Huge PRs** -> break into testable chunks
- **Ignoring preferences** -> check memory.md first

## Self-Modification

This skill NEVER modifies its own SKILL.md or auxiliary files.
User data stored only in `~/code/memory.md` after explicit request.

## External Endpoints

This skill makes NO network requests.

| Endpoint | Data Sent | Purpose |
|----------|-----------|---------|
| None | None | N/A |

## Security & Privacy

**Data that stays local:**
- Only preferences user explicitly asks to save
- Stored in `~/code/memory.md`

**Data that leaves your machine:**
- None. This skill makes no network requests.

**This skill does NOT:**
- Execute code automatically
- Access network or external services  
- Access files outside `~/code/` and user's project
- Take autonomous actions without user awareness
- Delegate to sub-agents without user's explicit request
