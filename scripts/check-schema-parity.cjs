#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');
const GENERATE = process.argv.includes('--generate');

const pairs = [
  ['schema/data-model/entity.json', 'schema/data-model/entity.yaml'],
  ['schema/data-model-complete.json', 'schema/data-model-complete.yaml'],
];

let errors = 0;

for (const [jsonRel, yamlRel] of pairs) {
  const jsonPath = path.join(ROOT, jsonRel);
  const yamlPath = path.join(ROOT, yamlRel);

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Missing JSON source: ${jsonRel}`);
    errors++;
    continue;
  }

  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  if (GENERATE) {
    fs.writeFileSync(yamlPath, yaml.dump(jsonData, { indent: 2, lineWidth: 100, noRefs: true }));
    console.log(`✅ Generated ${yamlRel}`);
    continue;
  }

  if (!fs.existsSync(yamlPath)) {
    console.error(`❌ Missing YAML file: ${yamlRel} (run with --generate to create)`);
    errors++;
    continue;
  }

  const yamlData = yaml.load(fs.readFileSync(yamlPath, 'utf8'));

  try {
    assert.deepStrictEqual(yamlData, jsonData, `Parity mismatch: ${jsonRel} vs ${yamlRel}`);
    console.log(`✅ Parity OK: ${jsonRel}`);
  } catch (err) {
    console.error(`❌ ${err.message}`);
    errors++;
  }
}

if (!GENERATE) {
  if (errors > 0) {
    console.error(`\n${errors} parity error(s). Run: npm run schema:generate`);
    process.exit(1);
  } else {
    console.log('\n✅ All schema files are in parity.');
  }
}
