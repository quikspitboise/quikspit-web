import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createRequire } from 'node:module'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Exercise the YAML loader reached by the backend's coverage transformer.
let coverageRequire = createRequire(new URL('../../backend/package.json', import.meta.url))
for (const dependency of ['ts-jest', 'babel-jest', 'babel-plugin-istanbul']) {
  coverageRequire = createRequire(coverageRequire.resolve(dependency))
}
const { loadNycConfig } = coverageRequire('@istanbuljs/load-nyc-config')

test('coverage still loads YAML configuration after removing the legacy formatter', async () => {
  const fixture = mkdtempSync(join(tmpdir(), 'quikspit-coverage-yaml-'))
  try {
    writeFileSync(join(fixture, 'package.json'), '{}')
    writeFileSync(join(fixture, '.nycrc.yaml'), [
      'all: true',
      'check-coverage: true',
      'include:',
      '  - "src/**/*.ts"',
      'exclude: "**/*.spec.ts"',
      'extension: ".ts"',
      'reporter:',
      '  - text',
      '',
    ].join('\n'))
    const config = await loadNycConfig({ cwd: fixture })
    assert.equal(config.cwd, fixture)
    assert.equal(config.all, true)
    assert.equal(config.checkCoverage, true)
    assert.deepEqual(config.include, ['src/**/*.ts'])
    assert.deepEqual(config.exclude, ['**/*.spec.ts'])
    assert.deepEqual(config.extension, ['.ts'])
    assert.deepEqual(config.reporter, ['text'])
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})
