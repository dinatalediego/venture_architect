# Runtime connectivity

## Live shared supervisor

The first authenticated runtime endpoint is the Supabase Edge Function `ido-supervisor` in the shared project used by Venture Architect, Patrimonio en Monedas and Health for Wealth.

It returns only safe supervisory payloads:

- Information Dividend registry and gates;
- Revenue Intelligence aggregate counts and latest numeric scorecard;
- USD/PEN observation count, latest public rate and latest ingestion status;
- Health for Wealth counts/snapshot scoped to the authenticated user's household membership;
- explicit adapter-required states for external/local MEDALLIO and the separate Gold Decision Lab project.

The function requires a valid JWT and never sends the service-role key to the browser.

## Deliberate boundaries

MEDALLIO/Cygnus remains external/local because its operational CRM rows are restricted. The supervisor should connect through a read-only server-side adapter rather than copying raw rows.

Gold Decision Lab remains in its own Supabase project. Cross-project credentials must remain server-side. A future adapter should exchange only approved aggregates/evidence objects with the supervisor.

## Runtime principle

A source is displayed as `connected` only when the supervisor receives live runtime evidence. Contract/demo data must remain visually distinct from runtime data.
