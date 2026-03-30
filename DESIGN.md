```markdown
# Design System Document: Shadowed Precision

## 1. Overview & Creative North Star
This design system is built upon the Creative North Star of **"Shadowed Precision."** We are moving away from the "toy-like" feel of casual gaming and into the territory of a high-end editorial experience. The goal is to make the act of solving a word puzzle feel like interacting with a premium digital artifact.

By utilizing intentional asymmetry in the layout and a hierarchy built on **Tonal Layering** rather than rigid lines, we create a "focus-first" environment. The interface should feel like it is emerging from the darkness, with light and color reserved exclusively for meaningful feedback. We reject the "standard" grid in favor of breathing room and sophisticated depth.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep obsidian tones, punctuated by rich, organic greens and golds.

### Tonal Hierarchy
- **Surface (`#131314`):** The infinite void. The base background for the entire application.
- **Primary (`#98d68f`):** *Doğru* (Correct). Represents success.
- **Secondary (`#dec65e`):** *Yanlış Yer* (Present). Represents intrigue.
- **Tertiary (`#3a3a3c` / `surface_variant`):** *Yok* (Absent). The "shadow" of a letter.

### The "No-Line" Rule
Sectioning must never be achieved through 1px solid borders. Boundaries are defined by background shifts.
- **The Game Board:** Sits on `surface_dim`.
- **The Keyboard:** Anchored on a `surface_container_low` (#1c1b1c) section to subtly separate interaction from observation.
- **Floating Modals:** Use `surface_container_high` (#2a2a2b) to create a "nested" lift.

### The "Glass & Gradient" Rule
To ensure the UI feels bespoke, use a subtle linear gradient on active states (e.g., from `primary` to `primary_container`). Floating elements, such as the *İstatistikler* (Stats) modal, should employ **Glassmorphism**: 
- **Backdrop Blur:** 12px to 20px.
- **Opacity:** 85% opacity on the surface color to allow the grid to "ghost" through.

---

## 3. Typography
We utilize **Manrope** for its clean, geometric, yet approachable rhythm. It provides the "Editorial" weight needed to ground the experience.

- **Display-LG (Manrope, 3.5rem):** Reserved for high-impact end-game states like *TEBRİKLER* (Congratulations).
- **Headline-SM (Manrope, 1.5rem):** Modal headers like *NASIL OYNANIR?* (How to play).
- **Title-LG (Manrope, 1.375rem):** The individual characters inside the tiles. Bold and centered.
- **Label-MD (Manrope, 0.75rem):** Keyboard legends and small UI hints.

Typography should always use `on_surface` (#e5e2e3) for high readability, but secondary labels like "Bir sonraki kelime" (Next word) should drop to `on_surface_variant` to maintain the hierarchy.

---

## 4. Elevation & Depth
Depth is not an afterthought; it is the structure.

### The Layering Principle
Instead of shadows, we stack surfaces. A card (e.g., a tutorial step) is a `surface_container_highest` block sitting on a `surface_container_low` background. This creates a "soft lift" that feels architectural.

### Ambient Shadows
When a modal is active, use a "Signature Shadow":
- **Color:** `#000000` at 15% opacity.
- **Blur:** 40px.
- **Spread:** -10px (to keep it tucked and natural).

### The "Ghost Border"
If a separation is technically required for accessibility (such as a focused keyboard key), use the `outline_variant` token at **15% opacity**. This "Ghost Border" provides a hint of structure without the harshness of a standard stroke.

---

## 5. Components

### Word Tiles (Kelime Kutuları)
- **Empty State:** `surface_container_highest` background. No border.
- **Typed State:** `outline_variant` ghost border (20% opacity) with a subtle "pulse" animation.
- **Correct (Doğru):** `primary` (#98d68f) background with `on_primary` text.
- **Present (Yanlış Yer):** `secondary` (#dec65e) background with `on_secondary` text.
- **Absent (Yok):** `surface_variant` (#3a3a3c) with `on_surface_variant` text.
- **Rounding:** `sm` (0.125rem) for a sharp, modern feel.

### Virtual Keyboard (Sanal Klavye)
- **Keys:** Use `surface_container_highest` as the base. 
- **Active Press:** Transition to `primary_container` for immediate tactile feedback.
- **Spacing:** Use `spacing-1` (0.2rem) between keys to maintain a tight, professional density.
- **Labels:** All uppercase Turkish characters. The "ENTER" key is labeled *GÖNDER* and "BACKSPACE" is an icon or *SİL*.

### Modals (Bilgi Pencereleri)
- **Layout:** Asymmetric headers. Place the "Close" (*Kapat*) action at the bottom as a wide, low-profile tertiary button rather than an "X" in the corner.
- **Content:** Use `spacing-8` (1.75rem) for internal padding to give the text maximum breathing room.

### Buttons (Butonlar)
- **Primary (GÖNDER):** `primary` background. No border. `xl` roundedness (0.75rem).
- **Secondary (PAYLAŞ):** `surface_container_highest` background with a subtle gradient hint.

---

## 6. Do’s and Don'ts

### Do:
- **Do** use `spacing-20` (4.5rem) of vertical white space between the game grid and the keyboard to let the UI breathe.
- **Do** use `surface_container_lowest` for the background of the entire app to maximize the contrast of the green and yellow states.
- **Do** ensure all Turkish characters (İ, Ş, Ğ, Ç, Ö, Ü) are perfectly vertically centered within tiles.

### Don't:
- **Don't** use 1px white or grey borders to define the grid. It creates visual noise.
- **Don't** use pure black (#000000). Always use the `surface` tokens to maintain tonal depth.
- **Don't** use standard "drop shadows" with high opacity. They break the high-end editorial illusion.
- **Don't** crowd the UI. If the screen is small, prioritize the grid size and let the keyboard scale down.

---
*Director's Note: This system is designed to feel "hushed." Every interaction should feel intentional, every transition smooth, and every color meaningful. Let the darkness do the heavy lifting.*```