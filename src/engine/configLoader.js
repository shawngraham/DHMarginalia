import yaml from 'js-yaml';

/**
 * Loads and parses config.yaml from the project root.
 * Returns the parsed configuration object.
 */
export async function loadConfig(path = '/config.yaml') {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load config: ${response.statusText}`);
  }
  const text = await response.text();
  const config = yaml.load(text);
  return validateConfig(config);
}

/**
 * Basic structural validation of the config object.
 * Returns the config if valid, throws descriptive errors otherwise.
 */
export function validateConfig(config) {
  const errors = [];

  if (!config) {
    throw new Error('Config file is empty or invalid YAML.');
  }

  if (!config.metadata) {
    errors.push('Missing "metadata" section (title, author).');
  }

  if (!config.data) {
    errors.push('Missing "data" section (csv path and column mappings).');
  } else {
    if (!config.data.csv) {
      errors.push('Missing "data.csv" — path to primary CSV file.');
    }
  }

  if (!config.story || !Array.isArray(config.story)) {
    errors.push('Missing or invalid "story" section — expected an array of steps.');
  }

  if (errors.length > 0) {
    const err = new Error('Config validation failed');
    err.validationErrors = errors;
    throw err;
  }

  return config;
}
