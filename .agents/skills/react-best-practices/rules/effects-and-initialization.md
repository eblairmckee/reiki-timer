# Effects and initialization patterns

Match these patterns to the installed React version, lifecycle contract, and actual external synchronization needs. Preserve dependencies and cleanup.

## Do Not Put Effect Events in Dependency Arrays

When the installed React version supports `useEffectEvent`, use it for an event within an Effect that needs the latest committed values without changing the synchronization inputs. Keep it local to that Effect's component or custom Hook. Its function identity is intentionally unstable and belongs outside the dependency array; reactive inputs still belong in the array. Call it from the Effect or a callback established by that Effect.

**Incorrect (Effect Event added as a dependency):**

```tsx
import { useEffect, useEffectEvent } from 'react'

function ChatRoom({ roomId, onConnected }: {
  roomId: string
  onConnected: () => void
}) {
  const handleConnected = useEffectEvent(onConnected)

  useEffect(() => {
    const connection = createConnection(roomId)
    connection.on('connected', handleConnected)
    connection.connect()

    return () => connection.disconnect()
  }, [roomId, handleConnected])
}
```

Including the Effect Event in dependencies makes the effect re-run every render and triggers the React Hooks lint rule.

**Correct (depend on reactive values, not the Effect Event):**

```tsx
import { useEffect, useEffectEvent } from 'react'

function ChatRoom({ roomId, onConnected }: {
  roomId: string
  onConnected: () => void
}) {
  const handleConnected = useEffectEvent(onConnected)

  useEffect(() => {
    const connection = createConnection(roomId)
    connection.on('connected', handleConnected)
    connection.connect()

    return () => connection.disconnect()
  }, [roomId])
}
```

Reference: [React useEffectEvent: Effect Event in deps](https://react.dev/reference/react/useEffectEvent#effect-event-in-deps)

## Store Event Handlers in Refs

For versions without the required Effect Event API, store callbacks in refs when callback changes should not restart a subscription. Keep the subscription's reactive inputs in its dependencies and update the ref after commit. Use the [Effect Event contract](#do-not-put-effect-events-in-dependency-arrays) when that API is available.

**Incorrect (re-subscribes on every render):**

```tsx
function useWindowEvent(event: string, handler: (e) => void) {
  useEffect(() => {
    window.addEventListener(event, handler)
    return () => window.removeEventListener(event, handler)
  }, [event, handler])
}
```

**Correct (stable subscription):**

```tsx
function useWindowEvent(event: string, handler: (e) => void) {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const listener = (e) => handlerRef.current(e)
    window.addEventListener(event, listener)
    return () => window.removeEventListener(event, listener)
  }, [event])
}
```

## Initialize App Once, Not Per Mount

For initialization that must run once per browser app load, use that app's client entrypoint or a browser-scoped guard. Components can remount, so `useEffect([])` alone does not establish that lifetime. Keep browser-only work out of server execution, and keep request or user state within the [server isolation contract](server.md#avoid-shared-module-state-for-request-data).

**Incorrect (runs twice in dev, re-runs on remount):**

```tsx
function Comp() {
  useEffect(() => {
    loadFromStorage()
    checkAuthToken()
  }, [])

  // ...
}
```

**Correct (once per app load):**

```tsx
let didInit = false

function Comp() {
  useEffect(() => {
    if (didInit) return
    didInit = true
    loadFromStorage()
    checkAuthToken()
  }, [])

  // ...
}
```

Reference: [Initializing the application](https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application)
