## Phase 1: Foundation & Project Scaffolding
- [x] Initialize Vite project with a "Template" structure.
- [x] Set up directory structure: `/data`, `/assets`, `/src/components`, `/src/engine`.
- [x] Integrate a YAML parser (`js-yaml`).
- [x] Create a "Theme Provider" (CSS variables for Serif, Sans, Sepia, Dark mode).
- [x] Create basic GitHub Action to automate Vite build to GH Pages.

## Phase 2: The Data Engine (The "Brain")
- [x] Build the **Inference Engine**:
    - [x] CSV to Arquero Table conversion (`src/engine/dataLoader.js`).
    - [x] Logic to detect/parse dates from messy strings (`src/engine/dateParser.js`).
    - [x] Logic to extract unique Nodes from Source/Target columns (`src/engine/networkProcessor.js`).
- [x] Build the **Network Processor**:
    - [x] Integrate Graphology to calculate Betweenness Centrality (`src/engine/networkProcessor.js`).
    - [x] Implement a Web Worker for centrality calculation (`src/engine/centralityWorker.js`).
- [x] Build the **Transformation Mapper**:
    - [x] Translate YAML `filter`, `sort`, and `group_by` keys into Arquero function calls (`src/engine/transformMapper.js`).

## Phase 3: Component Library (The "Cards")
- [x] **Timeline Card:** Implement SVG histogram with binned dates (`src/components/timelineCard.js`).
- [x] **Network Card:** Implement a force-directed graph with D3-Force (`src/components/networkCard.js`).
- [x] **Search & Filter Card:**
    - [x] Build a global search bar (`src/components/searchCard.js`).
    - [x] Build a faceted filter sidebar based on YAML categories.
- [x] **Text/Gallery Card:**
    - [x] Create a viewer for "Close Reading" (transcription + image) (`src/components/textCard.js`).
    - [x] Add Markdown rendering for long-form content.

## Phase 4: Scrollytelling Implementation
- [x] Integrate **Scrollama.js** to track scroll progress (`src/components/scrollytelling.js`).
- [x] Create the **Narrative Layout**:
    - [x] Sticky visual container (Right/Left).
    - [x] Scrolling text container.
- [x] Implement "Trigger" logic: As a user scrolls to Step X, apply Transform X to Visual Y.
- [x] Implement image transition logic (fade-in/out for narrative images).

## Phase 5: User Experience & DX (Developer Experience)
- [x] Build the **Validation Card** (`src/components/validationCard.js`):
    - [x] Check CSV against YAML mapping.
    - [x] UI feedback for "Data Health" (missing values, types).
- [x] Create the **Local Preview** documentation (`npm run dev`).
- [x] Write a `README.md` guide for scholars on how to structure their CSV.

## Phase 6: Testing & Optimization
- [x] Test with a "Standard" DH dataset (Republic of Letters sample in `data/letters.csv`).
- [x] Optimize network rendering for >1,000 nodes (top-N labeling, tail grouping).
- [x] Finalize mobile responsiveness (stacking visuals instead of side-by-side).

## Documentation
- [x] Write comprehensive documentation explaining how to set up to develop locally (`docs/local-development.md`)
- [x] Write comprehensive documentation explaining how to theme (`docs/theming.md`)
- [x] Write comprehensive documentation explaining how to extend (`docs/extending.md`)

---

### First Milestone Goal
**The "Hello World" of DH:**
Build a version that takes a CSV of 50 letters, a `config.yaml`, and generates a site that:
1. Shows an intro markdown block.
2. Scrolls into a Network view filtered to the first 10 years.
3. Scrolls into a Timeline of the full dataset.
4. Deploys successfully via GitHub Actions.
