/**
 * Theme Provider — applies theme from config to <html> element.
 * Supported themes: "serif" (default), "sans", "sepia", "dark"
 */

const VALID_THEMES = ['serif', 'sans', 'sepia', 'dark'];

export function applyTheme(themeName) {
  const theme = (themeName || 'serif').toLowerCase();

  if (theme === 'serif') {
    // Default theme — remove data-theme attribute
    document.documentElement.removeAttribute('data-theme');
  } else if (VALID_THEMES.includes(theme)) {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    console.warn(`Unknown theme "${themeName}". Using default (serif). Valid themes: ${VALID_THEMES.join(', ')}`);
    document.documentElement.removeAttribute('data-theme');
  }
}

export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'serif';
}
