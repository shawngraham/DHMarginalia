# Extending DHMarginalia

This guide explains how to add new visual components, data transforms, and features to DHMarginalia. It assumes familiarity with JavaScript and the project structure described in the [Local Development](./local-development.md) guide.

## Architecture Overview

DHMarginalia follows a pipeline architecture:

```
config.yaml → configLoader → dataLoader → transformMapper → components → DOM
                                  ↓
                           dateParser / networkProcessor
```

1. **`config.yaml`** defines what data to load, how to map columns, and what story steps / dashboard panels to render.
2. **`src/engine/`** handles all data processing — loading, parsing, transforming.
3. **`src/components/`** renders visual components into DOM containers.
4. **`src/main.js`** orchestrates the flow: load config → load data → parse dates → init scrollytelling → render dashboard.

## Adding a New View Type

Suppose you want to add a "map" view. Three steps:

### Step 1: Create the Component

Create `src/components/mapCard.js`:

```js
/**
 * Renders a map visualization into the given container.
 * @param {HTMLElement} container - DOM element to render into.
 * @param {object[]} data - Array of row objects from the Arquero table.
 * @param {object} options - Configuration from the story step or dashboard panel.
 */
export function createMapCard(container, data, options = {}) {
  const { title = 'Map', latColumn = 'lat', lngColumn = 'lng' } = options;

  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card';

  const titleEl = document.createElement('p');
  titleEl.className = 'card-title';
  titleEl.textContent = title;
  card.appendChild(titleEl);

  // Your map rendering logic here (e.g., Leaflet, Mapbox, or plain SVG)
  const mapDiv = document.createElement('div');
  mapDiv.style.height = '400px';
  // ... initialize your map library ...
  card.appendChild(mapDiv);

  container.appendChild(card);
}
```

Every component follows the same pattern:
- Receives a DOM container, data, and an options object.
- Clears the container, creates a `.card` wrapper, renders into it.
- Uses CSS custom properties from the theme (e.g., `var(--color-accent)`).

### Step 2: Register It in main.js

Open `src/main.js` and:

1. Import your component:

```js
import { createMapCard } from './components/mapCard.js';
```

2. Add a `case` to the `renderVisual` switch statement:

```js
case 'map':
  createMapCard(container, stepData.objects(), {
    latColumn: colMap.lat || 'lat',
    lngColumn: colMap.lng || 'lng',
    title: stepConfig.title || 'Map',
  });
  break;
```

### Step 3: Use It in config.yaml

```yaml
story:
  - text: "Here is a map of the correspondence locations."
    view: map
    title: "Letter Origins"

data:
  columns:
    lat: latitude
    lng: longitude
```

If you installed a new library (e.g., Leaflet), add it with `npm install leaflet` first.

## Adding a New Data Transform

The transformation mapper (`src/engine/transformMapper.js`) translates YAML transform objects into Arquero operations. To add a new transform type:

### Example: Adding a `limit` Transform

Open `src/engine/transformMapper.js` and add handling inside the `applyTransform` function:

```js
export function applyTransform(table, transform) {
  if (!transform) return table;
  let result = table;

  if (transform.filter) {
    result = applyFilter(result, transform.filter);
  }
  if (transform.sort) {
    result = applySort(result, transform.sort);
  }
  if (transform.group_by) {
    result = applyGroupBy(result, transform.group_by, transform.rollup);
  }
  if (transform.select) {
    result = result.select(transform.select);
  }

  // New: limit the number of rows
  if (transform.limit) {
    result = result.slice(0, transform.limit);
  }

  return result;
}
```

Then use it in `config.yaml`:

```yaml
story:
  - text: "The first 10 letters."
    view: search
    title: "First 10"
    transform:
      sort: date
      limit: 10
```

### Writing Tests for Your Transform

Add a test in `src/engine/__tests__/transformMapper.test.js`:

```js
it('limits rows with the limit transform', () => {
  const result = applyTransform(sampleTable, { limit: 2 });
  expect(result.numRows()).toBe(2);
});
```

Run with `npm test` to verify.

## Adding a New Date Format

The fuzzy date parser (`src/engine/dateParser.js`) handles formats like `c. 1850`, `1850?`, `Winter 1914`, etc. To support a new format:

Open `src/engine/dateParser.js` and add a parsing branch inside `parseFuzzyDate()`, before the final "unparseable" return. For example, to handle "early 18th century":

