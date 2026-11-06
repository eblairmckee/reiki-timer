# Motion

Keep wells and hit areas stationary. Frosted touch surfaces lift slightly on hover, depress on press and settle with an interruptible shared spring. Ghost secondary actions use restrained text feedback. Crossfade prepainted lighting, animate transforms/opacity, keep blur static and frame updates outside React state.

Dials, switches and primary HUD buttons share a diffuse outline while held and one outward splash on release. The switch outline follows its capsule track; its circular release splash follows the moving thumb. Dial and HUD splashes sit behind their circular surfaces. Cancellation clears pressure without a splash. Reuse the shared feedback hook and material, keeping shadow blur static. During a screen exit, block input with inert while allowing the release feedback to finish within the fade.

Compose mouse, touch, pen and keyboard handlers with Base UI cancellation. Dragging previews, commits once on release and restores the committed value on cancellation. Preserve tapping, keyboard, pan and zoom alternatives. Rotary input follows angle, resists near detents and springs to the nearest valid step; rotate its index independently of fixed lighting.

Use AnimatePresence for progressive fields, editing and session views; animate displaced field layout. Give each foreground element one opacity owner: nested full-view fades multiply and feel abrupt. Main content exits before the next view enters, using the shared sceneMotion pacing. Exit targets become inert immediately. Native route fades match that pacing while the atmosphere stays separate.

Starting or restarting fades the foreground out, reaches black, resets the palette to root red, then reveals it gradually. Start the clock after the exit. Resume preserves elapsed time and color. Completion fades back to configuration automatically; only an enabled cooldown dims to black.

Reduced Motion removes spatial easing and decorative shader motion; foreground changes can be immediate. Follow [atmosphere](atmosphere.md) for rendering limits. Other autoplay content lasting over five seconds alongside content needs a pause, stop or hide mechanism unless essential.
