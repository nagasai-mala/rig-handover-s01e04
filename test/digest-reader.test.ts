import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readNight } from '../src/digest/reader.js';

describe('readNight', () => {
  it('reads 2026-10-28: 5 jobs, 1 bad line', () => {
    const n = readNight('runs', '2026-10-28');
    expect(n?.rows).toHaveLength(5);
    expect(n?.badLines).toBe(1);
  });
  it('returns null for a night with no file', () => {
    expect(readNight('runs', '1999-01-01')).toBeNull();
  });
  it('keeps null owners and counts bad lines without throwing', () => {
    const d = mkdtempSync(join(tmpdir(), 'rig-'));
    writeFileSync(join(d, '2026-01-01.jsonl'), '{"at":"2026-01-01T01:00:00+01:00","job":"a","status":"retry","owner":null}\nnot json\n{"at":"2026-01-01T02:00:00+01:00","job":"a","status":"fail","owner":null,"error":"boom"}\n');
    const n = readNight(d, '2026-01-01');
    expect(n?.badLines).toBe(1);
    expect(n?.rows[0]).toMatchObject({ job: 'a', owner: null, runs: 2, retries: 1, lastStatus: 'fail', lastError: 'boom' });
  });
});
