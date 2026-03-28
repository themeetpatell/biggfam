#!/usr/bin/env node
/**
 * Run DB migrations against Neon.
 * Usage: node db/migrate.js
 * Requires: DATABASE_URL in .env.local
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const __dir = dirname(fileURLToPath(import.meta.url))

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('❌  DATABASE_URL not set — check .env.local')
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)
  const schema = readFileSync(join(__dir, 'schema.sql'), 'utf8')

  // Split into individual statements (Neon doesn't support multi-statement queries)
  const statements = schema
    .split(';')
    .map(s =>
      s.split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim()
    )
    .filter(s => s.length > 0)

  console.log(`🚀  Running ${statements.length} migration statements...`)
  let done = 0
  try {
    for (const stmt of statements) {
      await sql.query(stmt)
      done++
    }
    console.log(`✅  Schema applied — ${done} statements run successfully`)
  } catch (err) {
    console.error(`❌  Migration failed on statement ${done + 1}:`, err.message)
    process.exit(1)
  }
}

migrate()
