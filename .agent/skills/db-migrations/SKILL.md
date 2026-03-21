---
name: db-migrations
description: "Use when modifying database schema — adding/removing columns, creating tables, changing relationships. Covers SQLAlchemy + Alembic workflow, SQLite vs PostgreSQL traps, and safe deployment to any PostgreSQL provider (Supabase, Railway, Render, etc)."
---

# Database Migrations

## When to Use
- Adding/removing/modifying columns or tables
- Changing relationships or constraints
- First time setting up migrations in a project
- Deploying schema changes to production (any PostgreSQL provider)

---

## Choose Your Approach

| Scenario | Approach |
|---|---|
| Project uses SQLAlchemy | Alembic (see below) |
| Project uses raw SQL / no ORM | Manual `.sql` migration files |
| Supabase project | Supabase Dashboard migrations OR Alembic against Supabase PostgreSQL |
| Simple project, no ORM | `CREATE TABLE IF NOT EXISTS` + version tracking manual |

---

## Alembic Workflow (SQLAlchemy projects)

### Initial Setup (once per project)
```bash
pip install alembic
alembic init alembic
```

Configure `alembic/env.py`:
```python
import os
from app.database import Base
from app.models import *  # all models must be imported

target_metadata = Base.metadata
```

Use env var for DB URL (keeps dev/prod flexible):
```python
def run_migrations_online():
    url = os.getenv("DATABASE_URL", config.get_main_option("sqlalchemy.url"))
    connectable = create_engine(url)
    # ... rest of function
```

### The Cycle
```
1. Modify model  →  2. Generate migration  →  3. REVIEW it  →  4. Apply local  →  5. Apply prod
```

```bash
# 2. Generate
alembic revision --autogenerate -m "add name column to users"

# 3. REVIEW — never skip this
# Open alembic/versions/xxx_add_name.py and verify

# 4. Apply local
alembic upgrade head

# 5. Apply production
DATABASE_URL="postgresql://..." alembic upgrade head
```

### Rollback
```bash
alembic downgrade -1      # undo last
alembic downgrade abc123  # specific revision
alembic downgrade base    # undo all
```

---

## SQLite vs PostgreSQL Traps

This applies regardless of what migration tool you use.

| What | SQLite | PostgreSQL | Fix |
|---|---|---|---|
| `ADD COLUMN` with `NOT NULL` | Works (ignores) | FAILS if rows exist | `nullable=True` or `server_default` |
| `ADD COLUMN ... REFERENCES` | Works | FAILS | Separate foreign key creation |
| Boolean `0`/`1` | Works | FAILS | Use `True`/`False` |
| `ALTER COLUMN` type | Not supported | Works | `batch_op` for SQLite |
| `DROP COLUMN` | Not supported (<3.35) | Works | `batch_op` for SQLite |
| String without length | Works | Risky | Specify `String(255)` |

### batch_op (SQLite compatibility)
```python
with op.batch_alter_table('users') as batch_op:
    batch_op.add_column(sa.Column('name', sa.String(255)))
    batch_op.drop_column('old_column')
```

---

## SQLite Performance Patterns

### WAL Mode (concurrent reads)
Enable at app startup for any SQLite project with concurrent access:
```python
# At connection time
connection.execute("PRAGMA journal_mode=WAL")
connection.execute("PRAGMA busy_timeout=5000")
```

### Covering Indexes
Create at app startup for known heavy queries. A covering index includes all columns the query needs, so SQLite never touches the main table:
```sql
-- Example: query that filters by status and sorts by created_at, returns name
CREATE INDEX IF NOT EXISTS idx_orders_status_created_name
ON orders(status, created_at DESC, name);
```
Rule: if a query runs often and touches >1000 rows, add a covering index.

### Temporal Views (run-based data)
For SaaS that ingests data periodically (scraping, syncs, imports), never overwrite — tag each ingestion with a `run_id`:
```sql
-- Always query latest run
CREATE VIEW v_latest_prices AS
SELECT p.* FROM prices p
JOIN runs r ON p.run_id = r.id
WHERE r.id = (SELECT MAX(id) FROM runs WHERE status = 'COMPLETE');
```

### Upsert Pattern (catalog maintenance)
For reference data that gets synced from external sources:
```python
# SQLAlchemy
from sqlalchemy.dialects.sqlite import insert

stmt = insert(Product).values(id=ext_id, name=ext_name, updated_at=now)
stmt = stmt.on_conflict_do_update(
    index_elements=['id'],
    set_={'name': stmt.excluded.name, 'updated_at': stmt.excluded.updated_at}
)
session.execute(stmt)
```

PostgreSQL equivalent:
```sql
INSERT INTO products (id, name, updated_at)
VALUES (:id, :name, :now)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = EXCLUDED.updated_at;
```

---

## Common Mistakes

1. **`create_all()` in production** — skips migrations, causes drift. Dev only.
2. **Models not imported in `env.py`** — autogenerate says "no changes detected"
3. **"Target database is not up to date"** — run `alembic stamp head` to sync state
4. **Detached instance after migration** — use `db.merge(obj)` not `db.add(obj)`
5. **No WAL mode on SQLite** — concurrent reads block each other. Always enable WAL.
6. **Missing indexes on filtered columns** — if `WHERE column = X` is slow, add an index. Check with `EXPLAIN QUERY PLAN`.
7. **Overwriting data instead of versioning** — for periodic imports, use run-based versioning, not `DELETE + INSERT`.

---

## Pre-Deploy Checklist

- [ ] Migration reviewed manually (no blind apply)
- [ ] New columns use `nullable=True` or `server_default`
- [ ] No SQLite-only patterns going to PostgreSQL
- [ ] Applied locally first
- [ ] Tested against PostgreSQL (not just SQLite)
- [ ] Applied to production with correct `DATABASE_URL`
- [ ] Verified with `alembic current` or equivalent
- [ ] App still works after migration
