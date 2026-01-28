import { describe, it, expect } from 'vitest';
import * as aq from 'arquero';
import { applyTransform, deriveDates } from '../transformMapper.js';

describe('Transform Mapper', () => {
  const sampleTable = aq.from([
    { name: 'Alice', year: 1880, type: 'letter' },
    { name: 'Bob', year: 1920, type: 'letter' },
    { name: 'Charlie', year: 1950, type: 'note' },
    { name: 'Diana', year: 1890, type: 'letter' },
    { name: 'Eve', year: 2000, type: 'note' },
  ]);

  it('filters by string expression: "year > 1900"', () => {
    const result = applyTransform(sampleTable, { filter: 'year > 1900' });
    expect(result.numRows()).toBe(3); // Bob, Charlie, Eve
  });

  it('filters by object expression', () => {
    const result = applyTransform(sampleTable, { filter: { column: 'type', value: 'note' } });
    expect(result.numRows()).toBe(2); // Charlie, Eve
  });

  it('sorts by column', () => {
    const result = applyTransform(sampleTable, { sort: 'year' });
    const years = result.array('year');
    expect(years[0]).toBe(1880);
    expect(years[4]).toBe(2000);
  });

  it('groups by column and counts', () => {
    const result = applyTransform(sampleTable, { group_by: 'type' });
    expect(result.numRows()).toBe(2); // letter, note
  });

  it('returns table unchanged when no transform is given', () => {
    const result = applyTransform(sampleTable, null);
    expect(result.numRows()).toBe(5);
  });
});

describe('deriveDates', () => {
  it('adds a parsed_date column from a date column', () => {
    const table = aq.from([
      { date: '1850-06-15' },
      { date: 'c. 1900' },
      { date: 'unparseable' },
    ]);

    const result = deriveDates(table, 'date');
    expect(result.columnNames()).toContain('parsed_date');
    const dates = result.array('parsed_date');
    expect(dates[0]).not.toBeNull(); // valid date
    expect(dates[2]).toBeNull(); // unparseable
  });
});
