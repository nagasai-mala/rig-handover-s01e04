import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Status } from './types.js';

export type NightCounts = Record<Status, number>;

const STATUSES: readonly string[] = ['ok', 'retry', 'fail'];

// Raw log lines per status for runs/<night>.jsonl. Not deduplicated per job, unlike readNight.
// Lines that do not parse, or carry no known status, are skipped. Returns null when the night has
// no readable file. Never throws.
export function nightCounts(runsDir: string, night: string): NightCounts | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(night)) return null;

  let text: string;
  try {
    text = readFileSync(join(runsDir, `${night}.jsonl`), 'utf8');
  } catch {
    return null;
  }

  const counts: NightCounts = { ok: 0, retry: 0, fail: 0 };
  for (const raw of text.split('\n')) {
    if (raw.trim() === '') continue;
    let v: unknown;
    try {
      v = JSON.parse(raw);
    } catch {
      continue;
    }
    if (typeof v !== 'object' || v === null) continue;
    const status = (v as Record<string, unknown>).status;
    if (typeof status === 'string' && STATUSES.includes(status)) counts[status as Status]++;
  }
  return counts;
}
