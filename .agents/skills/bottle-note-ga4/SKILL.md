---
name: bottle-note-ga4
description: Add or review GA4 events and GTM configuration in the Bottle Note frontend. Use for analytics instrumentation, event taxonomy, or GTM synchronization work in this repository.
---

# Bottle Note GA4

Work from the repository root. Read `src/utils/analytics/types.ts`, `src/utils/analytics/ga4.ts`, `gtm.config.json`, and `docs/gtm-sync.md` before changing tracking. Follow nearby event call sites for naming and placement.

## Event design

- Track a meaningful user action or a successfully loaded view. Fire view events after the relevant data and authentication state are ready; guard against query refetches and React effect reruns with a local ref keyed to the viewed record or page entry.
- Send events through `trackGA4Event`, add their parameter types to `GA4EventMap`, and register the same event and parameter names in `gtm.config.json`. Keep the app and GTM contract in sync.
- Prefer a few reusable, low-cardinality parameters for GA4 reports. Do not send raw search terms, personal information, or imported business contact fields. Record IDs can support event correlation, but do not register high-cardinality IDs as GA4 custom dimensions.
- For link or CTA events, send the event in the user's click handler before navigation. Distinguish placements with one bounded `source` parameter when they share a destination.
- Distinguish a matched declaration ID from a Bottle Note alcohol ID. The MFDS `id` and `alcoholId` fields represent different records.

## GTM and rollout

- `pnpm gtm:validate` checks the local config. `pnpm run gtm:sync -- --env dev` or `--env prod` shows the workspace changes without applying them. See `docs/gtm-sync.md` for credentials and workspace behavior.
- `--apply` changes a GTM workspace; it does not publish the container. Apply or publish when the task authorizes those external changes. Confirm the intended environment and compare the published container with the config before changing production.
- Check a real page's `dataLayer`, GTM Preview, and GA4 DebugView for one event per action, parameter values, and the right dev/prod property. Confirm reportable custom dimensions in GA4 separately from sending parameters.
