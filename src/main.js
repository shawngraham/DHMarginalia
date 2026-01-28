import { loadConfig } from './engine/configLoader.js';
import { loadCSV } from './engine/dataLoader.js';
import { applyTheme } from './themes/themeProvider.js';
import { deriveDates, applyTransform } from './engine/transformMapper.js';
import { initScrollytelling } from './components/scrollytelling.js';
import { createTimelineCard } from './components/timelineCard.js';
import { createNetworkCard } from './components/networkCard.js';
import { createSearchCard } from './components/searchCard.js';
import { createTextCard } from './components/textCard.js';
import { createValidationCard } from './components/validationCard.js';

/**
 * DHMarginalia — Main Orchestrator
 * Loads config.yaml, CSV data, and drives the narrative + dashboard.
 */
async function main() {
  const app = document.getElementById('app');
  const header = document.getElementById('site-header');
  const narrative = document.getElementById('narrative-container');
  const dashboard = document.getElementById('dashboard-container');

  let config, table;
  const configErrors = [];

  // 1. Load config
  try {
    config = await loadConfig('/config.yaml');
  } catch (err) {
    if (err.validationErrors) {
      configErrors.push(...err.validationErrors);
    } else {
      configErrors.push(err.message);
    }
    showError(app, 'Failed to load config.yaml. Check the console for details.', err);
    return;
  }

  // 2. Apply theme
  applyTheme(config.metadata?.theme);

  // 3. Render header
  if (config.metadata) {
    header.innerHTML = `
      <div class="container" style="padding:var(--spacing-xl) 0 var(--spacing-lg);">
        <h1>${escapeHTML(config.metadata.title || 'DHMarginalia')}</h1>
        ${config.metadata.author ? `<p style="color:var(--color-text-muted);">${escapeHTML(config.metadata.author)}</p>` : ''}
        ${config.metadata.description ? `<p>${escapeHTML(config.metadata.description)}</p>` : ''}
      </div>
    `;
  }

  // 4. Load CSV data
  try {
    table = await loadCSV(config.data.csv);
  } catch (err) {
    configErrors.push(`Failed to load CSV: ${err.message}`);
    showError(app, `Failed to load data from ${config.data.csv}`, err);
    return;
  }

  // 5. Parse dates if a date column is specified
  const dateCol = config.data?.columns?.date;
  if (dateCol) {
    table = deriveDates(table, dateCol);
  }

  // 6. Build scrollytelling narrative
  if (config.story && config.story.length > 0) {
    initScrollytelling(narrative, config.story, {
      onStepEnter({ config: stepConfig, visualContainer }) {
        renderVisual(visualContainer, stepConfig, table, config);
      },
    });
  }

  // 7. Build dashboard section
  if (config.dashboard) {
    dashboard.innerHTML = '<div class="container"><h2>Explore the Data</h2><div class="dashboard-grid" id="dashboard-grid"></div></div>';
    const grid = document.getElementById('dashboard-grid');

    for (const panel of config.dashboard) {
      const panelEl = document.createElement('div');
      grid.appendChild(panelEl);
      renderVisual(panelEl, panel, table, config);
    }
  }

  // 8. Validation card (dev mode only)
  const validationEl = createValidationCard(table, config, configErrors);
  if (validationEl) {
    document.body.appendChild(validationEl);
  }

  // 9. Footer with citation
  const footer = document.getElementById('site-footer');
  if (config.metadata) {
    footer.innerHTML = `
      <div class="container" style="padding:var(--spacing-lg) 0;border-top:1px solid var(--color-border);margin-top:var(--spacing-xl);font-size:0.85rem;color:var(--color-text-muted);">
        <p>${escapeHTML(config.metadata.preferred_citation || `${config.metadata.title}. ${config.metadata.author || ''}`)}.</p>
        ${config.metadata.doi ? `<p>DOI: <a href="https://doi.org/${escapeHTML(config.metadata.doi)}">${escapeHTML(config.metadata.doi)}</a></p>` : ''}
        ${config.metadata.repository_url ? `<p>Repository: <a href="${escapeHTML(config.metadata.repository_url)}">${escapeHTML(config.metadata.repository_url)}</a></p>` : ''}
      </div>
    `;
  }
}

/**
 * Renders a visual component based on a step/panel config.
 */
function renderVisual(container, stepConfig, table, config) {
  if (!stepConfig.view) return;

  // Apply any data transforms for this step
  let stepData = table;
  if (stepConfig.transform) {
    stepData = applyTransform(table, stepConfig.transform);
  }

  const colMap = config.data?.columns || {};

  switch (stepConfig.view) {
    case 'timeline':
      createTimelineCard(container, stepData.objects(), {
        dateColumn: colMap.date || 'date',
        title: stepConfig.title || 'Timeline',
      });
      break;

    case 'network':
      createNetworkCard(container, stepData, {
        sourceCol: colMap.source || 'source',
        targetCol: colMap.target || 'target',
        title: stepConfig.title || 'Network',
      });
      break;

    case 'search':
      createSearchCard(container, stepData, {
        facets: stepConfig.facets || [],
        title: stepConfig.title || 'Search & Filter',
      });
      break;

    case 'text':
    case 'gallery':
      createTextCard(container, {
        title: stepConfig.title,
        markdown: stepConfig.text,
        image: stepConfig.image,
        imageAlt: stepConfig.alt_text,
        transcription: stepConfig.transcription,
      });
      break;

    case 'image':
      createTextCard(container, {
        image: stepConfig.image,
        imageAlt: stepConfig.alt_text || 'Narrative image',
      });
      break;

    default:
      container.innerHTML = `<div class="card"><p>Unknown view: ${escapeHTML(stepConfig.view)}</p></div>`;
  }
}

function showError(container, message, err) {
  console.error(message, err);
  const el = document.createElement('div');
  el.className = 'container';
  el.style.padding = 'var(--spacing-xl) 0';
  el.innerHTML = `<div class="card" style="border-color:#b91c1c;">
    <p class="card-title" style="color:#b91c1c;">Configuration Error</p>
    <p>${escapeHTML(message)}</p>
    <pre style="margin-top:var(--spacing-sm);font-size:0.8rem;overflow:auto;">${escapeHTML(err?.message || '')}</pre>
  </div>`;
  container.appendChild(el);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Boot
main().catch(err => {
  console.error('DHMarginalia fatal error:', err);
});
