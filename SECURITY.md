# Security Policy

## Current product boundary

Venture Architect v0.1 is a public MVP. The repository and frontend contain **no production secrets**.

Public browser code may know:
- the Vercel URL;
- public Supabase Edge Function URLs;
- versioned public request contracts.

Public browser code must **not** contain:
- Supabase service-role keys;
- database passwords;
- private CRM credentials;
- API tokens;
- customer exports;
- private contact lists.

## Lead data

Lead PII is stored server-side in Supabase.

Current controls:
- direct `anon` and `authenticated` table privileges are revoked for Venture Architect tables;
- RLS is enabled;
- public clients write through narrowly-scoped Edge Functions;
- public metrics return aggregate funnel/pipeline information only.

## Logging

Do not print:
- email;
- phone;
- full names;
- raw CRM payloads;
- access tokens.

Errors should log codes and operational context rather than customer PII.

## Testing

Production smoke tests must be non-destructive.

Current endpoint-path validation uses:
- GET requests;
- OPTIONS preflight;
- lead honeypot early-exit that returns before database write.

Never create fake production leads merely to make CI green.

## Dependency posture

v0.1 intentionally has no frontend framework or third-party analytics dependency. Add dependencies only when the benefit exceeds:
- supply-chain risk;
- maintenance cost;
- runtime complexity;
- operational lock-in.

## Reporting

If a security issue is discovered:
1. do not place secrets or PII in a public GitHub issue;
2. stop exposure first;
3. rotate compromised credentials if any;
4. document sanitized root cause afterward;
5. add a regression control.
