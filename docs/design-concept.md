# **layout**

Fields are laid out vertically in a column where on a mobile or web device the first field is vertically centered in the viewport, second field is peeking out from the bottom. Amount of peek depends on viewport height, but I want at least 10% of the next field visible. 

## desktop

On desktop we’ll have 2 columns, left is for field labels, right is the field itself. On mobile we’ll stack them vertically in a single column.   
On desktop it’s important that we have a max width for the content where it’s always horizontally centered. Feels like the UI is floating in the middle of the page. If viewport is really tall we should max out the next field peek to be 50% that way we never have more than 2 fields ever in the viewport. 

# **Fields**

## How long 

5m to 1h. default to 20m  
circular select where you rotate it like a rotary phone dial and selected option shows as label above the dial. Only one value label and only shown for selected. Value label will change as user turns the dial. Should use motion to make the dial feel sticky when it reaches a “tick” for a value. On release animates/rotates to nearest value tick. We want this to feel snappy.   
Appearance of dial should be similar to a sundial.   
We’ll make this a new atom we’ll call time picker 

## Repeat chakras

1 or 2 cycles. Default to 1  
Let’s use a switch for this (1 is false, 2 is true).   
Add helper text below switch that explains this will cycle through chakras again if enabled

## Warm up

default false   
switch  
When enabled show a time picker with values from 1-10m below it as the next field, but reduce spacing between fields to half of what normal field spacing is so we know they are related.   
When configured this will prepend time to the duration where we’ll start with blacks for gradient colors, then slowly animate in the first chakra colors based on number of mesh colors divided by warm up duration. 

## Cool down 

Same as warm up  
This will append additional time to end of duration where we’ll slowly add black to background mesh gradient based on number of colors in mesh divided by cooldown duration. 

# **State**

Save in local storage and preload values from local storage when present. Only one config for now, over write old when new session started

# **HUD/navigation**

For now it’ll just be a button floating in top right corner of screen, sticky, very translucent, only full opacity when hovered. Should have a nice transition animation between the 2 states. We want this to be very subtle. 

## When timer is being configured (root/home timer)

start button  
If user has been on this page for more than 3s let’s pulse it’s opacity to make it more opaque, to indicate this is how you start. 

## When timer is running

stop button  
On stop show 2 options: finish or edit timer  
Finish takes you back to home/timer route  
Edit surfaces timer UI in a popover on desktop. Popover trigger changes to two buttons: resume or restart. Both of which saves the settings to storage and resumes where left off or restarts.   
If new duration is lower than current timer position only show restart rather than resume button. 

# **Background**

## when timer playing

Colors will cycle through chakra colors red to purple (root to crown chakras) where each chakra is a slice of time in seconds relative to settings (duration divided by cycles) we’ll transition through each chakra by slowly transitioning background colors for current chakra one by one to a chakra color from the next one, sequentially. This gives a nod to practitioner that we’re heading into next chakra. Total time for transitions between chakras should be around 10s.   
If possible when transition to new chakra color finishes speed up background shader for one second, then go back to normal speed. 

## When timer is being configured

Cycle through chakra colors every 10s, so basically the timer playing with same transitions, but we’ll basically always be transitioning through chakras on a loop.   
   