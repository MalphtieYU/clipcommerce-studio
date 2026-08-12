# Skill-first adoption

ClipCommerce is now best used as an **optional agent skill**, not as a dashboard that every team must populate or operate. The local workspace remains available as a companion for teams that want structured imports and records, but it is not required for skill use.

## What the skill does

The `adaptive-work-improvement` skill helps an existing agent:

- understand the team’s immediate goal and authorized context;
- identify what is already working, what is unknown, and what could improve;
- suggest small, reversible tests instead of replacing the team’s workflow;
- learn from user-supplied outcomes only after the user approves the lesson;
- retain the team’s own agent, project, permissions, and decision authority.

It does not run in the background, collect data silently, modify other projects, overwrite prompts, or claim to update another agent. “Continuous improvement” means a user-approved feedback loop, not uncontrolled autonomous behavior.

## Get the skill from GitHub

```powershell
git clone https://github.com/MalphtieYU/clipcommerce-studio.git
```

Point a Codex-compatible agent or local plugin installation at:

```text
clipcommerce-studio/plugins/clipcommerce-analyst
```

The skill is located at:

```text
plugins/clipcommerce-analyst/skills/adaptive-work-improvement
```

If the host agent uses another plugin/skill installation method, keep its existing configuration and add this skill as an optional capability. Do not replace its system prompt or existing skills.

## Safe starter prompt

```text
Use $adaptive-work-improvement as an optional improvement layer for my current work.

Do not change, interrupt, replace, or reconfigure my existing agent, project, workflow, files, schedules, tools, permissions, or external systems. Work in Observe mode first.

My current goal: [write the goal]
Existing work that must remain stable: [write it, or say unknown]
Authorized information you may use: [write it, or say only this conversation]
Constraints: [write them, or say keep all changes advisory]

First tell me what you understand, what evidence is available, what is missing, and the smallest useful improvement opportunity. Separate facts from hypotheses. Do not require a dashboard or additional uploads unless they are genuinely necessary. Give suggestions only; wait for my explicit confirmation before changing anything.
```

## When teams are ready to learn

After a team tries a suggestion, provide the observed outcome and ask the skill to use Learn mode. It should compare the intended change with the observed result and propose one concise lesson for approval. Teams may keep that lesson in their existing documents, prompts, or the optional local companion, but only after human review.
