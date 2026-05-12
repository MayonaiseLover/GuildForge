# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously at GuildForge. If you discover a vulnerability, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please report vulnerabilities through one of these channels:

1. **GitHub Security Advisory:** Use [GitHub's private vulnerability reporting](https://github.com/MayonaiseLover/GuildForge/security/advisories/new)
2. **Email:** Send details to **security@guildforge.dev** (if configured)

### What to Include

Please provide the following information:

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Affected component** (API, MCP server, web frontend, etc.)
- **Potential impact** assessment
- **Suggested fix** (if any)

### Response Timeline

| Action | Timeframe |
|--------|-----------|
| Acknowledgment of report | Within 48 hours |
| Initial assessment | Within 5 business days |
| Status update | Every 7 days until resolved |
| Security patch release | Within 30 days for critical issues |

### Disclosure Policy

- We follow **coordinated disclosure** — we ask that you give us reasonable time to address the vulnerability before any public disclosure.
- We will credit reporters in release notes (unless anonymity is requested).
- We do not pursue legal action against good-faith security researchers.

## Security Best Practices

### For Self-Hosted Deployments

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use a secret manager (Vault, AWS Secrets Manager) in production
   - Rotate `SESSION_SECRET` periodically (minimum 32 characters)
   - Rotate Discord bot tokens if compromised

2. **Database Security**
   - Use SSL/TLS connections to PostgreSQL in production
   - Restrict database network access to application servers only
   - Enable query logging for audit trails
   - Run regular backups

3. **Network Security**
   - Deploy behind a reverse proxy (nginx, Caddy) with TLS
   - Enable rate limiting (built-in via `@fastify/rate-limit`)
   - Use CORS restrictions (configured in `app.ts`)
   - Enable HTTP Strict Transport Security (HSTS)

4. **Authentication & Authorization**
   - OAuth tokens are encrypted at rest using AES-256-GCM
   - Session cookies are HTTP-only and secure-flagged
   - Discord bot permissions follow least-privilege principle
   - All API endpoints validate session before processing

5. **Discord Bot Token**
   - The bot token grants full access to all guilds the bot is in
   - Store it in a secrets manager, not in environment files
   - Monitor the [Discord Developer Portal](https://discord.com/developers/applications) for unusual activity
   - Regenerate immediately if compromised

### Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Client (Browser)                                           │
│  • HTTP-only secure cookies                                 │
│  • CSRF protection via SameSite                             │
│  • CSP headers via Next.js                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ TLS
┌──────────────────────────┴──────────────────────────────────┐
│  API (Fastify)                                              │
│  • Rate limiting (120 req/min global, stricter per-route)   │
│  • Lucia session validation on every protected route        │
│  • OAuth token encryption (AES-256-GCM)                     │
│  • Input validation (Zod schemas)                           │
│  • CORS whitelist                                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ Internal
┌──────────────────────────┴──────────────────────────────────┐
│  PostgreSQL                                                 │
│  • SSL/TLS connections                                      │
│  • Parameterized queries (Prisma)                           │
│  • Encrypted OAuth tokens at rest                           │
│  • Cascade deletes for data cleanup                         │
└─────────────────────────────────────────────────────────────┘
```

## Dependencies

We monitor dependencies for known vulnerabilities using:

- `pnpm audit` — run regularly in CI
- GitHub Dependabot alerts — enabled on this repository
- Manual review of critical dependency updates

## Scope

The following are **in scope** for security reports:

- Authentication bypass
- Authorization flaws (accessing other users' data)
- SQL injection or ORM bypass
- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- Server-Side Request Forgery (SSRF)
- Discord token exposure
- Privilege escalation (team roles, plan limits)
- Webhook payload injection
- Rate limit bypass

The following are **out of scope**:

- Denial of service (DoS/DDoS)
- Social engineering
- Physical security
- Issues in third-party services (Discord, Stripe, Anthropic)
- Self-XSS
- Missing security headers on non-production deployments
