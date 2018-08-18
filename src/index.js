'use strict';

/**
 * @fileoverview initproject - Scaffold new projects from built-in templates.
 * @module initproject
 * @author idirdev
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Built-in template definitions.
 * @type {Object.<string, {description: string, files: function(string): Object.<string,string>}>}
 */
const TEMPLATES = {
  node: {
    description: 'Minimal Node.js package with src/, tests/, and README',
    files(name) {
      return {
        'package.json': JSON.stringify({
          name,
          version: '1.0.0',
          description: '',
          main: 'src/index.js',
          scripts: { test: 'node --test tests/' },
          author: '',
          license: 'MIT',
        }, null, 2),
        'src/index.js': [
          "'use strict';",
          '',
          '/**',
          ' * @module ' + name,
          ' * @author idirdev',
          ' */',
          '',
          'module.exports = {};',
          '',
        ].join('\n'),
        'tests/index.test.js': [
          "'use strict';",
          "const { describe, it } = require('node:test');",
          "const assert = require('node:assert/strict');",
          "const mod = require('../src/index.js');",
          '',
          "describe('" + name + "', () => {",
          "  it('exports an object', () => {",
          '    assert.strictEqual(typeof mod, \'object\');',
          '  });',
          '});',
          '',
        ].join('\n'),
        'README.md': [
          '# ' + name,
          '',
          '> TODO: describe your package.',
          '',
          '## Usage',
          '',
          '\x60\x60\x60js',
          "const mod = require('" + name + "');",
          '\x60\x60\x60',
          '',
          '## License',
          '',
          'MIT',
          '',
        ].join('\n'),
        '.gitignore': 'node_modules/\ncoverage/\n*.log\n',
      };
    },
  },

  express: {
    description: 'Express web server with routes/ and middleware/ directories',
    files(name) {
      const base = TEMPLATES.node.files(name);
      return {
        ...base,
        'server.js': [
          "'use strict';",
          "const express = require('express');",
          "const app = express();",
          "const PORT = process.env.PORT || 3000;",
          '',
          "app.use(express.json());",
          "app.use(require('./middleware/logger'));",
          "app.use('/api', require('./routes/index'));",
          '',
          "app.listen(PORT, () => console.log('Server running on port ' + PORT));",
          "module.exports = app;",
          '',
        ].join('\n'),
        'routes/index.js': [
          "'use strict';",
          "const router = require('express').Router();",
          '',
          "router.get('/', (req, res) => res.json({ ok: true }));",
          '',
          'module.exports = router;',
          '',
        ].join('\n'),
        'middleware/logger.js': [
          "'use strict';",
          '',
          '/**',
          ' * Simple request logger middleware.',
          ' * @param {object} req - Express request.',
          ' * @param {object} res - Express response.',
          ' * @param {function} next - Next handler.',
          ' */',
          'module.exports = function logger(req, res, next) {',
          "  console.log(req.method + ' ' + req.url);",
          '  next();',
          '};',
          '',
        ].join('\n'),
      };
    },
  },

  cli: {
    description: 'CLI tool with bin/ entry point and argument parsing',
    files(name) {
      const base = TEMPLATES.node.files(name);
      const updatedPkg = JSON.parse(base['package.json']);
      updatedPkg.bin = { [name]: 'bin/cli.js' };
      return {
        ...base,
        'package.json': JSON.stringify(updatedPkg, null, 2),
        'bin/cli.js': [
          '#!/usr/bin/env node',
          "'use strict';",
          '',
          "const { parseArgs } = require('./args');",
          "const mod = require('../src/index.js');",
          '',
          'const args = parseArgs(process.argv.slice(2));',
          '',
          'if (args.help) {',
          "  console.log('Usage: " + name + " [options]');",
          "  console.log('  --help    Show this help');",
          '  process.exit(0);',
          '}',
          '',
          'console.log(JSON.stringify(mod, null, 2));',
          '',
        ].join('\n'),
        'bin/args.js': [
          "'use strict';",
          '',
          '/**',
          ' * Minimal argument parser.',
          ' * @param {string[]} argv - Raw argv slice.',
          ' * @returns {Object} Parsed flags and positional args.',
          ' */',
          'function parseArgs(argv) {',
          "  const result = { _: [] };",
          '  for (let i = 0; i < argv.length; i++) {',
          "    const arg = argv[i];",
          "    if (arg.startsWith('--')) {",
          "      const key = arg.slice(2);",
          "      const next = argv[i + 1];",
          "      if (next && !next.startsWith('--')) {",
          '        result[key] = next;',
          '        i++;',
          '      } else {',
          '        result[key] = true;',
          '      }',
          '    } else {',
          '      result._.push(arg);',
          '    }',
          '  }',
          '  return result;',
          '}',
          '',
          'module.exports = { parseArgs };',
          '',
        ].join('\n'),
      };
    },
  },

  library: {
    description: 'Reusable library package with named exports and tests',
    files(name) {
      const base = TEMPLATES.node.files(name);
      return {
        ...base,
        'src/index.js': [
          "'use strict';",
          '',
          '/**',
          ' * @module ' + name,
          ' * @author idirdev',
          ' */',
          '',
          '/**',
          ' * Example utility function.',
          ' * @param {*} value - Any value.',
          ' * @returns {string} String representation.',
          ' */',
          'function stringify(value) {',
          '  return JSON.stringify(value, null, 2);',
          '}',
          '',
          '/**',
          ' * Checks if a value is a plain object.',
          ' * @param {*} value - Value to check.',
          ' * @returns {boolean}',
          ' */',
          'function isPlainObject(value) {',
          "  return typeof value === 'object' && value !== null && !Array.isArray(value);",
          '}',
          '',
          'module.exports = { stringify, isPlainObject };',
          '',
        ].join('\n'),
        'tests/index.test.js': [
          "'use strict';",
          "const { describe, it } = require('node:test');",
          "const assert = require('node:assert/strict');",
          "const { stringify, isPlainObject } = require('../src/index.js');",
          '',
          "describe('" + name + "', () => {",
          "  it('stringify returns JSON string', () => {",
          "    assert.strictEqual(stringify({ a: 1 }), JSON.stringify({ a: 1 }, null, 2));",
          '  });',
          "  it('isPlainObject detects plain objects', () => {",
          '    assert.strictEqual(isPlainObject({}), true);',
          '    assert.strictEqual(isPlainObject([]), false);',
          '    assert.strictEqual(isPlainObject(null), false);',
          '  });',
          '});',
          '',
        ].join('\n'),
      };
    },
  },
};

