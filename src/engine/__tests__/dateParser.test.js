import { describe, it, expect } from 'vitest';
import { parseFuzzyDate } from '../dateParser.js';

describe('Fuzzy Date Parser', () => {
  it('parses ISO date: "1850-06-15"', () => {
    const result = parseFuzzyDate('1850-06-15');
    expect(result.date).not.toBeNull();
    expect(result.date.getFullYear()).toBe(1850);
    expect(result.approximate).toBe(false);
  });

  it('parses year-month: "1850-06"', () => {
    const result = parseFuzzyDate('1850-06');
    expect(result.date).not.toBeNull();
    expect(result.date.getFullYear()).toBe(1850);
    expect(result.date.getMonth()).toBe(5); // June = 5
  });

  it('parses plain year: "1850"', () => {
    const result = parseFuzzyDate('1850');
    expect(result.date).not.toBeNull();
    expect(result.date.getFullYear()).toBe(1850);
    expect(result.approximate).toBe(true);
  });

  it('parses circa date: "c. 1850"', () => {
    const result = parseFuzzyDate('c. 1850');
    expect(result.date).not.toBeNull();
    expect(result.date.getFullYear()).toBe(1850);
    expect(result.approximate).toBe(true);
  });

  it('parses uncertain date: "1850?"', () => {
    const result = parseFuzzyDate('1850?');
    expect(result.date).not.toBeNull();
    expect(result.date.getFullYear()).toBe(1850);
    expect(result.approximate).toBe(true);
  });

  it('parses season + year: "Winter 1914"', () => {
    const result = parseFuzzyDate('Winter 1914');
    expect(result.date).not.toBeNull();
    expect(result.date.getFullYear()).toBe(1914);
    expect(result.date.getMonth()).toBe(0); // Winter = January
    expect(result.approximate).toBe(true);
  });

  it('parses "Summer 1850"', () => {
    const result = parseFuzzyDate('Summer 1850');
    expect(result.date).not.toBeNull();
    expect(result.date.getFullYear()).toBe(1850);
    expect(result.date.getMonth()).toBe(6); // Summer = July
  });

  it('parses month name + year: "March 1914"', () => {
    const result = parseFuzzyDate('March 1914');
    expect(result.date).not.toBeNull();
    expect(result.date.getFullYear()).toBe(1914);
    expect(result.date.getMonth()).toBe(2);
  });

  it('parses tilde approximate: "~1900"', () => {
    const result = parseFuzzyDate('~1900');
    expect(result.date).not.toBeNull();
    expect(result.date.getFullYear()).toBe(1900);
    expect(result.approximate).toBe(true);
  });

  it('returns null for empty input', () => {
    expect(parseFuzzyDate('')).toEqual({ date: null, approximate: false, original: '' });
    expect(parseFuzzyDate(null)).toEqual({ date: null, approximate: false, original: 'null' });
  });

  it('returns null for unparseable text', () => {
    const result = parseFuzzyDate('sometime long ago');
    expect(result.date).toBeNull();
  });

  it('preserves original string', () => {
    const result = parseFuzzyDate('c. 1850');
    expect(result.original).toBe('c. 1850');
  });
});
