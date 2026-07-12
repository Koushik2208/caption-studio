---
name: Pro-Tool Minimalist
colors:
  surface: '#f9f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f9f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f5'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e4'
  on-surface: '#1a1c1d'
  on-surface-variant: '#424656'
  inverse-surface: '#2f3132'
  inverse-on-surface: '#f0f0f2'
  outline: '#727687'
  outline-variant: '#c2c6d8'
  surface-tint: '#0054d6'
  primary: '#0050cb'
  on-primary: '#ffffff'
  primary-container: '#0066ff'
  on-primary-container: '#f8f7ff'
  inverse-primary: '#b3c5ff'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#a33200'
  on-tertiary: '#ffffff'
  tertiary-container: '#cc4204'
  on-tertiary-container: '#fff6f4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#003fa4'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59d'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#832600'
  background: '#f9f9fb'
  on-background: '#1a1c1d'
  surface-variant: '#e2e2e4'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.06em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  canvas-margin: 40px
  panel-width: 320px
  gutter: 16px
  stack-gap: 8px
  section-padding: 24px
---

## Brand & Style

The design system is engineered for "Caption Studio," a professional creative environment where the user’s content is the focus. The brand personality is clinical, efficient, and precise. It adopts a **Pro-Tool Minimalism** aesthetic—a hybrid of high-end SaaS utility and industrial precision.

The emotional response should be one of "controlled focus." By utilizing a restrained palette and generous whitespace, the UI recedes into the background, allowing the creative work to take center stage. The distinction between the "Preview Canvas" (the stage) and the "Tool Panels" (the backstage) is maintained through rigid structural hierarchy and clear functional zoning.

## Colors

The palette is strictly functional. We use a "High-Contrast Workspace" model:
- **Primary (#0066FF):** A vibrant, digital blue reserved exclusively for high-priority actions, active states, and selection indicators.
- **Secondary (#1A1A1A):** Used for primary text and structural elements that require maximum visual weight.
- **Neutrals:** A range of cool grays. `#FFFFFF` is reserved for the Preview Canvas to ensure color accuracy, while `#FAFAFA` defines the modular Tool Panels to create a subtle layered distinction.
- **Success/Warning/Error:** Standardized semantic colors should be used sparingly, inheriting the high-saturation profile of the primary blue.

## Typography

This design system utilizes **Inter** for all UI elements and instructional text due to its exceptional legibility at small sizes. **JetBrains Mono** is introduced for technical labels and metadata to reinforce the "pro-tool" technical aesthetic.

- **Headlines:** Use tight letter-spacing and semi-bold weights to create a strong anchor for tool sections.
- **Labels:** Small caps and monospaced fonts are used for property names (e.g., "X-AXIS", "OPACITY") to distinguish them from user-generated content.
- **Hierarchy:** Contrast is achieved through weight and casing rather than massive shifts in scale.

## Layout & Spacing

The layout follows a **Fixed-Panel Fluid-Canvas** model. 
1. **The Preview Canvas:** A centered, fluid area that maintains "safe margins" (40px) from all surrounding UI.
2. **Modular Tool Panels:** Fixed-width sidebars (320px) that anchor to the right or left of the screen.
3. **The Toolbar:** A slim, global header or floating bar for top-level navigation.

The spacing rhythm is built on an **8px base unit**. All internal panel components should use 16px padding, while individual tool controls are stacked with 8px gaps to maintain a "snapped-in" feel. 
- **Desktop:** Sidebar panels are docked. 
- **Tablet:** Sidebars become collapsible drawers. 
- **Mobile:** The canvas occupies the top half of the screen; tools are presented in a bottom-sheet system.

## Elevation & Depth

This design system avoids traditional shadows in favor of **Tonal Layering and Low-Contrast Outlines**. 
- **Level 0 (Base):** The application background, using our darkest neutral or a workspace gray.
- **Level 1 (Panels):** Tool panels use `#FAFAFA` with a 1px solid border of `#E5E5E5`. No shadows.
- **Level 2 (Canvas):** The Preview Canvas is elevated slightly with a very subtle, large-radius ambient shadow (4% opacity black) to separate the "work" from the "interface."
- **Level 3 (Pop-overs/Modals):** These use a crisp 1px border and a medium-diffused shadow to indicate temporary priority.

## Shapes

To maintain a professional, architectural feel, the design system uses a **Soft (Level 1)** roundedness profile.
- **Buttons and Inputs:** 4px (0.25rem) corner radius. This provides enough "friendly" character to be modern without appearing "toy-like."
- **Cards/Panels:** 8px (0.5rem) for container-level elements to create a clear structural nested hierarchy.
- **Selection Brackets:** 0px radius for specific canvas-level selection tools to imply surgical precision.

## Components

- **Buttons:** Primary buttons are solid `#0066FF` with white text. Secondary buttons use a white fill with a 1px border. Tertiary/Ghost buttons are used for low-priority panel actions.
- **Tool Cards:** Each tool section (e.g., Typography, Timing, Transitions) is housed in a "snap-in" card. These cards are separated by a 1px horizontal divider or 8px vertical spacing.
- **Input Fields:** Minimalist design with a 1px border that turns Primary Blue on focus. Labels sit above the input in the `label-caps` typography style.
- **Control Sliders:** Use a thin track with a high-contrast circular handle. The track "fills" with the Primary color as the value increases.
- **Chips/Status:** Used for tag-based captioning. Small, 4px radius, using a light gray background with medium gray text.
- **Canvas Overlays:** Icons and controls that sit directly on the Preview Canvas must have a subtle backdrop blur or a high-contrast "outer glow" to ensure visibility over any user content.