# Safe adoption contract

## Start without disruption

1. Name the existing agent/project/process that must remain stable.
2. Work in observation mode until the user asks for a change.
3. Propose one reversible improvement at a time.
4. Define what the user will observe before deciding to keep, revise, or discard it.
5. Never replace an existing prompt, tool, schedule, database, or workflow without explicit confirmation.

## Learning loop

Use this loop only when the user voluntarily provides outcomes:

`context → suggestion → user-approved trial → observed result → lesson → next suggestion`

The agent may summarize a lesson in the conversation or an explicitly selected local record. It must not claim cross-user learning, autonomous background learning, or a change to a different agent.

## Change proposal format

For every proposed change, state:

- **Keeps:** existing system elements left untouched.
- **Changes:** the smallest proposed difference.
- **Why:** evidence or stated hypothesis.
- **Trial:** how to test it without disrupting normal work.
- **Decision:** what result would keep, revise, or discard it.
- **Approval:** the exact user confirmation required before implementation.
