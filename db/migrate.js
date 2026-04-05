#!/usr/bin/env node
/**
 * Run DB migrations against Supabase.
 * Usage: node db/migrate.js
 * Requires: DATABASE_URL in .env.local
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from 'dotenv'

config({ path: '.env.local' })

import pg from 'pg'
const { Client } = pg

const __dir = dirname(fileURLToPath(import.meta.url))

async function migrate() {
  // Support both full DATABASE_URL and split env vars
  const connectionConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT ?? 5432),
        database: process.env.DB_NAME ?? 'postgres',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: { rejectUnauthorized: false },
      }

  const hasConnection = process.env.DATABASE_URL || process.env.DB_HOST
  if (!hasConnection) {
    console.error('❌  DATABASE_URL (or DB_HOST/DB_USER/DB_PASSWORD) not set — check .env.local')
    process.exit(1)
  }

  const client = new Client(connectionConfig)
  await client.connect()
  console.log('✅  Connected to Supabase')

  const schema = readFileSync(join(__dir, 'schema.sql'), 'utf8')

  // Split into individual statements
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
      await client.query(stmt)
      done++
    }
    console.log(`✅  Schema applied — ${done} statements run successfully`)
  } catch (err) {
    console.error(`❌  Migration failed on statement ${done + 1}:`, err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

migrate()
