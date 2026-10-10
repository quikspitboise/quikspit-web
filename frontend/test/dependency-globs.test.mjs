import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createRequire } from 'node:module'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const require = createRequire(import.meta.url)
const nextConfigRequire = createRequire(require.resolve('eslint-config-next'))
const { getRootDirs } = nextConfigRequire('@next/eslint-plugin-next/dist/utils/get-root-dirs.js')
const linkRule = nextConfigRequire('@next/eslint-plugin-next/dist/rules/no-html-link-for-pages.js').default
const fixture = mkdtempSync(join(tmpdir(), 'quikspit-lint-roots-'))
const first = join(fixture, 'first')
const second = join(fixture, 'second')
mkdirSync(join(first, 'nested'), { recursive: true })
mkdirSync(second)
after(() => rmSync(fixture, { recursive: true, force: true }))

function roots(rootDir) {
  return getRootDirs({ cwd: fixture, settings: { next: { rootDir } } })
    .map((directory) => resolve(directory))
    .sort()
}

test('Next lint uses only the configured literal root, not its descendants', () => {
  assert.deepEqual(roots(first), [first])
  assert.deepEqual(roots(undefined), [fixture])
})

test('Next lint resolves directory globs, brace alternatives, and root arrays', () => {
  const expected = [first, second]
  assert.deepEqual(roots(join(fixture, '*')), expected)
  assert.deepEqual(roots(join(fixture, '{first,second}')), expected)
  assert.deepEqual(roots([first, second]), expected)
  assert.deepEqual(roots(join(fixture, 'missing')), [])
  assert.deepEqual(roots(first.replaceAll('/', '\\')), [first])
})

test('Next lint excludes the parent from terminal recursive directory globs', () => {
  assert.deepEqual(roots(join(first, '**')), [join(first, 'nested')])
  assert.deepEqual(roots(join(first, '**') + '/'), [join(first, 'nested')])
})

test('Next lint retains numeric, padded, stepped, and alphabetic brace ranges', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'quikspit-lint-ranges-'))
  try {
    for (const name of ['1', '2', '3', '01', '02', '03', 'a', 'b', 'c']) {
      mkdirSync(join(fixture, name))
    }
    for (const [pattern, names] of [
      ['{1..3}', ['1', '2', '3']],
      ['{01..03}', ['01', '02', '03']],
      ['{1..3..2}', ['1', '3']],
      ['{a..c}', ['a', 'b', 'c']],
    ]) {
      assert.deepEqual(roots(join(fixture, pattern)), names.map((name) => join(fixture, name)))
    }
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})

test('Next lint follows directory symlinks while preserving their configured path', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'quikspit-lint-symlink-'))
  try {
    const link = join(fixture, 'linked')
    symlinkSync(first, link, 'junction')
    assert.deepEqual(roots(link), [link])
    assert.deepEqual(roots(join(link, '**')), [join(link, 'nested')])
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})

test('Next lint handles deeply nested braces and parentheses without stack exhaustion', () => {
  for (const [open, close] of [['{', '}'], ['(', ')']]) {
    const nested = open.repeat(4500) + 'missing' + close.repeat(4500)
    assert.deepEqual(roots(join(fixture, nested)), [])
    const negative = open.repeat(4500) + '!(missing)' + close.repeat(4500)
    assert.deepEqual(roots(join(fixture, negative)), [])
  }
})

test('Next lint skips broken and cyclic directory symlinks', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'quikspit-lint-broken-links-'))
  try {
    const directory = join(fixture, 'valid')
    mkdirSync(directory)
    symlinkSync(join(fixture, 'missing'), join(fixture, 'broken'))
    symlinkSync(join(fixture, 'loop'), join(fixture, 'loop'))
    assert.deepEqual(roots(join(fixture, '*')), [directory])
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})

test('Next lint retains hidden roots matched by negative extglobs', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'quikspit-lint-negative-'))
  try {
    for (const directory of ['.hidden', 'one', 'two']) {
      mkdirSync(join(fixture, directory, 'src'), { recursive: true })
      mkdirSync(join(fixture, directory, '.private'))
    }
    assert.deepEqual(roots(join(fixture, '!(one)')), [join(fixture, '.hidden'), join(fixture, 'two')])
    assert.deepEqual(roots(join(fixture, '!(one)', '*')), [join(fixture, '.hidden', 'src'), join(fixture, 'two', 'src')])
    mkdirSync(join(fixture, '.hidden', 'src', 'app'))
    writeFileSync(join(fixture, '.hidden', 'src', 'app', 'page.tsx'), 'export default function Page() { return null }')
    const reports = []
    const listener = linkRule.create({
      cwd: fixture,
      options: [],
      settings: { next: { rootDir: join(fixture, '!(one)') } },
      report: (report) => reports.push(report),
    })
    listener.JSXOpeningElement({
      name: { name: 'a' },
      attributes: [{ type: 'JSXAttribute', name: { name: 'href' }, value: { type: 'Literal', value: '/' } }],
    })
    assert.equal(reports.length, 1)
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})
