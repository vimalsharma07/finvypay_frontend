# SVG Components

This directory contains React components for SVG illustrations used throughout the application.

## Structure

SVGs are organized in the following way:

```
components/svg/
  ├── index.ts              # Centralized exports
  ├── two-factor-authentication.tsx
  ├── [module-name].tsx     # Other SVG components
  └── README.md

public/media/svg/
  ├── authentication/       # Raw SVG files organized by module
  │   └── two-factor-authentication.svg
  ├── payments/
  ├── dashboard/
  └── [other-modules]/
```

## Usage

1. **Store raw SVG files** in `public/media/svg/[module-name]/` organized by category/module
2. **Create React components** in `components/svg/` for each SVG
3. **Export from index.ts** for easy imports
4. **Import and use** in your components:

```tsx
import { TwoFactorAuthenticationSvg } from '@/components/svg';

function MyComponent() {
  return (
    <div>
      <TwoFactorAuthenticationSvg className="w-full h-auto" />
    </div>
  );
}
```

## Adding New SVGs

1. Add the raw SVG file to `public/media/svg/[category]/[name].svg`
2. Create a new component file: `components/svg/[name].tsx`
3. Convert the SVG to a React component (inline the SVG code)
4. Export it from `components/svg/index.ts`
5. Use it in your components

## Benefits

- **Type Safety**: TypeScript support for props
- **Tree Shaking**: Only used SVGs are included in the bundle
- **Reusability**: Easy to reuse across components
- **Styling**: Pass className and other props for customization
- **Performance**: SVGs are inlined (no additional HTTP requests)

## Naming Convention

- Component files: `kebab-case.tsx` (e.g., `two-factor-authentication.tsx`)
- Component names: `PascalCase` (e.g., `TwoFactorAuthenticationSvg`)
- Raw SVG files: `kebab-case.svg` (e.g., `two-factor-authentication.svg`)

