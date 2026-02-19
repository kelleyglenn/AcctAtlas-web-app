# AccountabilityAtlas — High-End Mapbox Visual Style Guide

This document defines a custom Mapbox visual system that feels:

- Institutional
- Data-forward
- Neutral and credible
- Calm, not sensational
- Optimized for video density and clustering

The map should feel like a civic data instrument — not a consumer navigation app.

---

# 1. Core Design Philosophy

## The Map Is Infrastructure

The map should:

- Support the data, not compete with it
- Avoid bright navigation colors (no Google-style greens/yellows)
- De-emphasize roads
- Emphasize geographic boundaries
- Keep the visual field quiet

The emotional tone should be closer to:

- An academic atlas
- A government GIS portal
- A newsroom data investigation

Not:

- A delivery app
- A ride-sharing interface
- A flashy analytics dashboard

---

# 2. Base Style Recommendation

Start from:

Mapbox base style:

- `mapbox://styles/mapbox/dark-v11`

OR

For more control:

- `mapbox://styles/mapbox/light-v11`

Then heavily customize.

For AccountabilityAtlas, I recommend a **custom dark theme** for:

- Strong visual contrast for white markers
- Serious tone
- Better hero-page impact

---

# 3. Core Color System (Map Layers)

## Background (Land)

Very dark slate:

- `#0b1220` or `#0f172a`

This aligns with your brand's slate-900 tone.

Avoid pure black. It feels harsh and aggressive.

---

## Water

Desaturated blue-gray:

- `#0e1a2b`

Water should be visible but subtle.

No bright ocean blues.

---

## Roads

Primary Roads:

- `#1f2937` (slate-800)
- Width reduced by 20–30%

Secondary Roads:

- `#111827` (almost background)
- Very thin

Roads should not dominate the map.

---

## Administrative Boundaries

State Lines:

- `#334155`
- Slightly more visible than roads

County Lines:

- `#1e293b`
- Thin and subtle

These are important for a civic platform.

---

## Labels

City Labels:

- `#cbd5e1` (slate-300)
- Slightly smaller than default
- Medium weight

State Labels:

- `#94a3b8` (slate-400)
- Uppercase
- Slight letter spacing

Remove:

- POIs (restaurants, parks, retail)
- Transit icons
- Commercial noise

The map should not look like Yelp.

---

# 4. Marker & Cluster Design System

This is the most important section.

## Philosophy

Markers should feel:

- Neutral
- Clean
- Analytical
- Data-oriented

Avoid:

- Bright red
- Aggressive drop pins
- Emoji or cartoon styles

---

# 5. Cluster Design

## Cluster Circle Color

Base:

- `#e2e8f0` (slate-200)
  With opacity: 0.85

Stroke:

- `#0f172a`
- 2px

This gives:

- High visibility
- Clean, minimal aesthetic
- Strong contrast against dark map

---

## Cluster Count Text

- Color: `#0f172a`
- Font weight: 600
- Slightly condensed look

Keep it crisp and legible.

---

## Cluster Scaling

Use stepped radius scaling:

- 10–25 points → radius 18
- 25–100 → radius 24
- 100+ → radius 30

Avoid dramatic scaling.

---

# 6. Individual Marker Design

Avoid traditional Mapbox teardrop pins.

Instead use:

## Option A (Recommended): Minimal Circle Marker

- Radius: 6–8px
- Fill: white (#ffffff)
- Stroke: 2px slate-900 (#0f172a)

Hover state:

- Slight scale up (1.2x)
- Soft shadow glow

This feels modern and data-driven.

---

## Option B: Amendment-Coded Markers

If you want visual differentiation:

1st Amendment → Soft blue-gray
2nd Amendment → Muted charcoal
4th Amendment → Slate-blue
5th Amendment → Desaturated violet-gray

BUT:

Never use bright red for 4th Amendment.
Avoid emotional color associations.

Neutral > dramatic.

---

# 7. Popup Styling (Video Preview Cards)

Popups should feel like:

- A data card
- Not a social media tooltip

## Popup Background

- bg: #111827
- border: #334155
- rounded-lg
- subtle shadow

## Typography

Title:

- text-white
- font-semibold

Metadata:

- text-slate-400
- small caps for amendment tags

Avoid:

- Bright link colors
- Underlines everywhere

Keep it clean and calm.

---

# 8. Hero Map Behavior Styling

For landing page version:

- Lower zoom (3.5–4)
- Slightly increased cluster opacity
- Disable marker popups
- Auto slow pan (very subtle)

Optional:

Add a faint vignette darkening toward edges to increase cinematic quality.

---

# 9. Motion & Transitions

Keep transitions restrained:

- Zoom duration: 600–900ms
- Ease: easeOutCubic
- No bounce easing
- No elastic effects

Hover interactions:

- Scale 1.1–1.2 max
- 150ms transition

Professional > playful.

---

# 10. Performance Considerations

Because this is data-heavy:

- Use clustering at all zoom levels below 9
- Load only videos within viewport bounds
- Consider server-side bounding box filtering later
- Defer heavy popup content until clicked

The map must feel fast.

Lag destroys credibility.

---

# 11. Optional: High-End Polish Layer

If you want it to feel truly premium:

## Subtle Grain Overlay (Hero Only)

- Very low-opacity texture layer
- 2–3% opacity
- Gives slight tactile depth

## Very Faint Glow Around Clusters

- Soft drop shadow
- Not colored
- Very subtle

This makes it feel designed, not default.

---

# 12. What This Style Achieves

This visual system communicates:

- Serious civic intent
- Analytical focus
- Platform neutrality
- Professional quality

It visually separates AccountabilityAtlas from:

- YouTube
- Protest aesthetics
- Generic SaaS dashboards

The map becomes a restrained, powerful instrument.

---

End of Mapbox Visual Style Guide
