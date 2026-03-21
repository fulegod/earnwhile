---
name: api-design-patterns
description: Reusable REST API patterns for SaaS applications. Use when designing endpoints, implementing search/filtering, adding pagination, building cache layers, or structuring API responses. Covers multi-filter search, geographic drill-down, cache with version invalidation, and standard response formats.
---

# API Design Patterns

Patterns for building consistent, performant REST APIs in SaaS applications.

## When to Use

- Designing new API endpoints
- Adding search, filtering, or pagination
- Implementing cache strategy
- Structuring API responses
- Building analytics or comparison endpoints

---

## 1. Standard Response Format

Every endpoint returns the same envelope:

```python
# Success
{
    "status": "ok",
    "data": { ... },          # or [...]
    "meta": {
        "total": 150,
        "page": 1,
        "page_size": 20,
        "pages": 8
    }
}

# Error
{
    "status": "error",
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid date range",
        "details": { "field": "date_from" }
    }
}
```

---

## 2. Multi-Filter Search with Pagination

The most common SaaS endpoint. Parameterize filters by domain but keep the structure identical:

```python
@router.get("/items/search")
async def search_items(
    q: str = None,                    # text search
    category: str = None,             # dimension filter
    status: str = None,               # state filter
    price_min: float = None,          # range filter
    price_max: float = None,          # range filter
    sort_by: str = "created_at",      # sorting
    sort_dir: str = "desc",           # asc/desc
    page: int = 1,                    # pagination
    page_size: int = 20,              # limit (cap at 100)
):
    page_size = min(page_size, 100)   # never allow unbounded
    offset = (page - 1) * page_size

    query = build_query(filters)       # dynamic WHERE clauses
    total = count_query(filters)
    items = query.limit(page_size).offset(offset).all()

    return {
        "status": "ok",
        "data": items,
        "meta": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": ceil(total / page_size)
        }
    }
```

**Rules:**
- Cap `page_size` at 100 (prevent accidental full-table dumps)
- Default sort by `created_at DESC` (newest first)
- Filters are AND — all must match
- Empty filter = no filter (don't require all params)
- Text search: use `ILIKE %q%` for small datasets, full-text search for large

---

## 3. Cache with Version-Based Invalidation

For endpoints that query data that changes periodically (imports, syncs):

```python
from functools import lru_cache
from datetime import datetime, timedelta

class VersionedCache:
    def __init__(self, ttl_seconds: int = 300):
        self.ttl = ttl_seconds
        self.cache = {}
        self.data_version = None

    def get(self, key: str, data_version: str):
        if key in self.cache:
            entry = self.cache[key]
            is_fresh = (datetime.now() - entry["ts"]).seconds < self.ttl
            same_version = entry["version"] == data_version
            if is_fresh and same_version:
                return entry["value"]
        return None

    def set(self, key: str, value, data_version: str):
        self.cache[key] = {
            "value": value,
            "ts": datetime.now(),
            "version": data_version
        }
```

**When to cache:**
- Aggregation queries (SUM, AVG, COUNT GROUP BY)
- Endpoints called >10x/min with same params
- Data that changes on known schedule (daily import, hourly sync)

**When NOT to cache:**
- User-specific data (permissions, preferences)
- Write-then-read flows (user expects immediate consistency)

---

## 4. Geographic Drill-Down

For location-aware SaaS. Each level narrows the scope:

```
GET /analytics/geo                          → country-level summary
GET /analytics/geo?department=LIMA          → department detail
GET /analytics/geo?department=LIMA&province=LIMA → province detail
```

```python
@router.get("/analytics/geo")
async def geo_analytics(
    department: str = None,
    province: str = None,
    district: str = None,
):
    # Determine aggregation level from params
    if district:
        level = "district"
        group_by = "district"
    elif province:
        level = "province"
        group_by = "district"   # drill down to next level
    elif department:
        level = "department"
        group_by = "province"
    else:
        level = "country"
        group_by = "department"

    results = aggregate_by(group_by, filters)
    return {"level": level, "data": results}
```

**Pattern:** current param = filter, next level down = GROUP BY.

---

## 5. Comparison Endpoints

For benchmarking or competitive analysis (my metrics vs others):

```python
@router.get("/compare")
async def compare_entities(
    entity_id: str,                   # "my" entity
    compare_to: list[str] = Query(),  # list of IDs to compare against
    metric: str = "price",            # what to compare
):
    my_data = get_metrics(entity_id, metric)
    their_data = [get_metrics(id, metric) for id in compare_to]

    return {
        "entity": my_data,
        "comparisons": their_data,
        "summary": {
            "my_median": median(my_data.values),
            "market_median": median(all_values),
            "position_pct": percentile_rank(my_median, all_values),
            "above_market": my_median > market_median,
        }
    }
```

---

## 6. Bulk Operations

For import/export and batch updates:

```python
@router.post("/items/bulk")
async def bulk_create(items: list[ItemCreate]):
    if len(items) > 1000:
        raise HTTPException(400, "Max 1000 items per request")

    results = {"created": 0, "updated": 0, "errors": []}

    for i, item in enumerate(items):
        try:
            upsert(item)
            results["created"] += 1
        except Exception as e:
            results["errors"].append({"index": i, "error": str(e)})

    return results
```

**Rules:**
- Always cap batch size (1000 is reasonable)
- Return per-item results (don't fail entire batch on one error)
- Use upsert, not separate create/update logic

---

## 7. Common Mistakes

| Mistake | Fix |
|---|---|
| No pagination on list endpoints | Always paginate. Default 20, max 100 |
| Returning entire nested objects | Use `fields` param or separate detail endpoint |
| Cache without invalidation | Always tie cache to data version or TTL |
| Inconsistent response format | Use the standard envelope everywhere |
| Filtering in application code | Filter in SQL, not after fetching all rows |
| No rate limiting | Add per-IP or per-token limits on expensive endpoints |
| Exposing internal IDs in URLs | Use UUIDs or slugs for public-facing resources |
