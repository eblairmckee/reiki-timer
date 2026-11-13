# Status and feedback

## Name the state, show the date. What's known clearly shown

Make current state and action results understandable. Distinguish loading, unavailable/failed data and genuine zero values. Show freshness/date when it affects interpretation; a timer needs clear running/paused/completed state, not an arbitrary timestamp. Pair state cues with meaning beyond color.

## Explain the wait, guide the way

Use loading feedback appropriate to the delay; skeletons can preview structure when useful. Empty states explain why and offer a relevant next step. Errors preserve useful input and expose recovery; avoid implying success before an action completes.

Review loading → content, empty → next step, and failure → retry only where the contract supports them. Inspect layout stability and discoverability of feedback. Use [interaction evidence](../../interaction-evidence/SKILL.md) for pending actions, errors, focus and announcements.
