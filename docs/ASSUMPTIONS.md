# Assumptions & Design Decisions

This document records every place the brief left something open, the decision we made, and *why* —
so a reviewer sees intent, not oversight. It also captures the setup process and how we studied
**epanet-js** for the editing interactions.

---

## 0. Setup / process

- **Prerequisites:** Node ≥ 18 and npm. Developed on Node 20+.
- **Install & run:** `npm install`, then `npm run dev` (Vite → http://localhost:5173).
  Build with `npm run build`; type-check with `npm run lint`.
- **Stack (each a deliberate, documented choice):**
  - **Vite + React + TypeScript** — TS makes the Edit state machine and RBAC self-documenting.
  - **Redux Toolkit + redux-persist** — slices map 1:1 onto the required *published network /
    pending edits+history / auth* separation; persistence survives refresh.
  - **react-leaflet + Leaflet** — best fit for `[lng, lat]` GeoJSON points+lines, custom markers,
    click-to-add, and pipe-split; free OpenStreetMap tiles.
  - **Tailwind CSS** — utility-first styling, no bespoke CSS files.
  - **nanoid** (ids), **clsx** (class names). We deliberately kept dependencies small.
- **Simplification:** forms use plain controlled React inputs (no form library) — the forms are
  small and this keeps the bundle and the code lean.
- **Dev tool:** `src/app/devtools.ts` exposes the store + actions on `window.__app` in dev only
  (guarded by `import.meta.env.DEV`, stripped from production). Handy for driving/inspecting the app.

## 1. epanet-js — the editing reference (studied for this build)

We used [epanet-js](https://epanetjs.com/) as the reference for **editing interactions** (not a scope
to match). What we mirrored:

- **Click-to-add** nodes / pipes / valves / reservoirs, with **auto-junctions** (drawing a pipe onto
  empty map auto-creates a junction endpoint) and **auto-elevation** for new nodes.
- **Dropping an element on top of a pipe splits it** and reconnects — no duplicate parallel pipe.
  We implement the spec's explicit case: **adding a junction onto a pipe splits it** into two
  segments that keep the original properties and meet at the new junction.
- A **property inspector** driven by the selected element, plus a tools panel.
- A **published / proposed layer toggle** and map-first selection.

**What epanet-js does *not* have:** login, roles, or an approval workflow — it's single-user and
**local-first** (no account; nothing leaves the browser). So the **RBAC + review/approval loop are
required features of *this* assignment**, but epanet-js gives no template for them. **How** we build
them (the `can(role, capability)` matrix enforced in logic *and* UI, no-password user selection,
persisted session) is our own design. We keep epanet-js's local-first persistence spirit
(browser storage, no backend) throughout.

## 2. Map-first interaction

The map is the **primary surface**, not a detached form. In all three roles you *locate an element
on the map, select it there, and then edit / verify it in context*:

- **Editor/Admin:** clicking an element selects it and opens its inspector; edits flow into the draft.
- **Operator:** opening a field task **pans/highlights the target element on the map first**, so the
  operator verifies the real point before filling the form.
- **Admin:** selecting an edit's element/diff highlights it on the map.

## 3. Roles & capabilities

- **Admin focuses on governance.** According to the doc: "An Admin reviews the Edit — the proposed property changes, the field input, and the comment thread — and approves or rejects it." Admin does NOT have edit rights. Admin can only approve/reject/publish.
- **All edits — including an Admin's — flow through the Edit → approval pipeline.** Nothing mutates
  the published network except approval, so the audit trail stays complete even when Admin authors.
- **Self-approval is possible (noted trade-off).** An Admin can author an Edit and approve it. We
  allow it for single-admin demo convenience and flag that a real deployment would enforce
  *approver ≠ author*.
- **Admin cannot modify an approval request.** The Admin is limited to approve/reject on a pending request. They cannot modify it themselves. They must reject it back to the editor if changes are needed.
- **Operator cannot edit or approve** — only fill the field form for assigned tasks and comment.

## 4. Workflow & edit lifecycle

- **States are exactly the spec's named ones:** `draft → pending_approval → approved | rejected`.
- **Field verification is an optional sub-flow of `draft`** — assigning to an operator attaches a
  `fieldTask` to the Draft (the Edit stays `draft`); the author may submit for approval with or
  without ever assigning one. No extra lifecycle state and no back-transition for the field step.
- **Operator submission is recorded on the Draft, not auto-submitted** — the field form fills
  `fieldSubmission`; the author decides when to submit for approval. The operator's inbox filters
  by *assigned to me & not yet submitted*.
- **Approve = publish, atomically.** Admin approval is the single act that merges the Edit into the
  published network; once approved the Edit is immutable/archived.
- **Rejection is iterable.** A rejected Edit returns to the author as an editable `draft` with the
  reason recorded, and can be revised and re-submitted.

- **One active draft per author at a time** — matches "changes grouped into a single Edit".
- **No conflict resolution between concurrent pending edits ("last approved wins").** Edits merge
  sequentially onto the current published network; an operation targeting an element another edit
  already removed becomes a safe no-op. Rebasing/merge-conflict UX is out of scope.

## 5. RBAC — enforced in logic

- A single `can(role, capability)` matrix (`src/lib/permissions.ts`) is the source of truth.
- **Logic layer:** every mutating thunk (`src/features/edits/editActions.ts`) reads the current user
  and calls `can(...)` before dispatching; unauthorized calls are refused. The workflow guards
  (`src/lib/workflow.ts`) additionally reject illegal state transitions.
- **UI layer:** the `<Can>` gate and `usePermissions()` hook use the *same* matrix.
- This was verified at runtime: an operator's approve and an editor's approve of their own edit are
  both blocked in the store, not merely hidden.

## 6. Map & editing defaults

- **Coordinates:** data is `[lng, lat]` (the spec's convention); Leaflet uses `[lat, lng]` — we
  convert only at the map boundary and keep `[lng, lat]` everywhere in state.
- **New-element defaults:** new junction `elevation 0 / demand 0`; new valve `PRV / setting 0 /
  active`; new reservoir `head 100`; new tank sensible level defaults. All immediately editable.
- **Pipe length** is auto-derived from the geographic (haversine) distance on create/split, but
  remains a user-editable property.
- **Pipe split** (junction onto a pipe): the new junction's **auto-elevation defaults to 0** (we
  don't interpolate because endpoint elevations aren't guaranteed present); the two segments inherit
  the original pipe's diameter/roughness/status, and their **lengths reflect the split point**
  (proportional to the projection fraction `t` along the segment).
- **Delete cascade:** deleting a **junction/reservoir/tank** removes the pipes attached to it;
  deleting a **pipe** removes only that pipe. All expressed as operations in the Edit, so it's
  reviewable and revertible.
- **Repeated edits to one element coalesce** into a single `update` op (one net `before → after`),
  so the diff reads cleanly.
- **Element types included:** junction, pipe, valve, **reservoir** (in the seed) and **tank**
  (addable) — reservoirs/tanks were optional; we include them for completeness.

## 7. Field form, conversation & audit

- **Field form fields:** observed value, condition (*Good / Needs attention / Faulty*), notes, and
  an **optional mock photo** (stored as a data URL). One task + one submission per Edit;
  re-assignment overwrites with an audit entry.
- **A field task references a specific element** (the one selected) — the operator is taken to it.
- **Anyone who can see an Edit can post to its thread** (all three roles).
- **Audited actions:** created, element added/updated/removed, assigned, field submitted, submitted
  for approval, approved (published), rejected, reopened — each with actor + ISO timestamp; the
  field submission is part of this history.

## 8. Persistence & data

- **Persisted** (`redux-persist` → `localStorage`): `auth`, `network`, `edits`.
  **Not persisted:** `ui` (selection, active tool, layer) — transient by nature.
- **Seed on first load only:** the app seeds the section-7 network and the four users when storage
  is empty; otherwise it rehydrates. The **Reset demo** button restores seed state.
- **Start from the section-7 mock GeoJSON** (not Vancouver) — small and deterministic for the demo.
  Seed elements keep their given ids (`R1, J1…`); new elements get `nanoid` ids.

## 9. Explicit non-goals (called out, not silently skipped)

- No hydraulic simulation, no real auth/passwords, no backend (per the brief).
- No cross-browser/cross-device sync (single browser).
- No concurrent-edit conflict resolution ("last approved wins").
- **No automated tests** (a deliberate decision) — no unit tests, no Playwright/e2e. Correctness is
  enforced by TypeScript + the guarded workflow/RBAC, and verified via a manual three-role walkthrough.
- Styling is minimal and desktop-oriented (a map app), not a responsive/mobile pass.

## 10. Stretch goals

**Included:** diff view of the proposed edit; published/proposed layer toggle; mock photo attachment
on the field form.
**Future work (not done):** import/export of the network as JSON (the `src/lib/geojson.ts`
round-trip already exists to support it), undo/redo over draft operations, and element search/filter.
