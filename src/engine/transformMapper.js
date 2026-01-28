import * as aq from 'arquero';
import { parseFuzzyDate } from './dateParser.js';

/**
 * Translates YAML step transforms into Arquero operations on a table.
 * Supports: filter, sort, group_by + count, select, derive (date parsing).
 */
export function applyTransform(table, transform) {
  if (!transform) return table;

  let result = table;

  // filter: "year > 1900"
  if (transform.filter) {
    result = applyFilter(result, transform.filter);
  }

  // sort: "date" or { column: "date", order: "desc" }
  if (transform.sort) {
    result = applySort(result, transform.sort);
  }

  // group_by + count
  if (transform.group_by) {
    result = applyGroupBy(result, transform.group_by, transform.rollup);
  }

  // select specific columns
  if (transform.select) {
    result = result.select(transform.select);
  }

  return result;
}

function applyFilter(table, filterExpr) {
  if (typeof filterExpr === 'string') {
    // Simple expression-based filter
    // Parse common patterns: "column > value", "column == value"
    const match = filterExpr.match(/^(\w+)\s*(>=|<=|!=|==|>|<)\s*(.+)$/);
    if (match) {
      const [, col, op, rawVal] = match;
      const val = isNaN(Number(rawVal)) ? rawVal.replace(/['"]/g, '') : Number(rawVal);
      return table.filter(aq.escape(d => {
        const cellVal = d[col];
        switch (op) {
          case '>': return cellVal > val;
          case '<': return cellVal < val;
          case '>=': return cellVal >= val;
          case '<=': return cellVal <= val;
          case '==': return cellVal == val;
          case '!=': return cellVal != val;
          default: return true;
        }
      }));
    }
  }

  if (typeof filterExpr === 'object') {
    // Object-based filter: { column: "type", value: "letter" }
    const { column, value } = filterExpr;
    return table.filter(aq.escape(d => d[column] == value));
  }

  return table;
}

function applySort(table, sortExpr) {
  if (typeof sortExpr === 'string') {
    return table.orderby(sortExpr);
  }
  if (typeof sortExpr === 'object') {
    const col = sortExpr.column || sortExpr;
    if (sortExpr.order === 'desc') {
      return table.orderby(aq.desc(col));
    }
    return table.orderby(col);
  }
  return table;
}

function applyGroupBy(table, groupCol, rollup) {
  let grouped = table.groupby(groupCol);
  if (rollup === 'count' || !rollup) {
    return grouped.count();
  }
  return grouped.count();
}

/**
 * Adds a parsed_date column to a table from a source date column.
 */
export function deriveDates(table, dateColumn) {
  const dates = table.array(dateColumn);
  const parsed = dates.map(d => {
    const result = parseFuzzyDate(d);
    return result.date ? result.date.getTime() : null;
  });

  return table.assign(aq.table({ parsed_date: parsed }));
}
