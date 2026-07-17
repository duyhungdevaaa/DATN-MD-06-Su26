---
name: Vogue & Veil
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e3e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#6c5e06'
  on-secondary: '#ffffff'
  secondary-container: '#f7e382'
  on-secondary-container: '#73640e'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1c'
  on-tertiary-container: '#838484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#f7e382'
  secondary-fixed-dim: '#dac769'
  on-secondary-fixed: '#211b00'
  on-secondary-fixed-variant: '#524700'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e3e2e2'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.15em
  button:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style
The brand personality is rooted in high-end editorial luxury, blending the timelessness of a boutique fashion house with modern digital minimalism. It targets an affluent, style-conscious audience that values restraint, quality, and curated aesthetics over clutter.

The design style is **Minimalist / High-Fashion Editorial**. It relies on expansive white space to create a "gallery" feel, allowing high-quality photography to serve as the primary visual anchor. The interface remains quiet and sophisticated, utilizing a strict grid and thin lines to evoke the feeling of a premium printed lookbook. The emotional response should be one of exclusivity, calm, and effortless elegance.

## Colors
The palette is built on a high-contrast monochromatic foundation to maintain focus on product imagery.

- **Primary (Deep Black):** Used for primary typography, icons, and structural borders to provide weight and authority.
- **Secondary (Champagne Gold):** Reserved for delicate accents, such as active states, rare call-to-actions, or premium badges. It should be used sparingly to maintain its value.
- **Neutral / Surface:** A range of whites and soft grays (Soft White #FCFCFC and Light Gray #F2F2F2) provide the "breathable" background layers.
- **Status Colors:** Functional colors (error, success) should be desaturated to fit the palette, using deep maroons or muted olives rather than bright signals.

## Typography
The typography strategy creates a hierarchy of "The Editor" vs. "The Detail." 

**Playfair Display** is used for all headlines and display text. Its high-contrast strokes and elegant serifs provide a literary, upscale feel. Large display sizes should use tighter letter spacing for a more modern, "vogue" look.

**Montserrat** handles all functional and body text. It is geometric and clean, providing a neutral balance to the decorative nature of the serif headlines. Utility text and labels should frequently use uppercase with increased letter spacing to mimic the labeling found on high-end luxury packaging.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to ensure that wide photography never stretches beyond its intended composition, preserving the editorial intent. 

- **Desktop:** A 12-column grid with a maximum width of 1440px. Large 64px side margins create an intentional "frame" around the content.
- **Sectioning:** Vertical rhythm is defined by generous gaps (120px+) between sections to allow the user's eye to rest.
- **Mobile:** A 4-column grid with 20px margins. Content should reflow vertically, with typography scaling down to maintain legibility without losing the high-contrast display ratio.
- **Alignment:** Prefer asymmetrical layouts where text blocks are offset from image centers to create a dynamic, modern feel.

## Elevation & Depth
This design system avoids heavy shadows to maintain its clean-lined, minimalist aesthetic. Depth is communicated through:

- **Tonal Layering:** Using subtle shifts between Soft White (#FCFCFC) and Light Gray (#F2F2F2) to differentiate backgrounds from foreground containers.
- **Subtle Ambient Shadows:** If elevation is required (e.g., for a floating shopping bag or a dropdown), use a "Zero-Shadow" approach: an extremely diffused, 1% opacity black shadow with a large blur radius (30px+) that mimics natural light in a studio setting.
- **Hairline Outlines:** Use 0.5px or 1px solid black or light gray borders to define interactive areas like inputs and buttons. This reinforces the "sharp" and "precise" brand identity.

## Shapes
The shape language is primarily **Sharp**. Precision is key. 

- **Containers & Buttons:** Use a very slight 4px radius (`rounded-sm`) to take the "edge" off the digital display while maintaining the look of sharp-cornered architectural lines.
- **Imagery:** Photography should always have sharp 0px corners to mimic printed magazine cutouts.
- **Icons:** Use thin-stroke (1px), sharp-ended icons to align with the Montserrat and Playfair Display letterforms.

## Components
- **Buttons:** Primary buttons are solid Black with White text, using the `button` typography token. Secondary buttons are outlined (1px Black) with no fill. The hover state for primary buttons is a slight shift to the Champagne Gold accent.
- **Input Fields:** Minimalist design featuring only a bottom border (1px Black) rather than a full box. Labels use the `label-caps` style above the line.
- **Cards:** Product cards are borderless. The focus is 100% on the image. Price and title appear in `body-md` below the image with generous padding.
- **Chips/Filters:** Rectangular with sharp corners and 1px light gray borders. When selected, the border thickens to 2px Black.
- **Navigation:** A centered, minimalist top bar. Navigation links use `label-caps`. The active link is indicated by a 1px Champagne Gold underline.
- **Image Carousels:** Use thin, 1px horizontal lines as pagination indicators rather than traditional dots to maintain the architectural feel.