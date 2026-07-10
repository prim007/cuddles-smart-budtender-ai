# Dispensary Network Routing Layer — Technical Spec

Goal: turn the current per-tenant `tenant_strains` silo into a **network** where a single query ("nearest in-stock Blue Dream under R250") is fanned out across every eligible dispensary, ranked, and returned as a routed result the chat / widget can act on.

## 1. What the routing layer does

Given a request `{ intent, strain?, category?, effect?, location, filters }`, it:

1. Resolves candidate tenants (active, subscribed, geo-eligible).
2. Queries `tenant_strains` across those tenants for matches.
3. Scores each hit on: distance, price, stock, rating, tenant priority (paid tier), freshness of last inventory sync.
4. Returns a ranked list of `{ tenant, strain, score, reasons[] }` plus a `routing_id` for analytics.
5. Logs the routing decision so we can tune weights and prove ROI to dispensaries.

## 2. New database objects

### `tenant_service_areas`
Which geographic areas each tenant serves (delivery radius or pickup city).
Fields: `tenant_id`, `center_lat`, `center_lng`, `radius_km`, `mode` (`pickup` | `delivery`), `active`.

### `tenant_priority`
Paid boost + fairness caps per tenant.
Fields: `tenant_id`, `tier` (`standard` | `boosted` | `premium`), `boost_weight` (0–1), `daily_impression_cap`, `active`.

### `routing_decisions`
Every routing call, for analytics + billing.
Fields: `id`, `query` (jsonb — intent, filters, location), `candidate_count`, `winner_tenant_id`, `winner_strain_id`, `score`, `latency_ms`, `session_id`, `created_at`.

### `routing_impressions`
Which tenants were shown for a given decision (impression billing).
Fields: `routing_decision_id`, `tenant_id`, `strain_id`, `rank`, `score`.

### Extensions to existing tables
- `tenant_strains`: add `last_synced_at`, `stock_level` (int, nullable), `sync_source` (`manual` | `dutchie` | `flowhub` | ...). Enables freshness weighting.
- `tenants`: add `default_lat`, `default_lng` (fallback when no service area rows).

### RLS summary (plain English)
- Service areas & priority: readable by anyone (needed for routing), writable only by the owning tenant or admin.
- Routing decisions & impressions: insertable by the routing function (service role), readable by admin + the tenant whose rows they involve.
- No anon writes anywhere.

## 3. Edge function: `route-dispensary-query`

Path: `supabase/functions/route-dispensary-query/index.ts`
Auth: accepts both `authenticated` and `anon` (rate-limited per IP; chat needs to work logged-out).

### Request
```json
{
  "intent": "find_strain" | "find_category" | "find_effect" | "find_nearest",
  "strain_name": "Blue Dream",
  "category": null,
  "effect": null,
  "location": { "lat": -26.20, "lng": 28.04 },
  "max_distance_km": 25,
  "max_price": 250,
  "mode": "pickup" | "delivery" | "any",
  "limit": 5,
  "session_id": "uuid"
}
```

### Response
```json
{
  "routing_id": "uuid",
  "results": [
    {
      "tenant": { "id", "name", "slug", "phone", "maps_url" },
      "strain": { "id", "name", "price", "stock_level", "category" },
      "distance_km": 3.2,
      "score": 0.87,
      "reasons": ["in stock", "1.8km closer", "R30 cheaper"]
    }
  ]
}
```

### Scoring formula (v1)
```text
score = 0.35 * distance_norm      (closer = higher)
      + 0.20 * price_norm         (cheaper within budget)
      + 0.20 * stock_norm         (in-stock > low > unknown)
      + 0.10 * freshness_norm     (synced <24h > <7d > older)
      + 0.10 * rating_norm
      + 0.05 * tenant.boost_weight
```
All `*_norm` values clamped to [0,1]. Boost is capped at 5% so paid priority never overrides a materially better match — this is the fairness guarantee we can quote to dispensaries.

### Side effects
- Insert one `routing_decisions` row.
- Insert one `routing_impressions` row per returned result.
- Respect `tenant_priority.daily_impression_cap` (skip capped tenants for the day).

## 4. Chat / widget integration

- `smart-budtender` and `public/widget.js` gain a client helper `routeDispensaryQuery(...)` called when the intent classifier detects "find / near me / cheapest / in stock".
- Results render through the existing `ChatDispensaryCards` component with an added "Why this pick?" chip that expands the `reasons[]` array.
- Menu-card intent (existing `matchMenuIntent`) stays first — a direct "show Dirty Vapes menu" keeps its deterministic path and never touches the router.

## 5. Analytics surface

New admin page `/network-analytics` (admin-gated) showing:
- Routing volume by day
- Win rate per tenant (impressions vs. winner)
- Avg distance / price of winners
- Cap utilization per tenant tier

Feeds directly from `routing_decisions` + `routing_impressions`.

## 6. Rollout order

1. Migration: new tables, RLS, column additions, GRANTs.
2. Backfill: default `tenant_service_areas` rows from existing tenant addresses; default `tenant_priority` = `standard` for all.
3. Edge function `route-dispensary-query` + unit-style test via `curl_edge_functions`.
4. Wire into `widget.js` behind a `network_routing_enabled` flag (per-tenant boolean on `tenants`) so we can pilot with Tripple444 first.
5. Ship `/network-analytics`.
6. Turn the flag on for Lëf Labs and Dirty Vapes once weights look sane.

## 7. What this unlocks (business framing)

- **For users**: one question → best match across every dispensary, not just the one they happened to land on.
- **For dispensaries**: transparent, capped paid priority + real impression data = a defensible reason to pay for the Premium tier.
- **For Cuddles**: every routed query becomes a training signal (which weights actually convert) and a billing event.

## 8. Out of scope for v1

- Real-time POS webhook ingestion (covered by the earlier POS adapter spec; router just reads whatever `tenant_strains` currently holds).
- Cross-border routing / currency conversion.
- Auction-style bidding for placement — starts as fixed tiers, revisited once we have volume.

Reply **"build it"** to execute the migration + edge function, or name sections to change first.
