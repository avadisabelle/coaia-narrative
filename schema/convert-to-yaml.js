#!/usr/bin/env node

/**
 * Convert JSON schema files to YAML format
 * Usage: node convert-to-yaml.js <json-file>
 */

import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

const jsonFile = process.argv[2];
if (!jsonFile) {
  console.error('Usage: node convert-to-yaml.js <json-file>');
  process.exit(1);
}

const jsonContent = fs.readFileSync(jsonFile, 'utf8');
const jsonData = JSON.parse(jsonContent);
const yamlContent = yaml.dump(jsonData, {
  indent: 2,
  lineWidth: 100,
  noRefs: true
});

const yamlFile = jsonFile.replace(/\.json$/, '.yaml');
fs.writeFileSync(yamlFile, yamlContent, 'utf8');
console.log(`✅ Created ${yamlFile}`);
