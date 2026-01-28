# Part 1: Comprehensive Scoping Document

## 1. Project Objective
To create a "Zero-Code" (YAML-driven) static dashboard template that allows Humanities scholars to transform structured data (CSV) into argumentative, scrollytelling web publications. The focus is on ease of deployment, archival aesthetics, and specific DH methods (Network Analysis, Timeline, and Close Reading).

## 2. Technical Stack
*   **Core Framework:** Vite (for fast builds and modern JS environment).
*   **Data Engine:** 
    *   **Arquero:** For "Verbs" (filter, group_by, count, join).
    *   **PapaParse:** For robust CSV parsing.
    *   **Graphology:** For network logic (Betweenness Centrality).
*   **Visualization Layer:** 
    *   **Observable Plot:** For expressive, academic-grade charts (Timeline, Barcharts).
    *   **Sigma.js / D3-Force:** For interactive network rendering.
*   **Narrative Engine:** **Scrollama.js** for scroll-driven events.
*   **Deployment:** GitHub Actions + GitHub Pages.

## 3. Data & Configuration Architecture
### 3.1 Data Ingestion
*   **Primary Input:** A single "flat" CSV (e.g., `letters.csv`).
*   **Relational Input:** Optional `edges.csv` for explicit network definitions.
*   **Network Inference:** If only one CSV is provided, the system treats `source` and `target` columns as edges and automatically generates a node list with calculated centrality scores.

### 3.2 YAML Configuration
The `config.yaml` acts as the Controller. It defines:
1.  **Metadata:** Title, Author, Theme.
2.  **Global Mapping:** Identifying which columns represent dates, names, and text.
3.  **The Story:** A sequence of markdown blocks and "steps" that trigger data transformations and visual views.
4.  **The Dashboard:** Post-narrative interactive views for exploratory search.

## 4. Feature Requirements
*   **Narrative Flow:** Support for "Split-Screen" (text on left, visual on right) and "Full-Width" (narrative interludes).
*   **Image Handling:** 
    *   *Narrative Images:* Static assets referenced in YAML.
    *   *Data Images:* Dynamic images pulled from URLs in the CSV (e.g., IIIF manifests).
*   **DH Logic:** 
    *   Fuzzy date parsing (handling "c. 1850" or years-only).
    *   Network centrality calculations performed in a Web Worker (to prevent UI freezing).
*   **Validation Card:** A development-only UI component that flags data schema errors, missing columns, or unparseable dates.

## Other Elements to Keep in Mind

### 1. Data Provenance & Citation
In a humanities context, the data is as much a primary source as the dashboard.
*   **Guidance:** Include a "Cite this Dashboard" component. The `config.yaml` should have fields for `doi`, `repository_url`, and `preferred_citation`.
*   **Feature:** Automatically generate a `citation.cff` or BibTeX snippet based on the YAML metadata so other scholars can cite the dataset accurately.

### 2. Accessibility (a11y) for Data
Visualizations can be exclusionary. Argumentative storytelling should be accessible to screen readers.
*   **Guidance:** The "Text-Detail" view and the Scrollytelling narrative provide a natural "text-alternative" for the data. Ensure that every image in the YAML requires an `alt_text` field.
*   **Implementation:** For every chart (Timeline/Network), the engine should generate a hidden summary table or a "Download this View's Data" button to provide an alternative way to access the information.

### 3. Sustainability & "The Web's Fragility"
Humanities projects often lose funding or maintenance after a few years.
*   **Guidance:** Use **No-Dependency Exports.** While the build uses Vite/Node, the final output on GitHub Pages should ideally be "frozen" in time. 
*   **Implementation:** Avoid hot-linking to external CDNs for fonts or libraries (e.g., don't link to Google Fonts; package them locally). This ensures the dashboard still works 10 years from now when a specific CDN might be down.

### 4. Internationalization & Character Encoding
DH data frequently involves non-Latin scripts (Arabic, Chinese, Greek, etc.) or diacritics.
*   **Guidance:** The pipeline must enforce **UTF-8 encoding** by default. 
*   **Implementation:** Ensure the font choices in the "Themes" (Sepia, Archival, etc.) have broad Unicode support so that names and places aren't rendered as "mojibake" (broken characters).

### 5. Privacy & Sensitivity Warnings
Since users are dropping CSVs into a GitHub repository, they may accidentally publish sensitive personal data or PII (Personally Identifiable Information).
*   **Guidance:** Add a "Privacy Warning" in the README/Validation card. Remind users that because this is a static site on GitHub, **all data in the CSV is public**, even if it isn't explicitly displayed in a chart.

### 6. The "Small Data" Optimization
Unlike Big Data tools, DH data is often "deep" but not "wide" (e.g., 500 very rich records rather than 1 million thin rows).
*   **Guidance:** Optimize for **categorical density**. 
*   **Implementation:** If a user has a "Type" column with 50 unique categories, a standard color legend will break. The engine should include logic to "group the tail" (e.g., show the top 10 categories and group the rest as "Other") to keep visualizations readable.

### 7. Exporting the "Filtered" Argument
The goal is argumentative. If a viewer is convinced by a specific scrollytelling step, they might want that specific subset of data.
*   **Guidance:** Include a "Download this Subset" button. 
*   **Implementation:** Because you are using Arquero, it is easy to export the *currently filtered* state of the data as a new CSV for the viewer to download and verify the scholar's claims.

---

### Final Project Structure Overview
The **Folder Structure** should look like this:

```text
/cliodash-template
├── .github/workflows/deploy.yml  # The automation
├── /data
│   ├── letters.csv               # The user's data
│   └── network_edges.csv         # Optional
├── /assets
│   └── project_images/           # Narrative images
├── config.yaml                   # THE BRAIN
├── index.html                    # The entry point
├── /src
│   ├── engine/                   # Arquero/Graphology logic
│   ├── components/               # Timeline, Network, Search cards
│   ├── themes/                   # CSS/Design tokens
│   └── main.js                   # Orchestrator
└── README.md                     # Scholar-facing instructions
```
