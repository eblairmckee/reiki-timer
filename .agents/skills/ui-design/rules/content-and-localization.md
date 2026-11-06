# Interface copy and localization

Use specific action labels and error messages that explain the next useful step. Keep copy consistent with the application’s voice, casing and terminology.

Let a group label supply the shared subject. Under Chimes, label the sound picker “Tone” and name each cue by its event, such as “When chakras change” and “When warm up ends”. Use the requested “End of session” for the main segment boundary. Use “Healing time” for the main duration. Under “Warm up” and “Cool down”, let the parent label identify the revealed dial visually. Name the sliders “Warm up time” and “Cool down time” for assistive technology. Write labels and descriptions in sentence case. Display visible subfield labels with CSS `text-transform: capitalize`, as in “Show Breakdown”. Omit the trailing period in descriptions. Preserve lowercase units and phase names after summary values.

Format dates, times, numbers, and currency with `Intl.DateTimeFormat` and `Intl.NumberFormat`, using the application's locale, time zone, and currency. For server-rendered content, use compatible formatting inputs on the server and client so hydration preserves the initial output.

Prefer the user's explicit locale choice, then the application's supported locale negotiation through request headers or browser language preferences. Keep identifiers and code tokens exact where translation would change their meaning, using `translate="no"` on the relevant content when needed.

Keep loading, empty, and failure copy meaningful. Use consistent loading punctuation and preserve useful information when content is truncated or asynchronously replaced.
