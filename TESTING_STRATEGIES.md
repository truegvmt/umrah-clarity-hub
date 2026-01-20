## Testing Strategies

### SQLite Database: `data/db.db`

- **Objective**: Ensure the local SQLite database matches the intended Tahqeeq Email Automator schema and remains stable over time.

- **Initialization / Migration Checkpoints**
  - **Script**: `node scripts/init-sqlite.cjs`
    - Confirms the `data` directory exists and creates it if needed.
    - Applies the full schema (dropping and recreating `leads` and `templates` tables).
    - Logs:
      - The resolved DB path.
      - A success message when schema application completes.
      - A list of all tables and indexes discovered in `sqlite_master`.
    - **Run**:
      ```bash
      node scripts/init-sqlite.cjs
      ```

- **Schema Verification Checkpoints**
  - **Tables**:
    - `leads` with:
      - `id` as `TEXT PRIMARY KEY` with a default RFC4122 v4-style UUID expression.
      - Required columns: `company`, `contact_name`, `email` (UNIQUE), `sector`.
      - Optional / scoring columns: `signal_strength` (0–10), `ai_score` (0–10).
      - Phase column: `phase` with default `'Initial'` and CHECK constraint limiting to:
        - `Initial`, `Reminder`, `Escalation`, `Pitch`, `Trigger Follow-Up`.
      - Temporal / metadata fields: `signal_date` (ISO-8601 text), `last_updated` defaulting to current UTC via `strftime(...)`.
    - `templates` with:
      - `id` as `TEXT PRIMARY KEY` with the same UUID-style default.
      - `name` (required), `phase` (required with the same CHECK constraint values), `body` (required).
  - **Indexes**:
    - `idx_leads_email` on `leads(email)`.
    - `idx_leads_phase` on `leads(phase)`.
    - `idx_leads_signal_strength` on `leads(signal_strength)`.
    - `idx_templates_phase` on `templates(phase)`.
  - **How to Check Programmatically**:
    - Reuse the pattern from `scripts/init-sqlite.cjs`:
      - Query `sqlite_master`:
        ```sql
        SELECT name, type, sql
        FROM sqlite_master
        WHERE type IN ('table', 'index')
        ORDER BY type, name;
        ```
      - Assert presence of required tables and indexes and review `sql` definitions as needed.

- **Runtime Health Checks (Node Integration)**
  - On application startup (or in a dedicated health-check script):
    - Open `data/db.db` with `sqlite3` from Node.
    - Run a lightweight query:
      ```sql
      SELECT COUNT(*) AS cnt FROM leads;
      ```
    - Optionally run:
      ```sql
      SELECT COUNT(*) AS cnt FROM templates;
      ```
    - Log or expose via a health endpoint:
      - That the DB connection succeeded.
      - row counts for key tables, to verify accessibility and basic integrity.

- **Performance / Regression Monitoring**
  - Periodically:
    - `EXPLAIN QUERY PLAN` for critical queries using `phase`, `email`, and `signal_strength` filters to ensure the intended indexes are used.
    - Track response time of any endpoints that hit `leads` and `templates` (if/when a backend is added) and note regressions when schema or query patterns change.

