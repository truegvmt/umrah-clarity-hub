## Bugs and Terminal Errors Log

- **Issue**: `sqlite3` CLI not recognized in PowerShell  
  - **Context**: Attempted to run `sqlite3 --version` to inspect and initialize `data/db.db`.  
  - **Error Message**:  
    - `sqlite3 : The term 'sqlite3' is not recognized as the name of a cmdlet, function, script file, or operable program.`  
  - **Classification**: Environment / tooling issue.  
  - **Solution**:  
    - Avoid reliance on the `sqlite3` CLI and instead use the Node `sqlite3` package already present in `package.json`.  
    - Implement schema initialization and inspection via a dedicated Node script (`scripts/init-sqlite.cjs`) using `db.exec` and queries on `sqlite_master`.  
  - **Testing Strategy**:  
    - Run `node scripts/init-sqlite.cjs` and verify console output for successful schema application and listing of tables/indexes.  
    - Optionally add small integration tests that import the same logic and assert that `leads` and `templates` tables exist.

- **Issue**: Node one-liner (`node -e`) quoting problems in PowerShell (repeated)  
  - **Context**: Tried to inspect the SQLite schema using `node -e` with complex SQL and nested quotes.  
  - **Error Messages** (examples):  
    - `SyntaxError: missing ) after argument list`  
    - `SyntaxError: Invalid or unexpected token` followed by PowerShell complaining about a partially parsed string.  
  - **Classification**: **Repeated** quoting/parsing issue due to PowerShell + `node -e` interaction.  
  - **Solution**:  
    - Stop using `node -e` for anything beyond trivial expressions, especially when SQL queries and backticks/quotes are involved.  
    - Prefer small, checked-in Node scripts (e.g., `scripts/init-sqlite.cjs`) that can be run with `node <script>`, which bypasses shell quoting complexity.  
  - **Testing Strategy**:  
    - For any future DB inspection or maintenance tasks, add or update scripted utilities under `scripts/` and invoke them directly with `node`.  
    - Ensure scripts log clear success/failure messages and exit codes so CI or manual runs can reliably detect issues.

