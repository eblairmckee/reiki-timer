# Layout and content resilience

Prefer CSS flexbox, grid, and intrinsic sizing for layout. Use JavaScript measurement when the behavior requires it, keeping DOM reads outside rendering and batching reads before writes.

Choose pagination, virtualization, or content visibility when the list or rendering cost warrants it. Preserve keyboard navigation, focus, and access to the content; base the choice on measured cost and actual interaction needs.

Preserve intentional scrolling for tables, code, and other content that needs it. Keep page content usable with resized text, zoom, and dynamic viewport changes.

Use safe-area insets when full-bleed or fixed controls reach viewport edges. Keep content and interaction targets clear of device cutouts and mobile browser chrome.

