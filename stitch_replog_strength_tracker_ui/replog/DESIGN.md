---
name: RepLog
colors:
  surface: '#121316'
  surface-dim: '#121316'
  surface-bright: '#38393c'
  surface-container-lowest: '#0d0e11'
  surface-container-low: '#1b1b1f'
  surface-container: '#1f1f23'
  surface-container-high: '#292a2d'
  surface-container-highest: '#343538'
  on-surface: '#e3e2e6'
  on-surface-variant: '#d1c5ae'
  inverse-surface: '#e3e2e6'
  inverse-on-surface: '#303034'
  outline: '#9a907b'
  outline-variant: '#4e4634'
  surface-tint: '#f0c03e'
  primary: '#ffe5aa'
  on-primary: '#3e2e00'
  primary-container: '#f5c542'
  on-primary-container: '#6b5200'
  inverse-primary: '#765a00'
  secondary: '#c4c6d0'
  on-secondary: '#2d3038'
  secondary-container: '#44474f'
  on-secondary-container: '#b3b5be'
  tertiary: '#c5eeff'
  on-tertiary: '#003544'
  tertiary-container: '#69d9ff'
  on-tertiary-container: '#005e74'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdf95'
  primary-fixed-dim: '#f0c03e'
  on-primary-fixed: '#251a00'
  on-primary-fixed-variant: '#594400'
  secondary-fixed: '#e0e2ec'
  secondary-fixed-dim: '#c4c6d0'
  on-secondary-fixed: '#191c23'
  on-secondary-fixed-variant: '#44474f'
  tertiary-fixed: '#b8eaff'
  tertiary-fixed-dim: '#63d4fa'
  on-tertiary-fixed: '#001f28'
  on-tertiary-fixed-variant: '#004d61'
  background: '#121316'
  on-background: '#e3e2e6'
  surface-variant: '#343538'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 16px
  gutter: 12px
---

## Brand & Style

The brand personality is disciplined, high-performance, and utilitarian. It targets serious athletes who value efficiency and data over social interaction. The design system prioritizes speed of input and high legibility in low-light or high-intensity gym environments.

The visual style is **Corporate / Modern** with a lean towards **Technical Minimalism**. It utilizes a "Deep Dark" aesthetic where hierarchy is established through subtle tonal shifts rather than heavy shadows. The interface should feel like a precision instrument—reliable, fast, and focused.

**Key Principles:**
- **Performance First:** Minimize decorative elements to focus on tracking and progress.
- **Physicality:** Use high-contrast accents to guide the eye toward physical interaction points.
- **Density:** Maintain a compact layout to allow athletes to see more data without excessive scrolling.

## Colors

The palette is optimized for OLED displays to maximize battery life and contrast.

- **Primary (#F5C542):** Reserved for "The Path of Success"—start buttons, active set markers, and progress bar fills. It is a warm, energetic yellow that demands attention without being neon.
- **Tonal Layers:** The background uses a near-black (#090A0D). Surfaces elevate slightly to #121419, while interactive cards sit at #181B22.
- **Functional Colors:** Success and Error states use muted, sophisticated tones to avoid a "gamified" appearance, maintaining the professional tone of the design system.

## Typography

This design system uses **Inter** exclusively to lean into its systematic, utilitarian nature. 

- **Data Emphasis:** For weight and rep counts, use `data-lg` to ensure numbers are readable from a distance (e.g., when the phone is on the floor next to a rack).
- **Labels:** Use `label-md` for secondary metadata like "Previous" or "1RM" to create a clear distinction from primary input values.
- **Scale:** On mobile, avoid font sizes smaller than 12px to ensure accessibility during high-heart-rate activity.

## Layout & Spacing

The layout uses a **Fluid Grid** model optimized for narrow viewports. 

- **Rhythm:** A strict 4px baseline grid ensures vertical alignment.
- **Margins:** Standard horizontal padding is set to 16px (`md`) to maximize screen real estate for data entry.
- **Card Spacing:** Exercise cards should be separated by 12px (`sm`) to maintain a tight, compact feel that implies a continuous "stack" of work.
- **Touch Targets:** Any interactive element (input fields, checkboxes) must maintain a minimum 44px tap target, even if the visual container appears smaller.

## Elevation & Depth

In this design system, depth is communicated via **Tonal Layers** and **Low-Contrast Outlines** rather than shadows. 

- **Base Level:** The app background (#090A0D).
- **Surface Level:** Permanent structural elements like the Bottom Tab Bar and Header.
- **Active Level:** Interactive cards and modals use the #181B22 surface with a 1px solid border of #252A33.
- **Modals:** Use a 60% opacity black overlay to dim the background. Modals should slide up from the bottom (Sheet style) to maintain thumb-reachability.

## Shapes

The shape language is "Soft-Technical." 

- **Corner Radius:** A standard 8px (`rounded-lg`) is used for all exercise cards and input fields to provide a modern feel that isn't overly aggressive.
- **Buttons:** Primary action buttons use a slightly higher radius (12px) to distinguish them from data containers.
- **Chips:** Small chips for set types (e.g., "Warmup") use a 4px radius to keep them looking sharp and professional.

## Components

### Bottom Tab Bar
Uses a blurred #121419 background. Active icons use the Primary Accent (#F5C542) with a subtle top-border indicator. Labels are 10px, only visible for the active state to reduce visual clutter.

### Exercise Cards
Compact layout with exercise title in `headline-sm`. Inline set logging uses a row-based approach: [Set #] [Previous] [Weight Input] [Reps Input] [Checkmark]. The "Checkmark" button turns Primary Accent when "Set Complete."

### Chips (Set Types)
- **Normal:** Transparent with #252A33 border.
- **Warmup:** Subtle blue tint.
- **Failure:** Subtle red tint.
- **Drop:** Subtle purple tint.
All chips use `label-md` for text.

### Segmented Controls
Used for kg/lb toggles. The unselected state is #121419; the selected state is #252A33 with `text-primary`.

### Inputs
Optimized for numeric entry. Large font size (18px) for the value. Upon focus, the border shifts from #252A33 to #F5C542. Input height is a fixed 48px for thumb comfort.

### Custom Modals
Bottom-sheet style with a "grabber" handle at the top. Background is #121419. Used for exercise selection, rest timers, and workout summaries.