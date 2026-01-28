import Papa from 'papaparse';
import * as aq from 'arquero';

/**
 * Loads a CSV file and returns an Arquero table.
 */
export async function loadCSV(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load CSV: ${path} — ${response.statusText}`);
  }
  const text = await response.text();
  return parseCSV(text);
}

/**
 * Parses a CSV string using PapaParse, returns an Arquero table.
 */
export function parseCSV(csvText) {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    encoding: 'UTF-8',
  });

  if (parsed.errors.length > 0) {
    console.warn('CSV parse warnings:', parsed.errors);
  }

  return aq.from(parsed.data);
}

/**
 * Returns a data health report: row count, columns, missing value counts.
 */
export function dataHealthReport(table) {
  const columns = table.columnNames();
  const rowCount = table.numRows();
  const missing = {};

  for (const col of columns) {
    const values = table.array(col);
    missing[col] = values.filter(v => v == null || v === '').length;
  }

  return { rowCount, columns, missing };
}