```js
// Century expressions: "early 18th century"
const centuryMatch = cleaned.match(/^(early|mid|late)\s+(\d+)(?:st|nd|rd|th)\s+century$/i);
if (centuryMatch) {
  const period = centuryMatch[1].toLowerCase();
  const centuryNum = parseInt(centuryMatch[2], 10);
  const baseYear = (centuryNum - 1) * 100;
  const offsets = { early: 15, mid: 50, late: 85 };
  const year = baseYear + (offsets[period] || 50);
  return { date: new Date(year, 6, 1), approximate: true, original: raw };
}
```

Then add a test in `src/engine/__tests__/dateParser.test.js`:

```js
it('parses "early 18th century"', () => {
  const result = parseFuzzyDate('early 18th century');
  expect(result.date).not.toBeNull();
  expect(result.date.getFullYear()).toBe(1715);
  expect(result.approximate).toBe(true);
});
```

## Adding New Column Mappings

The `data.columns` section of `config.yaml` maps semantic roles to CSV column names:

```yaml
data:
  columns:
    date: my_date_col
    source: sender
    target: recipient
    text: letter_body
```

To add a new role (e.g., `location` for a map component):

1. Add the mapping in `config.yaml`:

```yaml
data:
  columns:
    location: place_name
    lat: latitude
    lng: longitude
```

2. Access it in your component via the `colMap` object passed from `main.js`:

```js
case 'map':
  createMapCard(container, stepData.objects(), {
    latColumn: colMap.lat || 'lat',
    lngColumn: colMap.lng || 'lng',
  });
  break;
```

## Adding Config Validation

To validate new config fields, edit `src/engine/configLoader.js` and add checks inside `validateConfig()`:

```js
export function validateConfig(config) {
  const errors = [];

  // ... existing checks ...

  // Validate your new section
  if (config.map && !config.data?.columns?.lat) {
    errors.push('Map view requires "data.columns.lat" to be set.');
  }

  // ...
}
```

The validation card (`src/components/validationCard.js`) will automatically display these errors when `?dev=true` is in the URL.

## Adding New Dashboard Panel Types

Dashboard panels and story steps use the same `renderVisual` function and component library. Any view type that works in `story:` steps also works in `dashboard:` panels:

```yaml
dashboard:
  - view: map
    title: "All Locations"

  - view: timeline
    title: "Date Distribution"
    transform:
      filter: "year > 1800"
```

## Working with the Web Worker

Network centrality is computed in a Web Worker (`src/engine/centralityWorker.js`) to avoid blocking the UI. If you need to add another expensive computation:

1. Create a new worker file, e.g., `src/engine/myWorker.js`:

```js
self.onmessage = function (event) {
  const { data } = event.data;
  // ... expensive computation ...
  self.postMessage({ result });
};
```

2. Use it from a component:

```js
const worker = new Worker(
  new URL('../engine/myWorker.js', import.meta.url),
  { type: 'module' }
);
worker.postMessage({ data: myData });
worker.onmessage = (e) => {
  const { result } = e.data;
  // ... use the result ...
};
```

Vite handles the worker bundling automatically when you use `new URL(...)` with `import.meta.url`.

## File-by-File Reference

| File | Purpose | Key Exports |
|------|---------|-------------|
| `src/main.js` | App orchestrator, routes views | `main()`, `renderVisual()` |
| `src/engine/configLoader.js` | YAML parsing and validation | `loadConfig()`, `validateConfig()` |
| `src/engine/dataLoader.js` | CSV → Arquero table | `loadCSV()`, `parseCSV()`, `dataHealthReport()` |
| `src/engine/dateParser.js` | Fuzzy date string parsing | `parseFuzzyDate()`, `parseDateColumn()` |
| `src/engine/networkProcessor.js` | Graph construction and centrality | `extractNetwork()`, `computeCentrality()`, `buildNetwork()` |
| `src/engine/transformMapper.js` | YAML transforms → Arquero ops | `applyTransform()`, `deriveDates()` |
| `src/engine/centralityWorker.js` | Web Worker for centrality | (worker, no exports) |
| `src/components/timelineCard.js` | SVG histogram of dates | `createTimelineCard()` |
| `src/components/networkCard.js` | D3-Force network graph | `createNetworkCard()` |
| `src/components/searchCard.js` | Search bar + faceted filters | `createSearchCard()` |
| `src/components/textCard.js` | Markdown / close reading / gallery | `createTextCard()` |
| `src/components/scrollytelling.js` | Scrollama integration | `initScrollytelling()` |
| `src/components/validationCard.js` | Dev-mode data health overlay | `createValidationCard()` |
| `src/themes/variables.css` | CSS custom properties for all themes | (CSS, no exports) |
| `src/themes/themeProvider.js` | Sets `data-theme` on `<html>` | `applyTheme()`, `getCurrentTheme()` |
