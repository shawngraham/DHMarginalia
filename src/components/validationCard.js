import { dataHealthReport } from '../engine/dataLoader.js';

/**
 * Validation Card — shows data health and config issues in dev mode.
 * Visible only when ?dev=true is in the URL or config.dev_mode is set.
 */
export function createValidationCard(table, config, configErrors = []) {
  const isDevMode = new URLSearchParams(window.location.search).get('dev') === 'true'
    || config?.dev_mode === true;

  if (!isDevMode) return null;

  const card = document.createElement('div');
  card.className = 'validation-card';

  const titleEl = document.createElement('p');
  titleEl.className = 'card-title';
  titleEl.textContent = 'Data Health Report';
  card.appendChild(titleEl);

  const messages = [];

  // Config errors
  for (const err of configErrors) {
    messages.push({ level: 'error', text: err });
  }

  // Data health
  if (table) {
    const report = dataHealthReport(table);
    messages.push({ level: 'info', text: `Found ${report.rowCount} rows, ${report.columns.length} columns.` });

    for (const [col, count] of Object.entries(report.missing)) {
      if (count > 0) {
        const pct = Math.round((count / report.rowCount) * 100);
        const level = pct > 50 ? 'warning' : 'info';
        messages.push({ level, text: `Column "${col}": ${count} missing values (${pct}%).` });
      }
    }

    // Check expected columns from config
    if (config?.data?.columns) {
      const mapping = config.data.columns;
      for (const [role, colName] of Object.entries(mapping)) {
        if (!report.columns.includes(colName)) {
          messages.push({ level: 'error', text: `Config maps "${role}" to column "${colName}", but it doesn't exist in the CSV.` });
        }
      }
    }
  }

  // Check for typos in view types
  const validViews = ['timeline', 'network', 'search', 'text', 'gallery', 'image'];
  if (config?.story) {
    for (const step of config.story) {
      if (step.view && !validViews.includes(step.view)) {
        const suggestion = findClosest(step.view, validViews);
        messages.push({
          level: 'error',
          text: `Unknown view type "${step.view}".${suggestion ? ` Did you mean "${suggestion}"?` : ''}`,
        });
      }
    }
  }

  // Render messages
  const list = document.createElement('ul');
  list.style.cssText = 'list-style:none;padding:0;margin:0;max-height:300px;overflow-y:auto;';
  for (const msg of messages) {
    const li = document.createElement('li');
    li.className = msg.level;
    li.style.cssText = 'margin-bottom:var(--spacing-xs);';
    li.textContent = `[${msg.level.toUpperCase()}] ${msg.text}`;
    list.appendChild(li);
  }
  card.appendChild(list);

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.className = 'btn';
  closeBtn.style.marginTop = 'var(--spacing-sm)';
  closeBtn.addEventListener('click', () => card.remove());
  card.appendChild(closeBtn);

  return card;
}

function findClosest(input, options) {
  let best = null;
  let bestDist = Infinity;
  for (const opt of options) {
    const dist = levenshtein(input.toLowerCase(), opt.toLowerCase());
    if (dist < bestDist && dist <= 3) {
      bestDist = dist;
      best = opt;
    }
  }
  return best;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0),
      );
    }
  }
  return dp[m][n];
}
