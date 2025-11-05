# VeSS Testing Dashboard Theme System

## Overview
The VeSS Testing dashboard uses a modern, clean design system built on CSS variables and utility classes. The theme supports both light and dark modes while maintaining visual consistency across all components.

## Typography
- Primary font: Lato (300, 400, 700, 900)
- Uses a modular scale for consistent text sizes
- Font sizes are available as CSS variables:
  - `--text-xs`: 0.75rem
  - `--text-sm`: 0.875rem
  - `--text-base`: 1rem
  - `--text-lg`: 1.125rem
  - `--text-xl`: 1.25rem
  - `--text-2xl`: 1.5rem

## Spacing
The spacing system uses an 8px grid for consistency:
- `--space-1`: 0.25rem (4px)
- `--space-2`: 0.5rem (8px)
- `--space-3`: 0.75rem (12px)
- `--space-4`: 1rem (16px)
- `--space-6`: 1.5rem (24px)
- `--space-8`: 2rem (32px)
- `--space-12`: 3rem (48px)
- `--space-16`: 4rem (64px)

## Color System
Colors are defined using OKLCH for better perceptual uniformity across light and dark modes:
- Background colors (--background, --card, --popover)
- Text colors (--foreground, --muted-foreground)
- Accent colors (--primary, --secondary, --accent)
- State colors (--destructive)
- Chart colors (--chart-1 through --chart-5)

## Utility Classes

### Layout
- `.dashboard-grid`: Adds subtle grid background for alignment
- `.surface-smooth`: Applies elevation and hover effects to cards
- `.content-spacing`: Consistent padding for content sections
- `.stack-vertical`: Vertical spacing between children
- `.stack-horizontal`: Horizontal spacing between children

### Typography
- `.text-balance`: Improves text wrapping for headings
- `.font-lato`: Applies Lato font family

### Components
Cards and interactive elements use consistent styling:
- Border radius: var(--radius)
- Shadow: Multiple layers for depth
- Hover states: Subtle elevation change
- Transitions: 200ms ease for smooth interactions

## Dark Mode
Dark mode is implemented using a separate set of CSS variables under the `.dark` class. The color scheme maintains contrast ratios while reducing eye strain.

## Using the Theme
1. Wrap content in proper containers
2. Use utility classes for spacing and layout
3. Apply semantic color variables instead of hard-coded values
4. Use the spacing scale for margins and padding
5. Leverage the grid system for alignment

## Best Practices
1. Maintain the 8px grid
2. Use semantic color variables
3. Apply consistent spacing
4. Test in both light and dark modes
5. Keep hover states subtle
6. Use transitions for interactions