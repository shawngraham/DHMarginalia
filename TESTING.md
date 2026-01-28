Testing must focus on **resilience** (how the app handles "dirty" data) and **visual regression** (ensuring scrollytelling triggers actually work).

---

### 1. Data Logic & "Engine" Testing (Unit Tests)
These tests ensure the mathematical and logical "brain" of the app works without a browser.
*   **Fuzzy Date Parser:** Test with a battery of DH-style dates: `"c. 1850"`, `"1850?"`, `"1850-06"`, `"Winter 1914"`. Ensure they map to the correct timestamps.
*   **Network Inference Engine:** Provide a sample CSV with 5 rows and ensure the engine correctly identifies the right number of unique nodes and edges.
*   **Centrality Algorithms:** Verify that the "Betweenness Centrality" results match a known-good dataset (e.g., the "Les Misérables" network).
*   **YAML-to-Arquero Translation:** Test that a YAML string like `filter: "year > 1900"` correctly generates the corresponding Arquero function.

### 2. The "Nightmare CSV" Suite (Robustness Testing)
Because humanities data is famously messy, you should create a set of "maliciously bad" CSVs to see if the app breaks gracefully.
*   **The "Empty Cells" Test:** A CSV where 50% of the data is missing.
*   **The "Encoding" Test:** A CSV containing non-Latin scripts (Arabic, Chinese) and special characters (é, ü, ø) to ensure no "mojibake" (broken text) appears.
*   **The "Heavy Text" Test:** A CSV where one column contains 10,000 words per cell (simulating book chapters) to check browser memory limits.
*   **The "Duplicate" Test:** A network where the source and target are the same person (self-loops).

### 3. Visual & Scrollytelling Testing (Integration Tests)
These ensure that the "story" actually moves when the user scrolls.
*   **Scroll Trigger Accuracy:** Use a tool like **Playwright** or **Cypress** to simulate a user scrolling. Test: *"When the viewport reaches Step 2, does the 'Network' component receive the 'Filtered' data props?"*
*   **Responsive Layouts:** Test the dashboard on multiple viewport sizes. (e.g., Does the scrollytelling panel stack vertically on a mobile phone without hiding the chart?)
*   **Theme Injection:** Test that changing the `theme` key in YAML actually updates the CSS variables (e.g., font-family changes from Sans to Serif).

### 4. The "Validation Card" (In-App Testing)
In this project, the "testing" isn't just for you; it's for the scholar.
*   **Schema Validation:** Use **Zod** or **JSON Schema** to validate the `config.yaml`. If the user types `view: nettwork` (typo), the app should display a friendly error: *"Did you mean 'network'?"*
*   **Data Health Report:** The dashboard should have a "Dev Mode" toggle that shows the results of an internal audit:
    *   *"Found 45 nodes."*
    *   *"Warning: 12 rows had no Date and were excluded from the Timeline."*

### 5. Accessibility (a11y) & Performance Testing
*   **Color Contrast:** Ensure the "Sepia" or "Dark" themes meet WCAG AA standards for readability.
*   **Keyboard Navigation:** Can a user "scroll" through the story using only the arrow keys? Can they tab through the "Search" results?
*   **Lighthouse Performance:** Since this is a static site, it should score 90+ on performance. If the Network Graph is too heavy, this test will flag it.

### 6. Longevity & Build Testing (CI/CD)
*   **GitHub Action Build Test:** Every time a user pushes a change to their CSV, the GitHub Action should run a "Headless Build." If the CSV is so broken that the site won't compile, the Action should fail and send the user an email.
*   **Dependency Audit:** Since DH projects need to last decades, use a tool like `npm audit` to ensure no vulnerable libraries are being pulled in, and consider "pinning" versions so an update doesn't break the scholar's site years later.

---

### Summary Checklist for the "DHMarginalia" Test Suite:

| Test Level | Tool Recommendation | What it verifies |
| :--- | :--- | :--- |
| **Unit** | Vitest / Jest | Date parsing, Centrality math, YAML parsing. |
| **E2E** | Playwright | Scrollytelling triggers and Chart rendering. |
| **Data** | Custom Scripts | Handling of UTF-8, missing values, and large files. |
| **Validation** | Zod / JSON Schema | `config.yaml` syntax and CSV column mapping. |
| **Accessibility** | Pa11y / Axe | Screen reader support and color contrast. |
