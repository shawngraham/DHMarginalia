import { parseFuzzyDate } from '../engine/dateParser.js';

/**
 * Timeline Card — renders a date-based histogram/dot plot using SVG.
 * Uses simple SVG rendering (Observable Plot integration planned for future).
 */
export function createTimelineCard(container, data, options = {}) {
  const {
    dateColumn = 'date',
    title = 'Timeline',
    width = 700,
    height = 300,
  } = options;

  // Parse dates from data
  const parsedRows = data.map(row => {
    const result = parseFuzzyDate(row[dateColumn]);
    return { ...row, _parsedDate: result.date, _approximate: result.approximate };
  }).filter(row => row._parsedDate !== null);

  if (parsedRows.length === 0) {
    container.innerHTML = `<div class="card"><p class="card-title">${title}</p><p>No parseable dates found in column "${dateColumn}".</p></div>`;
    return;
  }

  // Find date range
  const timestamps = parsedRows.map(r => r._parsedDate.getTime());
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const range = maxTime - minTime || 1;

  // Build year-based bins
  const minYear = new Date(minTime).getFullYear();
  const maxYear = new Date(maxTime).getFullYear();
  const binSize = Math.max(1, Math.ceil((maxYear - minYear) / 30)); // max 30 bins
  const bins = {};

  for (const row of parsedRows) {
    const year = row._parsedDate.getFullYear();
    const binKey = Math.floor((year - minYear) / binSize) * binSize + minYear;
    bins[binKey] = (bins[binKey] || 0) + 1;
  }

  const binEntries = Object.entries(bins).map(([year, count]) => ({
    year: parseInt(year),
    count,
  }));
  const maxCount = Math.max(...binEntries.map(b => b.count));

  // Margins
  const margin = { top: 30, right: 20, bottom: 40, left: 50 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const barWidth = Math.max(4, plotW / binEntries.length - 2);

  // Build SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Timeline showing ${parsedRows.length} items from ${minYear} to ${maxYear}`);

  let svgContent = `<text x="${margin.left}" y="20" font-size="14" font-weight="bold" fill="var(--color-text)">${title}</text>`;

  // Bars
  for (let i = 0; i < binEntries.length; i++) {
    const { year, count } = binEntries[i];
    const x = margin.left + (i / binEntries.length) * plotW;
    const barH = (count / maxCount) * plotH;
    const y = margin.top + plotH - barH;

    svgContent += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" fill="var(--color-accent)" opacity="0.8" rx="1">
      <title>${year}${binSize > 1 ? '–' + (year + binSize - 1) : ''}: ${count} items</title>
    </rect>`;
  }

  // X-axis labels (sparse)
  const labelEvery = Math.max(1, Math.floor(binEntries.length / 6));
  for (let i = 0; i < binEntries.length; i += labelEvery) {
    const x = margin.left + (i / binEntries.length) * plotW + barWidth / 2;
    svgContent += `<text x="${x}" y="${height - 8}" font-size="11" text-anchor="middle" fill="var(--color-text-muted)">${binEntries[i].year}</text>`;
  }

  // Y-axis label
  svgContent += `<text x="12" y="${margin.top + plotH / 2}" font-size="10" fill="var(--color-text-muted)" transform="rotate(-90, 12, ${margin.top + plotH / 2})">Count</text>`;

  svg.innerHTML = svgContent;

  // Build the card
  const card = document.createElement('div');
  card.className = 'card';
  card.appendChild(svg);

  // Accessibility: hidden summary table
  const summary = document.createElement('table');
  summary.className = 'sr-only';
  summary.setAttribute('aria-label', 'Timeline data table');
  summary.innerHTML = `<thead><tr><th>Year</th><th>Count</th></tr></thead><tbody>${
    binEntries.map(b => `<tr><td>${b.year}</td><td>${b.count}</td></tr>`).join('')
  }</tbody>`;
  card.appendChild(summary);

  container.innerHTML = '';
  container.appendChild(card);

  return { parsedRows, bins: binEntries };
}
