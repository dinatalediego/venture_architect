# Versioned Contracts

Contracts are the stable interfaces of Venture Architect.

Implementation may change. Contract meaning should not change silently.

## v1 contracts

- `lead.v1.schema.json` — browser → lead capture Edge Function
- `event.v1.schema.json` — browser → event capture Edge Function
- `experiment.v1.schema.json` — Venture OS experiment record

## Compatibility rule

A change is **backward compatible** when existing valid v1 producers/consumers continue to work.

Examples:
- adding an optional field: normally compatible;
- adding a new event name: compatible only after producer/consumer coordination;
- renaming a required field: breaking;
- changing the meaning of a metric without versioning: breaking.

## Breaking changes

Do not overwrite v1 semantics. Create a v2 contract and document:
1. why v1 is insufficient;
2. migration path;
3. producer rollout;
4. consumer rollout;
5. rollback strategy;
6. retirement condition for v1.

## Security boundary

These schemas describe public input shape. They do **not** grant direct database access. Public clients talk to Edge Functions; privileged database writes remain server-side.
