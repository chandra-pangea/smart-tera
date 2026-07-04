# Smart Tera — Water Network Review & Approval

A single-page React app for reviewing and editing a water distribution network on a map.
Three roles (**Admin / Editor / Operator**) with different permissions, and every network change
flows through a **draft → (optional field verification) → approval → publish** loop before it
becomes the published network everyone sees.

There is **no backend**. All users, network data, edits, and history live in the browser
(Redux + `redux-persist` → `localStorage`), so a refresh preserves your work.

---

## Run it

Requires **Node ≥ 18** (developed on Node 20+).

```bash
npm install
npm run dev      # start Vite dev server → http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check (tsc --noEmit) + production build
npm run preview  # preview the production build
npm run lint     # type-check only
```

## Seeded users (log in by selecting a card — no password)

| Role     | Name          | Email                 | Can do                                                                        |
| -------- | ------------- | --------------------- | ----------------------------------------------------------------------------- |
| Admin    | Ava Admin     | `admin@utility.test`  | Review/approve/reject/publish **and** edit the network (superset — see below) |
| Editor   | Ed Editor     | `editor@utility.test` | Add/modify/remove elements, assign field tasks, submit for approval           |
| Operator | Ola Operator  | `op1@utility.test`    | Fill & submit the field form for assigned tasks; comment. Cannot edit.        |
| Operator | Omar Operator | `op2@utility.test`    | Same as Ola — a second operator so assignment is a real choice.               |

To walk the whole flow, **log out and back in** as each role (single active session per browser).
The **Reset demo** button in the top bar restores the seed network and clears all edits/history.

## The core workflow

1. **Editor** (or Admin) selects an element on the map or adds one and changes its properties.
   Changes are collected into a single **Edit** in `draft` — never applied to the published network directly.
2. *(optional)* The editor **assigns the Edit to an Operator** with an instruction (a `fieldTask`
   on the draft; the Edit stays `draft`).
3. The **Operator** sees the task in their inbox, and submits the **field form** (observed value,
   condition, notes, optional photo). It's recorded on the Edit.
4. The editor **submits the Edit for approval** → `pending_approval`.
5. The **Admin** reviews the proposed **diff**, the field input, the conversation, and the audit
   trail, then **approves** or **rejects (with a reason)**.
6. On **approval** the Edit's operations are merged into the **published network** (the default
   everyone sees). On **rejection** the Edit returns to the editor with the reason recorded,
   re-openable for revision.
7. Throughout, each Edit carries a **conversation thread** and an **audit trail** (who did what,
   when — including the field input).

## Map interactions (editor / admin)

Pick a **tool** in the left panel:

- **Select** — click an element to open its property inspector and edit it.
- **Junction / Valve / Reservoir / Tank** — click the map to place one. Dropping a **junction onto
  a pipe splits that pipe** into two segments that keep the original properties and meet at the new junction.
- **Pipe** — click a start node then an end node (clicking empty map auto-creates a junction endpoint).
- **Delete** — click an element to remove it; deleting a node cascades to its attached pipes.

Use the **Published / Proposed** toggle in the top bar to switch between the approved network and
your draft overlay.

## Architecture (idiomatic React + Redux Toolkit)

```
src/
  app/        store (configureStore + persist), typed hooks, App router, dev tools
  types/      shared TypeScript types (the whole domain model)
  lib/        pure helpers, no React: permissions, workflow state machine, operations
              (applyOperations), pipeSplit, geo, geojson, element factories, seeds
  hooks/      custom hooks that carry the logic (useMapTool, useEditWorkflow, useDiff, …)
  components/ reusable UI primitives (Button, Panel, Badge, Can gate, …)
  layouts/    AppShell + TopBar
  features/
    auth/     login + user selection
    network/  Leaflet map + markers + toolbar + layer toggle
    edits/    slice, guarded thunks, inspector, diff, approval queue, review, thread, audit
    operator/ field-task inbox + field form
    workspace/ role-specific sidebars (Editor / Operator / Admin)
    ui/       transient UI slice (selection, tool, layer)
```

**Store shape** keeps the concerns separate:

- `network` — the **published/default** network (mutated only by publish-on-approval).
- `edits` — every Edit (draft/pending/approved/rejected) + all history (operations, field task/
  submission, thread, audit).
- `auth` — the logged-in user id.
- `ui` — transient view state (selection, active tool, layer) — **not persisted**.

`auth`, `network`, and `edits` are persisted to `localStorage`; `ui` is deliberately not.

**RBAC is enforced in logic, not just the UI.** A single `can(role, capability)` matrix
(`src/lib/permissions.ts`) is the source of truth. Every mutating thunk checks it before
dispatching, and the `<Can>` gate + `usePermissions()` hook use the *same* matrix for the UI — so
an Operator literally cannot dispatch an edit and an Editor cannot dispatch an approval, regardless
of what buttons are shown. The Edit lifecycle is a guarded state machine
(`src/lib/workflow.ts`): only legal, role-permitted transitions are allowed.

## Assumptions & trade-offs

The full list — including how we studied **epanet-js** for the editing interactions — is in
[`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md). The headline decisions:

- **Admin can edit *and* approve** (a superset of Editor) — resolving the spec's "focus on
  governance rather than editing" wording. Self-approval is therefore possible; a real deployment
  would likely enforce *approver ≠ author*.
- **Field verification is an optional sub-flow of `draft`** (a `fieldTask` on the Edit), not a
  separate lifecycle state — the states are exactly the spec's `draft / pending_approval /
  approved / rejected`.
- **Login is user-selection, no passwords**; the session is persisted.
- **Map-first**: you locate and select an element on the map, then edit/verify it in context.

## Stretch goals included

Diff view of the proposed edit, a published/proposed layer toggle, and a mock photo attachment on
the field form. (Import/export, undo/redo, and search are noted as future work in ASSUMPTIONS.)
