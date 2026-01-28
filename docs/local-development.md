# Local Development Setup

This guide walks you through cloning DHMarginalia and running it on your own machine.

## Prerequisites

- **Node.js** version 18 or later (20+ recommended). Download from [nodejs.org](https://nodejs.org/).
- **npm** (included with Node.js).
- **Git** for cloning the repository.

Verify your setup:

```bash
node --version   # should print v18.x or higher
npm --version    # should print 9.x or higher
git --version
```

## 1. Clone the Repository

```bash
git clone https://github.com/shawngraham/DHMarginalia.git
cd DHMarginalia
```

If you are starting from your own fork or template copy, clone that URL instead.

## 2. Install Dependencies

```bash
npm install
```

This installs all runtime and development dependencies defined in `package.json`, including Vite, Arquero, Graphology, Scrollama, and the test framework.

## 3. Start the Development Server

```bash
npm run dev
```

Vite will start a local server, typically at `http://localhost:5173`. Open that URL in your browser. The page will hot-reload whenever you save a change to any source file, CSS, or the `config.yaml`.

## 4. Project Structure

```
DHMarginalia/
├── config.yaml              ← Your project configuration (metadata, story, dashboard)
├── data/                    ← Your CSV data files
│   └── letters.csv
├── assets/                  ← Images and static files for your project
│   └── project_images/
├── index.html               ← Entry point (usually no need to edit)
├── src/
│   ├── main.js              ← App orchestrator
│   ├── engine/              ← Data processing (CSV parsing, dates, network, transforms)
│   ├── components/          ← Visual components (timeline, network, search, text cards)
│   └── themes/              ← CSS variables and theme provider
├── .github/workflows/       ← GitHub Actions deployment config
├── package.json
└── vite.config.js
```

### What You Edit (as a Scholar)

Most of the time you only need to touch two things:

1. **`config.yaml`** — defines your title, data source, column mappings, story steps, and dashboard panels.
2. **`data/`** — your CSV file(s).

You do not need to write any JavaScript.

## 5. Editing Your Config

Open `config.yaml` in any text editor. The three required sections are:

```yaml
metadata:
  title: "My Project Title"
  author: "Your Name"
  theme: serif          # serif | sans | sepia | dark

data:
  csv: data/my_data.csv
  columns:
    date: date_column
    source: sender_column
    target: recipient_column
    text: body_column

story:
  - layout: full-width
    text: |
      # Introduction
      Write your narrative here using Markdown.

  - text: "Scroll step describing the network."
    view: network
    title: "My Network"
```

Save the file and the browser will reload automatically.

## 6. Running Tests

```bash
npm test            # Run all unit tests once
npm run test:watch  # Re-run tests on every file change
```

Tests live in `src/engine/__tests__/`. They cover date parsing, CSV loading, network processing, config validation, and the transformation mapper.

## 7. Building for Production

```bash
npm run build
```

This creates a `dist/` directory containing the static site. To preview the built output locally:

```bash
npm run preview
```

This serves `dist/` at `http://localhost:4173` with the correct base path.

**Do not** use `python -m http.server` or similar generic servers on the `dist/` folder — use `npm run preview` instead, which respects the Vite base path configuration.

## 8. Deploying to GitHub Pages

1. Push your changes to the `main` branch.
2. In your GitHub repository, go to **Settings > Pages**.
3. Set the **Source** to **"GitHub Actions"** (not "Deploy from a branch").
4. The included `.github/workflows/deploy.yml` will automatically build and deploy on every push to `main`.

## 9. Dev Mode / Validation Card

Append `?dev=true` to your URL to see the **Data Health Report** card:

```
http://localhost:5173/?dev=true
```

This overlay shows missing values, column mapping issues, and catches typos in your `config.yaml` view types.

## 10. Common Issues

| Problem | Solution |
|---------|----------|
| `npm install` fails | Make sure you have Node.js 18+. Delete `node_modules/` and `package-lock.json`, then run `npm install` again. |
| CSV not loading in dev | Check that the `csv:` path in `config.yaml` is relative (e.g. `data/letters.csv`, not `/data/letters.csv`). |
| Blank page after build | Run `npm run preview` instead of a generic HTTP server. |
| GitHub Pages shows raw source | Go to Settings > Pages and change Source to "GitHub Actions". |
| Theme not applying | Check that `theme:` in `config.yaml` is one of: `serif`, `sans`, `sepia`, `dark`. |
