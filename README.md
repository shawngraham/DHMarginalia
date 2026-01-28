# DHMarginalia

A zero-code, YAML-driven scrollytelling dashboard for Digital Humanities scholars. Transform structured CSV data into argumentative, narrative web publications with network analysis, timelines, and close reading views.

## Quick Start

```bash
npm install
npm run dev      # Local preview at http://localhost:5173
npm run build    # Production build to dist/
npm test         # Run unit tests
```

## How It Works

1. Place your data in `data/` as a CSV file.
2. Edit `config.yaml` to define your metadata, column mappings, narrative story steps, and dashboard panels.
3. Run `npm run dev` to preview locally, or push to GitHub for automatic deployment via GitHub Pages.

## CSV Structure

Your primary CSV should include columns for dates, sources/targets (for networks), and text content. Example:

| Column | Description |
|--------|-------------|
| `date` | Date of the record (supports fuzzy formats: `c. 1850`, `1850?`, `Winter 1914`) |
| `source` | Sender / origin entity (used for network graphs) |
| `target` | Recipient / destination entity |
| `body` | Full text content of the record |

## Privacy Warning

This is a static site deployed to GitHub Pages. **All data in your CSV is public**, even if it is not explicitly displayed in a chart. Do not include sensitive personal data or PII in your data files.

## Themes

Set the `theme` field in `config.yaml` to one of: `serif` (default), `sans`, `sepia`, `dark`.

## Deployment

Push to the `main` branch and GitHub Actions will automatically build and deploy to GitHub Pages.
