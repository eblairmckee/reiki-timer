# UI library and styling

Use the application's selected UI library (olyx UI) and its component APIs, variants, styles, and tokens. You may make changes to these components and tokens to customize them to the look and feel of the app. 

Use shared tokens for color, spacing, typography, radii, and interaction states. Keep styles and variants at their maintained owner (component). Layout composition should never introduce unpredictable visual overrides to descendent UI. 

Set `color-scheme` to match the active theme so browser-provided controls and scrollbars remain consistent. Match the document theme color to the visible page where the application uses it, and check native select colors in supported browsers.
