# Motion

Keep wells and hit areas stationary. Frosted touch surfaces lift slightly on hover, depress on press and settle with an interruptible shared spring. Etched secondary actions deepen their inset shading on press and keep their hit targets stationary. Crossfade prepainted lighting, animate transforms/opacity, keep blur static and frame updates outside React state.

Dials, switches and primary HUD actions share a diffuse pressure outline and one outward release wave. Follow the silhouette of the active surface. The switch outlines its capsule track and releases from the thumb. A word button carries its rectangular corners through pressure and release. Cancellation clears pressure. Keep shadow blur static and allow release feedback to finish within the screen fade.

Compose mouse, touch, pen and keyboard handlers with Base UI cancellation. Dragging previews, commits once on release and restores the committed value on cancellation. Preserve tapping, keyboard, pan and zoom alternatives. Rotary input follows angle, resists near detents and springs to the nearest valid step; rotate its index independently of fixed lighting.

Every progressive disclosure transitions smoothly in both directions. Keep its trigger anchored and place the revealed material on the appropriate side and layer. Settings slide out from beneath their parent in normal flow. HUD actions slide horizontally from behind their primary control. Use the shared [Disclosure atom](../../../../src/components/atoms/disclosure/index.tsx) for a damped, interruptible slide and a gradual fade. Look for jumps when reversing direction partway through and when text wraps.

For an overlay, lay out the content at its final width before revealing it. Fade it in with a few pixels of travel from its origin, keeping the trigger readable and the glass blur steady. On dismissal, let it recede along the same path. Give each surface one opacity animation. Honor Reduced Motion by removing spatial travel.

Use AnimatePresence to retain exiting fields, groups and views through their transition. Main content exits before the next view enters, using the shared sceneMotion pacing. Exit targets become inert immediately. Native route fades match that pacing while the atmosphere stays separate. When browser history returns to the finish dialog, let the live dialog own its entrance so links accept the first tap.

Starting or restarting fades the foreground out, reaches black, resets the palette to root red, then reveals it gradually. Start the clock after the exit. Resume preserves elapsed time and color. Completion fades in the finish dialog over the timer. Only an enabled cooldown dims to black. Summary items fade and pulse when their values change; animate their neighbors into place.

Reduced Motion removes spatial easing and decorative shader motion; foreground changes can be immediate. Follow [atmosphere](atmosphere.md) for rendering limits. Other autoplay content lasting over five seconds alongside content needs a pause, stop or hide mechanism unless essential.
