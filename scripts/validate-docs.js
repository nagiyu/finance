#!/usr/bin/env node

const Ajv = require('ajv');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'specs', '001-restructure-docs', 'contracts', 'doc-metadata.schema.json');

// Validate the schema itself first
let schema;
try {
  schema = require(schemaPath);
} catch (err) {
  console.error('Failed to load schema:', err.message);
  process.exit(1);
}

const ajv = new Ajv({ allErrors: true });

const validSchema = ajv.validateSchema(schema);
if (!validSchema) {
  console.error('Invalid schema:', ajv.errors);
  process.exit(1);
}

console.log('✓ Schema validation passed');
