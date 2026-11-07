---
name: react-lifetime
description: Design or change React state ownership and synchronization with subscriptions, asynchronous resources, storage or browser services. Use when update, cleanup, identity or remount behavior matters; ordinary styling and pure calculations do not require it.
---

# React state and lifetime

Find the state owner and the lifetime of the work before choosing a Hook. Use the installed React APIs and the affected public contract. Keep product commands and persistence policy with their feature; shared UI consumes values and actions.

- A value calculable from current props/state usually belongs in render. An action caused by a particular user interaction usually belongs in that action's handler. An Effect synchronizes a committed view with an external system. Do not copy derived values into state or trigger one-shot commands from rendering merely to connect components.
- For each subscription, separate **what changes the connection** (resource key, service identity, enabled state) from **what its callback needs to read now** (latest notification handler or display preference). Preserve reactive dependencies. In supported React versions, an Effect Event can read latest committed values from an Effect-established callback without changing its lifetime; keep it local, call it only from that Effect's work, and do not put it in the dependency list. It is not a way to hide a genuine synchronization input. A committed-ref adapter is an alternative when the installed API or contract calls for it; render-time mutation is not equivalent to observing committed state.
- Mirror setup with cleanup, including partial setup, key changes and remounts. A callback or promise may complete after disposal even when cancellation was requested. Decide which instance/request is allowed to publish results, errors and completion state. Ignore obsolete work and handle rejections. Preserve the stated loading, retained-data and retry behavior; cancellation alone does not establish those semantics.
- Name the intended lifetime: render, mounted instance, resource identity, browser app or explicit operation. An empty dependency array does not mean once per app. Keep user/request state out of process-wide guards. A new instance should not inherit another instance's pending work accidentally.
- Keep one source of truth. Controlled values such as `false`, `0` and `""` are still values; defaults seed uncontrolled state once. Related transitions may benefit from a reducer, but do not introduce a state machine for unrelated flags. Use immutable/functional updates where the transition depends on prior state. For an external store, use React's subscription contract when it fits instead of maintaining a competing copy.

When adapting an external store or service, preserve its method receiver unless the public contract guarantees receiver-independent functions. Invoke through the owning object when needed. A replacement object may share prototype method identities with the previous object; subscription/adaptor identity must still follow the actual store, not just its method functions.

At browser/service boundaries, validate untrusted data as `unknown`, distinguish meaningful missing/invalid/failed states and handle storage failures. Keep persistence minimal and versioned; the feature decides which draft or saved value survives recovery. A type assertion is not runtime validation.

Trace normal changes and adverse ordering: latest values without unwanted reconnection, real key changes, unmount/remount, two instances and out-of-order completion. Use behavioral tests for the applicable cases. Hook lint validates syntax and dependencies, not ownership or asynchronous correctness. Choose actual browser evidence for browser-specific behavior; report what narrower tests cannot establish.
