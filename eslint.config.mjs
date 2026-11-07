import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'

// Same rule set as the old .eslintrc.json: Next.js core-web-vitals plus the
// Next.js TypeScript rules. eslint-config-next 15 ships legacy-format configs,
// so FlatCompat converts them for the flat config used by the ESLint CLI.
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
})

const eslintConfig = [
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'node_modules/**', 'public/**', 'next-env.d.ts'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
]

export default eslintConfig