/**
 * Returns all available templates with their names and descriptions.
 * @returns {Array.<{name: string, description: string}>}
 */
function listTemplates() {
  return Object.entries(TEMPLATES).map(([name, t]) => ({
    name,
    description: t.description,
  }));
}

/**
 * Registers a custom template.
 * @param {string} name - Template name.
 * @param {{ description: string, files: function(string): Object.<string,string> }} definition
 * @throws {Error} If a template with that name already exists.
 */
function addTemplate(name, definition) {
  if (TEMPLATES[name]) {
    throw new Error('Template "' + name + '" already exists.');
  }
  if (typeof definition.files !== 'function') {
    throw new Error('Template definition must include a files() function.');
  }
  TEMPLATES[name] = definition;
}

/**
 * Validates an npm package name.
 * @param {string} name - Package name to validate.
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateName(name) {
  const errors = [];
  if (!name || typeof name !== 'string') {
    errors.push('Name must be a non-empty string.');
    return { valid: false, errors };
  }
  if (name.length > 214) errors.push('Name must be <= 214 characters.');
  if (name !== name.toLowerCase()) errors.push('Name must be lowercase.');
  if (/^[._]/.test(name)) errors.push('Name must not start with a dot or underscore.');
  if (/\s/.test(name)) errors.push('Name must not contain spaces.');
  if (/[~)(!'*]/.test(name)) errors.push('Name must not contain special characters.');
  return { valid: errors.length === 0, errors };
}

/**
 * Creates a package.json content string for a new project.
 * @param {string} name - Project name.
 * @param {string} template - Template name.
 * @param {Object} [opts={}] - Additional options.
 * @returns {string} JSON string.
 */
function createPackageJson(name, template, opts = {}) {
  const obj = {
    name,
    version: opts.version || '1.0.0',
    description: opts.description || '',
    main: 'src/index.js',
    scripts: { test: 'node --test tests/' },
    author: opts.author || '',
    license: 'MIT',
  };
  if (template === 'cli') {
    obj.bin = { [name]: 'bin/cli.js' };
  }
  return JSON.stringify(obj, null, 2);
}

/**
 * Initialises a git repository in the given directory.
 * @param {string} dir - Target directory path.
 * @returns {boolean} True if git init succeeded, false otherwise.
 */
function initGit(dir) {
  try {
    execSync('git init', { cwd: dir, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Scaffolds a new project from a built-in or custom template.
 * @param {string} name - Project name.
 * @param {string} [template='node'] - Template to use.
 * @param {string} [dir=process.cwd()] - Base directory.
 * @param {Object} [opts={}] - Additional options.
 * @param {boolean} [opts.git=false] - Whether to run git init.
 * @returns {{ success: boolean, projectDir: string, files: string[] }}
 * @throws {Error} If the name is invalid or the template does not exist.
 */
function scaffold(name, template = 'node', dir = process.cwd(), opts = {}) {
  const validation = validateName(name);
  if (!validation.valid) {
    throw new Error('Invalid project name: ' + validation.errors.join(', '));
  }
  if (!TEMPLATES[template]) {
    throw new Error('Unknown template "' + template + '". Available: ' + Object.keys(TEMPLATES).join(', '));
  }

  const projectDir = path.resolve(dir, name);
  if (fs.existsSync(projectDir)) {
    throw new Error('Directory already exists: ' + projectDir);
  }

  const templateDef = TEMPLATES[template];
  const files = templateDef.files(name);
  const createdFiles = [];

  for (const [relPath, content] of Object.entries(files)) {
    const absPath = path.join(projectDir, relPath);
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, content, 'utf8');
    createdFiles.push(relPath);
  }

  if (opts.git) {
    initGit(projectDir);
  }

  return { success: true, projectDir, files: createdFiles };
}

module.exports = {
  TEMPLATES,
  scaffold,
  listTemplates,
  addTemplate,
  validateName,
  createPackageJson,
  initGit,
};
