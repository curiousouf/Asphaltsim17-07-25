# shadcn/ui Setup Documentation

## Overview

This project now includes shadcn/ui components integrated with TailwindCSS. The setup includes:

- **TailwindCSS 3.4.17** with shadcn/ui configuration
- **CSS Variables** for theming (light/dark mode support)
- **Button component** with multiple variants and sizes
- **Proper TypeScript** configuration with path aliases

## Project Structure

```
src/
├── components/
│   └── ui/
│       ├── button.tsx      # Button component
│       └── index.ts        # Component exports
├── lib/
│   └── utils.ts           # Utility functions (cn helper)
├── index.css              # Global styles with CSS variables
├── main.tsx               # App entry point
└── App.tsx                # Main component with examples
```

## Configuration Files

- `components.json` - shadcn/ui configuration
- `tailwind.config.js` - TailwindCSS with shadcn/ui theme
- `tsconfig.json` - TypeScript with path aliases (@/\*)
- `vite.config.ts` - Vite with path resolution

## Button Component Usage

### Basic Usage

```tsx
import { Button } from "@/components/ui/button";

<Button>Click me</Button>;
```

### Variants

- `default` - Primary button (default)
- `destructive` - Destructive actions
- `outline` - Outlined button
- `secondary` - Secondary button
- `ghost` - Transparent button
- `link` - Link-styled button

### Sizes

- `default` - Standard size (default)
- `sm` - Small button
- `lg` - Large button
- `icon` - Icon button (square)

### Examples

```tsx
<Button variant="outline" size="sm">Small Outline</Button>
<Button variant="destructive" size="lg">Large Destructive</Button>
<Button variant="ghost">Ghost Button</Button>
```

## Theme Support

The setup includes CSS variables for light/dark mode theming:

- Light mode: Default theme
- Dark mode: Add `dark` class to html element

## Adding More Components

To add more shadcn/ui components:

1. Create component files in `src/components/ui/`
2. Follow the same pattern as the Button component
3. Export from `src/components/ui/index.ts`
4. Use the `cn` utility for className merging

## Dependencies Used

- `@radix-ui/react-slot` - For asChild prop support
- `class-variance-authority` - For component variants
- `clsx` - For conditional classes
- `tailwind-merge` - For TailwindCSS class merging
- `tailwindcss-animate` - For animations
