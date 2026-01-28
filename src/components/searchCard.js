import * as aq from 'arquero';

/**
 * Search & Filter Card — global search bar + faceted filters based on YAML categories.
 */
export function createSearchCard(container, table, options = {}) {
  const {
    searchColumns = null, // null = search all text columns
    facets = [],          // array of column names to facet on
    title = 'Search & Filter',
    onFilter = null,      // callback when filter changes: (filteredTable) => void
  } = options;

  const allColumns = table.columnNames();
  const searchCols = searchColumns || allColumns;

  const card = document.createElement('div');
  card.className = 'card search-card';

  // Title
  const titleEl = document.createElement('p');
  titleEl.className = 'card-title';
  titleEl.textContent = title;
  card.appendChild(titleEl);

  // Search input
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search across all fields...';
  searchInput.setAttribute('aria-label', 'Search data');
  searchInput.style.cssText = 'width:100%;padding:var(--spacing-sm);border:1px solid var(--color-border);border-radius:var(--radius);font-family:var(--font-body);font-size:0.9rem;margin-bottom:var(--spacing-sm);background:var(--color-bg);color:var(--color-text);';
  card.appendChild(searchInput);

  // Facet filters
  const facetState = {};
  const facetContainer = document.createElement('div');
  facetContainer.style.cssText = 'display:flex;flex-wrap:wrap;gap:var(--spacing-sm);margin-bottom:var(--spacing-sm);';

  for (const facetCol of facets) {
    if (!allColumns.includes(facetCol)) continue;

    const values = [...new Set(table.array(facetCol).filter(v => v != null && v !== ''))];
    // Group tail: show top 10, collapse rest
    const topValues = values.slice(0, 10);

    const select = document.createElement('select');
    select.setAttribute('aria-label', `Filter by ${facetCol}`);
    select.style.cssText = 'padding:var(--spacing-xs) var(--spacing-sm);border:1px solid var(--color-border);border-radius:var(--radius);font-size:0.85rem;background:var(--color-bg);color:var(--color-text);';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = `All ${facetCol}`;
    select.appendChild(defaultOpt);

    for (const val of topValues) {
      const opt = document.createElement('option');
      opt.value = String(val);
      opt.textContent = String(val);
      select.appendChild(opt);
    }

    if (values.length > 10) {
      const opt = document.createElement('option');
      opt.value = '__other__';
      opt.textContent = `Other (${values.length - 10} more)`;
      select.appendChild(opt);
    }

    select.addEventListener('change', () => {
      facetState[facetCol] = select.value;
      applyFilters();
    });

    facetContainer.appendChild(select);
  }
  card.appendChild(facetContainer);

  // Results count
  const resultsEl = document.createElement('p');
  resultsEl.style.cssText = 'font-size:0.8rem;color:var(--color-text-muted);';
  resultsEl.textContent = `${table.numRows()} results`;
  card.appendChild(resultsEl);

  // Download button
  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'btn';
  downloadBtn.textContent = 'Download this Subset';
  downloadBtn.style.marginTop = 'var(--spacing-sm)';
  downloadBtn.addEventListener('click', () => {
    const filtered = getFilteredTable();
    const csv = toCSV(filtered);
    downloadFile(csv, 'filtered_data.csv', 'text/csv');
  });
  card.appendChild(downloadBtn);

  let currentFiltered = table;

  function getFilteredTable() {
    return currentFiltered;
  }

  function applyFilters() {
    let result = table;
    const query = searchInput.value.trim().toLowerCase();

    if (query) {
      result = result.filter(aq.escape(d => {
        return searchCols.some(col => {
          const val = d[col];
          return val != null && String(val).toLowerCase().includes(query);
        });
      }));
    }

    for (const [col, val] of Object.entries(facetState)) {
      if (!val) continue;
      if (val === '__other__') {
        const topValues = [...new Set(table.array(col).filter(v => v != null && v !== ''))].slice(0, 10);
        result = result.filter(aq.escape(d => !topValues.includes(d[col])));
      } else {
        result = result.filter(aq.escape(d => String(d[col]) === val));
      }
    }

    currentFiltered = result;
    resultsEl.textContent = `${result.numRows()} results`;
    if (onFilter) onFilter(result);
  }

  searchInput.addEventListener('input', applyFilters);

  container.innerHTML = '';
  container.appendChild(card);

  return { getFilteredTable, applyFilters };
}

function toCSV(table) {
  const cols = table.columnNames();
  const rows = [];
  rows.push(cols.join(','));
  const objects = table.objects();
  for (const obj of objects) {
    rows.push(cols.map(c => {
      const v = obj[c];
      if (v == null) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(','));
  }
  return rows.join('\n');
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
