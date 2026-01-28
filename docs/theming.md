# Theming Guide

DHMarginalia uses CSS custom properties (variables) for all visual styling. You can switch between built-in themes or create your own without touching any JavaScript.

## Choosing a Built-in Theme

Set the `theme` field in `config.yaml`:

```yaml
metadata:
  title: "My Project"
  theme: serif    # Options: serif, sans, sepia, dark
```

### Available Themes

#### `serif` (default)

The archival/scholarly theme. Georgia typefaces, warm cream background, brown accents.

- Background: `#fefcf7` (warm cream)
- Text: `#2c2c2c` (near-black)
- Accent: `#8b4513` (saddle brown)
- Fonts: Georgia, Times New Roman

#### `sans`

A clean, modern theme. Helvetica typefaces, white background, blue accents.

- Background: `#ffffff` (white)
- Text: `#1a1a1a` (near-black)
- Accent: `#2563eb` (blue)
- Fonts: Helvetica Neue, Arial

#### `sepia`

A warm, parchment-like theme. Palatino typefaces, deep sepia tones.

- Background: `#f4ecd8` (parchment)
- Text: `#3e2a13` (dark brown)
- Accent: `#6d4c2a` (bronze)
- Fonts: Palatino Linotype, Book Antiqua

#### `dark`

A dark-mode theme for reduced eye strain. Georgia typefaces, dark navy background, amber accents.

- Background: `#1a1a2e` (dark navy)
- Text: `#e0e0e0` (light gray)
- Accent: `#e0a458` (amber)
- Fonts: Georgia, Times New Roman

## How Theming Works

The theme system is in two files:

1. **`src/themes/variables.css`** — defines all CSS custom properties under `:root` (default) and `[data-theme="..."]` selectors.
2. **`src/themes/themeProvider.js`** — reads the theme name from config and sets the `data-theme` attribute on the `<html>` element.

When the app loads, it calls `applyTheme("sans")` (or whichever theme is in your config), which sets `<html data-theme="sans">`. The CSS custom properties under `[data-theme="sans"]` then override the `:root` defaults.

## Creating a Custom Theme

### Step 1: Add a CSS Block

Open `src/themes/variables.css` and add a new `[data-theme]` block at the end (before the base reset section):

```css
/* Theme: Midnight */
[data-theme="midnight"] {
  --font-heading: 'Iowan Old Style', 'Palatino Linotype', serif;
  --font-body: 'Iowan Old Style', 'Palatino Linotype', serif;

  --color-bg: #0d1117;
  --color-surface: #161b22;
  --color-text: #c9d1d9;
  --color-text-muted: #8b949e;
  --color-accent: #58a6ff;
  --color-accent-light: #a5d6ff;
  --color-border: #30363d;
  --color-highlight: #1f2937;

  --color-link: #58a6ff;
  --color-link-hover: #79c0ff;
}
```

### Step 2: Register the Theme Name

Open `src/themes/themeProvider.js` and add your theme name to the `VALID_THEMES` array:

```js
const VALID_THEMES = ['serif', 'sans', 'sepia', 'dark', 'midnight'];
```

### Step 3: Use It

Set it in `config.yaml`:

```yaml
metadata:
  theme: midnight
```

## Complete List of CSS Variables

Every variable below can be overridden in a theme block. All components use these variables, so changing them affects the entire site consistently.

### Typography

| Variable | Purpose | Default (serif) |
|----------|---------|-----------------|
| `--font-heading` | Headings (h1–h6) | Georgia, Times New Roman, serif |
| `--font-body` | Body text | Georgia, Times New Roman, serif |
| `--font-mono` | Code blocks | Courier New, monospace |

### Colors

| Variable | Purpose | Default (serif) |
|----------|---------|-----------------|
| `--color-bg` | Page background | `#fefcf7` |
| `--color-surface` | Card/panel backgrounds | `#fff` |
| `--color-text` | Primary text | `#2c2c2c` |
| `--color-text-muted` | Secondary/caption text | `#6b6b6b` |
| `--color-accent` | Buttons, highlights, node colors | `#8b4513` |
| `--color-accent-light` | Lighter accent (hover states) | `#d2a679` |
| `--color-border` | Card borders, dividers | `#d4c5a9` |
| `--color-highlight` | Selected/highlighted areas | `#f5e6c8` |
| `--color-link` | Link text | `#5b3a1a` |
| `--color-link-hover` | Link hover state | `#8b4513` |

### Spacing

| Variable | Purpose | Default |
|----------|---------|---------|
| `--spacing-xs` | Tight spacing | `0.25rem` |
| `--spacing-sm` | Small spacing | `0.5rem` |
| `--spacing-md` | Standard spacing | `1rem` |
| `--spacing-lg` | Large spacing | `2rem` |
| `--spacing-xl` | Section spacing | `4rem` |

### Layout

| Variable | Purpose | Default |
|----------|---------|---------|
| `--max-width` | Maximum page width | `72rem` |
| `--narrative-width` | Scrollytelling text column width | `38rem` |
| `--sidebar-width` | Sidebar/visual column width | `28rem` |

### Effects

| Variable | Purpose | Default |
|----------|---------|---------|
| `--radius` | Border radius | `4px` |
| `--shadow` | Standard box shadow | `0 1px 3px rgba(0,0,0,0.08)` |
| `--shadow-lg` | Elevated shadow (validation card, modals) | `0 4px 12px rgba(0,0,0,0.1)` |
| `--transition` | Animation duration and easing | `0.3s ease` |

## Using Custom Fonts

If you want to use a web font (e.g., from Google Fonts), add a `<link>` tag to `index.html`:

```html
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./src/themes/variables.css" />
</head>
```

Then reference it in your theme:

```css
[data-theme="garamond"] {
  --font-heading: 'EB Garamond', serif;
  --font-body: 'EB Garamond', serif;
}
```

## Responsive Behavior

The themes include a media query at `768px` that stacks the scrollytelling layout vertically on small screens. The sticky visual container becomes a `50vh` block above the text instead of a sidebar. This behavior is built into the base CSS and applies to all themes automatically.
