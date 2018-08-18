'use strict';

/**
 * @fileoverview Tests for initproject.
 * @author idirdev
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  scaffold,
  listTemplates,
  addTemplate,
  validateName,
  createPackageJson,
} = require('../src/index.js');

let tmpDir;

before(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'initproject-test-'));
});

after(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('validateName', () => {
  it('accepts valid names', () => {
    assert.deepEqual(validateName('my-pkg').errors, []);
    assert.strictEqual(validateName('my-pkg').valid, true);
  });

  it('rejects uppercase names', () => {
    const r = validateName('MyPkg');
    assert.strictEqual(r.valid, false);
    assert.ok(r.errors.some(e => e.includes('lowercase')));
  });

  it('rejects names starting with a dot', () => {
    assert.strictEqual(validateName('.hidden').valid, false);
  });

  it('rejects names with spaces', () => {
    assert.strictEqual(validateName('my pkg').valid, false);
  });

  it('rejects empty names', () => {
    assert.strictEqual(validateName('').valid, false);
    assert.strictEqual(validateName(null).valid, false);
  });
});

describe('listTemplates', () => {
  it('returns an array with at least 4 templates', () => {
    const list = listTemplates();
    assert.ok(Array.isArray(list));
    assert.ok(list.length >= 4);
  });

  it('each entry has name and description', () => {
    listTemplates().forEach(t => {
      assert.ok(typeof t.name === 'string');
      assert.ok(typeof t.description === 'string');
    });
  });
});

describe('addTemplate', () => {
  it('registers a custom template', () => {
    addTemplate('custom-test', {
      description: 'Custom template for testing',
      files: (name) => ({ 'custom.txt': 'hello ' + name }),
    });
    const list = listTemplates();
    assert.ok(list.some(t => t.name === 'custom-test'));
  });

  it('throws if template already exists', () => {
    assert.throws(() => addTemplate('node', { files: () => ({}) }), /already exists/);
  });
});

describe('scaffold (node template)', () => {
  it('creates expected files', () => {
    const result = scaffold('my-node-app', 'node', tmpDir);
    assert.strictEqual(result.success, true);
    assert.ok(result.files.includes('src/index.js'));
    assert.ok(result.files.includes('package.json'));
    assert.ok(result.files.includes('README.md'));
  });

  it('writes valid package.json', () => {
    const pkgPath = path.join(tmpDir, 'my-node-app', 'package.json');
    const parsed = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    assert.strictEqual(parsed.name, 'my-node-app');
  });

  it('throws if directory already exists', () => {
    assert.throws(() => scaffold('my-node-app', 'node', tmpDir), /already exists/);
  });
});

describe('scaffold (express template)', () => {
  it('creates server.js, routes/, middleware/', () => {
    const result = scaffold('my-express-app', 'express', tmpDir);
    assert.ok(result.files.includes('server.js'));
    assert.ok(result.files.includes('routes/index.js'));
    assert.ok(result.files.includes('middleware/logger.js'));
  });
});

describe('scaffold (cli template)', () => {
  it('creates bin/cli.js', () => {
    const result = scaffold('my-cli-app', 'cli', tmpDir);
    assert.ok(result.files.includes('bin/cli.js'));
  });

  it('package.json has bin field', () => {
    const pkgPath = path.join(tmpDir, 'my-cli-app', 'package.json');
    const parsed = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    assert.ok(parsed.bin && parsed.bin['my-cli-app']);
  });
});

describe('scaffold (library template)', () => {
  it('creates library src with named exports', () => {
    const result = scaffold('my-library', 'library', tmpDir);
    assert.ok(result.files.includes('src/index.js'));
    const src = fs.readFileSync(path.join(tmpDir, 'my-library', 'src/index.js'), 'utf8');
    assert.ok(src.includes('module.exports'));
  });
});

describe('createPackageJson', () => {
  it('returns valid JSON with correct name', () => {
    const s = createPackageJson('test-pkg', 'node', { author: 'me' });
    const p = JSON.parse(s);
    assert.strictEqual(p.name, 'test-pkg');
    assert.strictEqual(p.author, 'me');
  });

  it('adds bin field for cli template', () => {
    const s = createPackageJson('test-cli', 'cli');
    const p = JSON.parse(s);
    assert.ok(p.bin && p.bin['test-cli']);
  });
});
