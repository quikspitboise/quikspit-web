# QuikSpit Shine - Theming Guidelines

## Brand Colors & Theme

### Color Palette
QuikSpit Shine uses a dark theme with the following brand colors:

- **Primary Background**: `brand-charcoal` (#1a1a1a) - Dark charcoal background
- **Secondary Background**: `brand-charcoal-light` (#2a2a2a) - Slightly lighter charcoal for cards/containers
- **Primary Text**: White (`text-white`) for headings and primary content
- **Secondary Text**: `text-neutral-300` for body text and descriptions
- **Muted Text**: `text-neutral-400` for less important information
- **Accent Color**: `brand-red` (#ef4444) - Red accents for buttons, icons, and highlights
- **Border Color**: `border-neutral-600` for subtle borders and dividers

### Typography Hierarchy
- **Headlines**: `text-white` with appropriate font weights
- **Body Text**: `text-neutral-300` for readability
- **Muted Text**: `text-neutral-400` for secondary information
- **Links**: `text-red-600` with `hover:underline` for interaction

### Component Styling Standards

#### Cards & Containers
```tsx
className="bg-brand-charcoal-light p-6 rounded-xl shadow-lg border border-neutral-600"
```

#### Buttons
**Primary Button (Red):**
```tsx
className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-800"
```

**Secondary Button (Outline):**
```tsx
className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-brand-charcoal"
```

#### Form Elements
**Input Fields:**
```tsx
className="w-full px-4 py-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 focus:outline-none transition-all duration-200"
```

**Labels:**
```tsx
className="block text-sm font-medium text-neutral-300 mb-2"
```

#### Icons & Accents
- Use `text-red-600` for accent icons
- Icon backgrounds: `bg-red-600/10` for subtle red background
- Checkmarks and success indicators: `text-red-600`

#### Navigation
- Background: `bg-brand-charcoal`
- Active/hover states: `text-red-600`
- Default text: `text-white`
- Mobile menu: Same dark theme with red accents

### Accessibility Guidelines

#### Focus States
Always include focus rings for interactive elements:
```tsx
focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-800
```

#### Color Contrast
- Ensure sufficient contrast between text and background colors
- Primary text (white) on dark backgrounds meets WCAG standards
- Red accent color (#ef4444) provides good contrast on dark backgrounds
- Use `text-neutral-300` instead of pure white for body text to reduce eye strain

#### Interactive Elements
- All buttons and links should have clear hover and focus states
- Use consistent transition timing: `transition-all duration-200`
- Provide visual feedback for all interactive components

### Layout Standards

#### Spacing
- Use consistent padding: `p-6` or `p-8` for cards
- Margins: `mb-6`, `mb-8` for section spacing
- Grid gaps: `gap-6` or `gap-8` for card layouts

#### Responsive Design
- Use responsive grid classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Ensure touch targets are adequate on mobile devices
- Test dark theme on various screen sizes

### Implementation Notes

#### Tailwind Configuration
The project uses custom brand colors defined in `tailwind.config.ts`:
```javascript
colors: {
  'brand-charcoal': '#1a1a1a',
  'brand-charcoal-light': '#2a2a2a',
  'brand-red': '#ef4444',
}
```

#### Global Styles
Dark theme is applied globally in `globals.css` with:
- Dark body background
- White text as default
- Red accent colors for interactive elements

### Code Review Checklist

When reviewing or writing code for QuikSpit Shine:

1. ✅ Use dark backgrounds (`brand-charcoal` or `brand-charcoal-light`)
2. ✅ Apply white text for headings, neutral-300 for body text
3. ✅ Use red accents for buttons, icons, and interactive elements
4. ✅ Include proper focus states with red focus rings
5. ✅ Ensure consistent border colors (`border-neutral-600`)
6. ✅ Use consistent spacing and responsive design patterns
7. ✅ Test accessibility and color contrast
8. ✅ Apply consistent transition effects for smooth interactions

### Examples

#### Service Card Pattern
```tsx
<div className="bg-brand-charcoal-light p-6 rounded-xl shadow-lg border border-neutral-600 text-center">
  <div className="bg-red-600/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
    <svg className="w-8 h-8 text-red-600" {...iconProps}>
      {/* Icon content */}
    </svg>
  </div>
  <h3 className="text-xl font-semibold text-white mb-3">Service Title</h3>
  <p className="text-neutral-300 mb-4">Service description text</p>
  <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200">
    Book Now
  </button>
</div>
```

This ensures all future development maintains the consistent dark theme with red accents that matches the QuikSpit Shine brand identity.
