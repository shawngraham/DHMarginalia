import { describe, it, expect } from 'vitest';
import { validateConfig } from '../configLoader.js';

describe('Config Validation', () => {
  it('accepts a valid config', () => {
    const config = {
      metadata: { title: 'Test', author: 'Author' },
      data: { csv: '/data/test.csv' },
      story: [{ text: 'Hello', view: 'timeline' }],
    };
    expect(validateConfig(config)).toEqual(config);
  });

  it('rejects null config', () => {
    expect(() => validateConfig(null)).toThrow('empty or invalid');
  });

  it('reports missing metadata', () => {
    const config = { data: { csv: '/data/test.csv' }, story: [] };
    try {
      validateConfig(config);
    } catch (err) {
      expect(err.validationErrors).toContain('Missing "metadata" section (title, author).');
    }
  });

  it('reports missing data section', () => {
    const config = { metadata: { title: 'Test' }, story: [] };
    try {
      validateConfig(config);
    } catch (err) {
      expect(err.validationErrors.some(e => e.includes('data'))).toBe(true);
    }
  });

  it('reports missing data.csv', () => {
    const config = { metadata: { title: 'Test' }, data: {}, story: [] };
    try {
      validateConfig(config);
    } catch (err) {
      expect(err.validationErrors.some(e => e.includes('data.csv'))).toBe(true);
    }
  });

  it('reports missing story section', () => {
    const config = { metadata: { title: 'Test' }, data: { csv: '/data/test.csv' } };
    try {
      validateConfig(config);
    } catch (err) {
      expect(err.validationErrors.some(e => e.includes('story'))).toBe(true);
    }
  });
});
