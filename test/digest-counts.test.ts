import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { nightCounts } from '../src/digest/counts.js';

describe('nightCounts', () => {
  it('counts raw lines per status and skips bad lines', () => {
    const d = mkdtempSync(join(tmpdir(), 'rig-'));
    writeFileSync(join(d, '2026-01-01.jsonl'), '{"status":"ok"}\n{"status":"retry"}\nnot json\n{"status":"retry"}\n{"status":"bogus"}\n{"status":"fail"}\n');
    expect(nightCounts(d, '2026-01-01')).toEqual({ ok: 1, retry: 2, fail: 1 });
  });
  it('returns null for a night with no file and for a malformed night', () => {
    expect(nightCounts('runs', '1999-01-01')).toBeNull();
    expect(nightCounts('runs', '../etc')).toBeNull();
  });
  it('counts the real 2026-10-28 fixture', () => {
    expect(nightCounts('runs', '2026-10-28')).toEqual({ ok: 10, retry: 4, fail: 1 });
  });
});
