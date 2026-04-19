# Design System Strategy: The Living Archive

## 1. Overview & Creative North Star
**Creative North Star: "The Living Archive"**
This design system rejects the sterile, cold nature of modern technology in favor of a "Living Archive"—a digital experience that feels as tactile and precious as a hand-woven basket or a weathered family journal. We are building a bridge between generations.

To achieve this, the system breaks the "template" look by employing **intentional asymmetry** and **tonal depth**. Rather than a rigid, mathematical grid, layouts should feel like they have been "laid out by hand." Elements should overlap slightly, and border radii should mimic organic shapes—leaf-like curves and basket-weave patterns—to ensure the interface feels warm, ancestral, and human.

---

## 2. Colors & Surface Philosophy
The palette is rooted in the earth, using high-contrast tones to ensure accessibility for elderly users while maintaining a premium, editorial aesthetic.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. In "The Living Archive," boundaries are felt, not drawn. 
- Use background color shifts (e.g., a `surface-container-low` section resting on a `surface` background).
- Use white space as a structural element.
- If a container requires definition, use a change in tonal value or a subtle "Ghost Border" (see Section 4).

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers, like stacked sheets of fine paper.
- **Base Layer:** `surface` (#fdf9e9) or `surface-bright`.
- **Primary Content Area:** `surface-container-low` (#f8f4e4).
- **Interactive Cards:** `surface-container-lowest` (#ffffff) to create a natural "lift."
- **Nesting:** To highlight a specific piece of oral history (a quote or audio player), nest a `surface-container-high` element within a `surface-container` area.

### Signature Textures & Soul
To move beyond "out-of-the-box" UI, utilize the **"Terracotta Gradient"**. For primary CTAs and hero headers, transition from `primary` (#9b2f00) to `primary_container` (#c2410c) at a 135-degree angle. This provides a visual "glow" that feels like sun-baked clay.

---

## 3. Typography: The Storyteller’s Voice
The typography is a dialogue between the tradition of the Serif and the clarity of the Sans-Serif.

*   **Display & Headlines (Noto Serif):** Used for storytelling and titles. The large scale and warm curves of Noto Serif evoke the feeling of a classic novel or a historical document. 
    *   *Usage:* `display-lg` for opening quotes; `headline-md` for chapter titles.
*   **Body & Labels (Lexend):** Lexend was designed specifically to reduce visual stress and improve reading proficiency. We use it for all functional text to ensure the app is accessible to elderly users and those with low vision.
    *   *Usage:* `body-lg` (1rem) is our minimum for narrative text to ensure legibility.

**Bilingual Optimization:** When displaying English and Kinyarwanda side-by-side, use a 1:1 column grid. The Kinyarwanda text (often longer) should dictate the container height, with the English text vertically centered to create a balanced, editorial look.

---

## 4. Elevation & Depth
Hierarchy is achieved through **Tonal Layering** and **Ambient Light**, never through heavy drop shadows.

*   **The Layering Principle:** Depth is created by stacking `surface-container` tiers. A `surface-container-lowest` card on a `surface-container-low` background creates a soft, natural lift.
*   **Ambient Shadows:** For floating elements (like an audio record button), use a wide-spread, low-opacity shadow (4-8% opacity). The shadow color must be a tinted version of `on_surface` (#1c1c13) rather than pure black.
*   **Glassmorphism:** For top navigation bars or floating playback controls, use `surface` at 80% opacity with a `12px` backdrop blur. This allows the "vintage paper" texture of the background to bleed through, making the UI feel integrated.
*   **The Ghost Border:** If a boundary is strictly required for accessibility, use the `outline_variant` token at **15% opacity**.

---

## 5. Components

### Buttons (The "Touch-First" Standard)
- **Primary:** Background `primary_container` (#c2410c), Text `on_primary_container`. 
- **Sizing:** Minimum height of **56px** to accommodate elderly motor skills.
- **Shape:** Use an asymmetric radius (e.g., `top-left: xl`, `bottom-right: xl`, `top-right: md`, `bottom-left: md`) to create a "leaf" or "river stone" shape.

### Cards & Narrative Lists
- **Rule:** Forbid the use of divider lines. 
- **Structure:** Separate oral history entries using vertical white space (32px+) or subtle background shifts between `surface-container-low` and `surface-container-high`.
- **Interaction:** Cards should utilize the `sm` or `md` roundedness scale for a soft, tactile feel.

### Bilingual Audio Player
- A persistent floating bar using **Glassmorphism** (Backdrop blur).
- Large, high-contrast icons for Play/Pause (min 44px icon size within a 64px touch target).
- Progress bar uses `primary` (#9b2f00) against `outline_variant`.

### Text Inputs
- No bottom-line-only inputs. Use a solid `surface-container-highest` background with a "Ghost Border."
- Labels must always be visible (never placeholder-only) using `title-sm` in Lexend.

---

## 6. Do’s and Don’ts

### Do
*   **Do** embrace asymmetry. A slightly off-center heading feels more "ancestral" than a perfectly centered one.
*   **Do** use the "Sand" (#FDF2F8) and "Cream" (#FFFBEB) tones to create a warmth that prevents eye strain.
*   **Do** ensure all interactive elements have a minimum tap target of 56x56px.
*   **Do** align English and Kinyarwanda text to a shared baseline.

### Don’t
*   **Don’t** use pure black (#000000). Use `on_surface` (#1c1c13) or `on_secondary_fixed` (#351000) for deep tones.
*   **Don’t** use standard "Material Design" 4px rounded corners. It feels too industrial. Use the `xl` (1.5rem) scale for major containers.
*   **Don’t** use 1px dividers. They "cut" the history; use space to let the history "breathe."
*   **Don’t** use high-speed animations. Use slow, ease-in-out transitions (300ms+) to mimic the slow pace of storytelling.