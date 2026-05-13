# GuildForge API — Rate Limiting Reference

All API routes are protected by rate limiting to prevent abuse and manage costs.

## Global Limits

| Scope | Max Requests | Window | Key |
|-------|-------------|--------|-----|
| All routes | 120 | 1 minute | IP address |

## Per-Route Limits

| Endpoint | Max | Window | Key | Rationale |
|----------|-----|--------|-----|-----------|
| `POST /conversations/:id/plan` | 10 | 1 hour | User ID | Expensive AI plan generation |
| `POST /conversations/:id/messages` | 30 | 10 minutes | User ID | AI chat refinement costs |
| All other routes | 120 | 1 minute | IP (global) | Standard API protection |

## Error Response

When rate limited, the API returns:
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Retry in 42 seconds.",
  "statusCode": 429
}
```

## Headers

Rate limit info is included in response headers:
- `X-RateLimit-Limit` — Max requests allowed
- `X-RateLimit-Remaining` — Remaining requests in window
- `X-RateLimit-Reset` — Unix timestamp when window resets
- `Retry-After` — Seconds to wait (only on 429 responses)

## Customization

- **Global limit**: Configured in `apps/api/src/app.ts`
- **Per-route limits**: Set via `config.rateLimit` in route options
- **Key generator**: Defaults to IP, overridden to User ID on authenticated routes

## Production Recommendations

1. **Use Redis** for distributed rate limiting across multiple API instances:
   ```typescript
   import Redis from "ioredis";
   rateLimit({ redis: new Redis(process.env.REDIS_URL) })
   ```
2. **API Gateway**: Layer Cloudflare or AWS WAF rules on top for DDoS protection.
3. **Adjust limits** based on plan tier (e.g., Pro users get 50 plans/hour).
