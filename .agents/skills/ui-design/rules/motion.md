# Motion and transitions

Use motion to explain a change in state, location, or relationship. Keep the interface responsive to input while animations run, and let interrupted transitions settle into the latest intended state.

Prefer transform and opacity for frequent motion. Name the properties being transitioned so unrelated changes remain immediate. Set an intentional transform origin; scope SVG transforms to the appropriate element or wrapper when its coordinate system requires it.

Honor `prefers-reduced-motion` with reduced or disabled nonessential movement. Stop decorative autoplay loops under that preference. Automatically moving content lasting more than five seconds alongside other content needs a pause, stop, or hide mechanism unless essential to its purpose.

Use animation APIs supported by the application's installed React, framework, and target browsers. Preserve focus, control operation, and the final state when animation is skipped or interrupted.
