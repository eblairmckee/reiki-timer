# Form interaction and recovery

Associate visible labels, help, and errors with their controls. Use accessible naming without replacing a visible label where one is needed. Make checkbox and radio labels clickable with their controls and preserve a usable target area. Treat placeholders as examples or hints, keeping required instructions available after text is entered.

Use meaningful field names, input types, input modes, and autocomplete tokens for the data being collected. Preserve paste, password managers, and expected browser completion. Turn off spellcheck for identifiers where correction would change their meaning.

Expose invalid state programmatically and show actionable errors near the affected fields. Validate at useful interaction boundaries. On an unsuccessful submission, guide users to the errors through focus or an accessible summary as appropriate to the form; keep entered values available for correction.

Make pending submission visible, prevent accidental duplicates, and retain an understandable action label. When an action is disabled, make its reason and recovery clear. Restore a usable state after failure and expose important async results through the application's feedback pattern.

Protect meaningful unsaved changes with the application's navigation guard where appropriate, activating it only while the form is dirty. Verify native form submission, keyboard activation, reset, and controlled value ownership for the affected behavior.
