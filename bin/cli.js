#!/usr/bin/env node
'use strict';

/**
 * @fileoverview initproject CLI entry point.
 * @author idirdev
 */

const path = require('path');
const {
  scaffold,
  listTemplates,
  validateName,
} = require('../src/index.js');

const argv = process.argv.slice(2);

/** @param {string} msg */
function usage(msg) {
  if (msg) console.error('Error: ' + msg);
  console.log([
    'Usage: initproject <name> [options]',
    '',
    'Options:',
    '  --template <name>   Template to use: node, express, cli, library  [default: node]',
    '  --dir <path>        Target directory                               [default: ./]',
    '  --git               Run git init after scaffolding',
    '  --no-git            Skip git init (default)',
    '  --list              List available templates',
    '  --help              Show this help message',
  ].join('\n'));
  process.exit(msg ? 1 : 0);
}

if (argv.includes('--help') || argv.includes('-h')) usage();

if (argv.includes('--list')) {
  const templates = listTemplates();
  console.log('Available templates:');
  templates.forEach(t => console.log('  ' + t.name.padEnd(12) + t.description));
  process.exit(0);
}

/** Parses a --flag value pair from argv. */
function flag(name, def) {
  const idx = argv.indexOf('--' + name);
  if (idx === -1) return def;
  return argv[idx + 1] || def;
}

const name = argv.find(a => !a.startsWith('--'));
if (!name) usage('Project name is required.');

const template = flag('template', 'node');
const dir = flag('dir', process.cwd());
const git = argv.includes('--git') && !argv.includes('--no-git');

const validation = validateName(name);
if (!validation.valid) {
  console.error('Invalid project name: ' + validation.errors.join(', '));
  process.exit(1);
}

try {
  const result = scaffold(name, template, dir, { git });
  console.log('Created project "' + name + '" at ' + result.projectDir);
  result.files.forEach(f => console.log('  + ' + f));
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
