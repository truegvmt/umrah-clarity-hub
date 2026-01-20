// Initialize and finalize the local SQLite database at data/db.db
// based on the Tahqeeq Email Automator schema (adapted for SQLite).

const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Resolve DB path relative to repo root
const dbPath = path.resolve(__dirname, '..', 'data', 'db.db');

console.log('Using SQLite database at:', dbPath);

// Ensure the data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open SQLite database:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  // Schema adapted from Supabase/Postgres version:
  // - No CREATE EXTENSION / CREATE TYPE (SQLite doesn't support these).
  // - UUID stored as TEXT with a DEFAULT expression generating RFC4122 v4 style IDs.
  // - outreach_phase modeled as TEXT with a CHECK constraint.

  const schemaSql = `
    PRAGMA foreign_keys = OFF;

    -- Drop existing objects if they exist (idempotent initialization)
    DROP TABLE IF EXISTS leads;
    DROP TABLE IF EXISTS templates;

    -- Create leads table
    CREATE TABLE leads (
      id TEXT PRIMARY KEY DEFAULT (
        lower(
          hex(randomblob(4)) || '-' ||
          hex(randomblob(2)) || '-4' ||
          substr(hex(randomblob(2)), 2) || '-' ||
          substr('89ab', abs(random()) % 4 + 1, 1) ||
          substr(hex(randomblob(2)), 2) || '-' ||
          hex(randomblob(6))
        )
      ),
      company TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      sector TEXT NOT NULL,
      pain_question TEXT,
      context_hook TEXT,
      signal_trigger TEXT,
      signal_date TEXT, -- stored as ISO-8601 text (TIMESTAMP-equivalent)
      signal_strength INTEGER CHECK (signal_strength BETWEEN 0 AND 10),
      phase TEXT DEFAULT 'Initial' CHECK (
        phase IN (
          'Initial',
          'Reminder',
          'Escalation',
          'Pitch',
          'Trigger Follow-Up'
        )
      ),
      ai_score INTEGER CHECK (ai_score BETWEEN 0 AND 10),
      last_updated TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      notes TEXT,
      generated_draft TEXT
    );

    -- Create templates table
    CREATE TABLE templates (
      id TEXT PRIMARY KEY DEFAULT (
        lower(
          hex(randomblob(4)) || '-' ||
          hex(randomblob(2)) || '-4' ||
          substr(hex(randomblob(2)), 2) || '-' ||
          substr('89ab', abs(random()) % 4 + 1, 1) ||
          substr(hex(randomblob(2)), 2) || '-' ||
          hex(randomblob(6))
        )
      ),
      name TEXT NOT NULL,
      phase TEXT NOT NULL CHECK (
        phase IN (
          'Initial',
          'Reminder',
          'Escalation',
          'Pitch',
          'Trigger Follow-Up'
        )
      ),
      body TEXT NOT NULL
    );

    -- Indexes for performance (mirroring Supabase/Postgres intent)
    CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
    CREATE INDEX IF NOT EXISTS idx_leads_phase ON leads (phase);
    CREATE INDEX IF NOT EXISTS idx_leads_signal_strength ON leads (signal_strength);
    CREATE INDEX IF NOT EXISTS idx_templates_phase ON templates (phase);
  `;

  db.exec(schemaSql, (err) => {
    if (err) {
      console.error('Error applying SQLite schema:', err.message);
      process.exitCode = 1;
      return;
    }

    console.log('SQLite schema applied successfully.');

    // Sanity check: list tables and indexes
    db.all(
      "SELECT name, type, sql FROM sqlite_master WHERE type IN ('table','index') ORDER BY type, name;",
      (inspectErr, rows) => {
        if (inspectErr) {
          console.error('Error inspecting schema:', inspectErr.message);
          process.exitCode = 1;
        } else {
          console.log('Current schema objects:');
          rows.forEach((row) => {
            console.log(`- [${row.type}] ${row.name}`);
          });
        }

        db.close((closeErr) => {
          if (closeErr) {
            console.error('Error closing SQLite database:', closeErr.message);
            process.exitCode = 1;
          } else {
            console.log('SQLite database finalized and closed.');
          }
        });
      }
    );
  });
});

