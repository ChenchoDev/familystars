---
name: Family Color Palette
description: Official constellation colors for each family branch
type: reference
---

## Official Color Scheme

These colors define the visual identity of each family constellation. Used consistently across the app: nodes, halos, badges, lines.

| Family | Color Name | Hex | Usage |
|--------|-----------|-----|-------|
| **Paterna** | Lila/Purple | `#9B59B6` | Father's ancestral line (paternal grandfather) |
| **Materna** | Azul Celeste/Cyan | `#3498DB` | Mother's ancestral line (maternal grandfather) |
| **Política 1** | Naranja Dorado/Orange | `#F39C12` | Wife's family (incorporated by marriage) |
| **Política 2** | Verde Esmeralda/Green | `#27AE60` | In-laws, brothers-in-law (expansion) |

### Additional Colors

- **Canvas Background**: Deep Navy #080C18
- **Marriage Lines**:
  - Same family: White (discontinuous)
  - Between families: Gold #C9A84C (discontinuous, prominent)
- **Text/UI**: White (#FFFFFF) on dark backgrounds
- **Borders/Accents**: Slate 700–900

### Usage Rules

1. **Star nodes**: Color = family color, border darker shade
2. **Halo glow**: Same family color, high opacity on hover
3. **Connecting lines**: Family color of parent/origin person
4. **Family badges**: Background = color + 20% opacity, text = full color
5. **UI elements**: Use family colors for categorization, never brand confusion

### Implementation

Store in CSS variables for consistency:

```css
:root {
  --color-paterna: #9B59B6;
  --color-materna: #3498DB;
  --color-politica-1: #F39C12;
  --color-politica-2: #27AE60;
  --color-canvas-bg: #080C18;
  --color-marriage-gold: #C9A84C;
}
```

### Why These Colors?

- **Paterna (Purple)**: Royal, ancestral, represents gravitas of paternal lineage
- **Materna (Cyan)**: Serene, celestial, complements purple nicely
- **Política 1 (Orange)**: Warm, welcoming, distinct from first two
- **Política 2 (Emerald)**: Natural, growth, different quadrant of color wheel

Colors chosen for:
- ✅ Sufficient contrast on dark background
- ✅ Distinct from each other (no confusion)
- ✅ Celestial/elegant aesthetic
- ✅ Accessible for colorblind users (not relying on red-green)
