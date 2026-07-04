/** Current time as an ISO string — the single place timestamps are minted. */
export function nowIso(): string {
  return new Date().toISOString()
}

/** Human-readable, compact timestamp for the audit trail and threads. */
export function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
