## Phase 1: Foundation & Project Scaffolding
- [ ] Initialize Vite project with a "Template" structure.
- [ ] Set up directory structure: `/data`, `/assets`, `/src/components`, `/src/engine`.
- [ ] Integrate a YAML parser (`js-yaml`).
- [ ] Create a "Theme Provider" (CSS variables for Serif, Sans, Sepia, Dark mode).
- [ ] Create basic GitHub Action to automate Vite build to GH Pages.

## Phase 2: The Data Engine (The "Brain")
- [ ] Build the **Inference Engine**:
    - [ ] CSV to Arquero Table conversion.
    - [ ] Logic to detect/parse dates from messy strings.
    - [ ] Logic to extract unique Nodes from Source/Target columns.
- [ ] Build the **Network Processor**:
    - [ ] Integrate Graphology to calculate Betweenness Centrality.
    - [ ] Implement a Web Worker for centrality calculation (for performance).
- [ ] Build the **Transformation Mapper**:
    - [ ] Translate YAML `filter`, `sort`, and `group_by` keys into Arquero function calls.

## Phase 3: Component Library (The "Cards")
- [ ] **Timeline Card:** Implement an Observable Plot histogram with binned dates.
- [ ] **Network Card:** Implement a force-directed graph (Sigma.js or D3).
- [ ] **Search & Filter Card:** 
    - [ ] Build a global search bar.
    - [ ] Build a faceted filter sidebar based on YAML categories.
- [ ] **Text/Gallery Card:** 
    - [ ] Create a viewer for "Close Reading" (transcription + image).
    - [ ] Add Markdown rendering for long-form content.

## Phase 4: Scrollytelling Implementation
- [ ] Integrate **Scrollama.js** to track scroll progress.
- [ ] Create the **Narrative Layout**:
    - [ ] Sticky visual container (Right/Left).
    - [ ] Scrolling text container.
- [ ] Implement "Trigger" logic: As a user scrolls to Step X, apply Transform X to Visual Y.
- [ ] Implement image transition logic (fade-in/out for narrative images).

## Phase 5: User Experience & DX (Developer Experience)
- [ ] Build the **Validation Card**:
    - [ ] Check CSV against YAML mapping.
    - [ ] UI feedback for "Data Health" (missing values, types).
- [ ] Create the **Local Preview** documentation (e.g., `npm run dev` or `python server`).
- [ ] Write a `README.md` guide for scholars on how to structure their CSV.

## Phase 6: Testing & Optimization
- [ ] Test with a "Standard" DH dataset (e.g., Republic of Letters sample).
- [ ] Optimize network rendering for >1,000 nodes.
- [ ] Finalize mobile responsiveness (stacking visuals instead of side-by-side).

---

### First Milestone Goal
**The "Hello World" of DH:**
Build a version that takes a CSV of 50 letters, a `config.yaml`, and generates a site that:
1. Shows an intro markdown block.
2. Scrolls into a Network view filtered to the first 10 years.
3. Scrolls into a Timeline of the full dataset.
4. Deploys successfully via GitHub Actions.
