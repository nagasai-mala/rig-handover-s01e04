import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

function appWith(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), 'rig-routes-'));
  for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), body);
  return createApp({ adapter: 'shim', installed: '2026-10-29T14:06:00+01:00', beatEverySeconds: 60, runsDir: dir });
}
const line = (job: string, status: string, at = '2026-01-01T01:00:00+01:00') =>
  JSON.stringify({ at, job, status, owner: 'rook' });

describe('digest routes', () => {
  const app = appWith({
    '2026-01-01.jsonl': `${line('b', 'ok')}\n${line('a', 'fail')}\nnot json\n`,
    '2026-01-02.jsonl': '',
  });

  it('page: 200, sorted by job, bad line counted', async () => {
    const res = await app.request('/digest/2026-01-01');
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html.indexOf('>a<')).toBeLessThan(html.indexOf('>b<'));
    expect(html).toContain('bad lines: 1');
  });
  it('page: 404 for a night with no file', async () => {
    expect((await app.request('/digest/1999-01-01')).status).toBe(404);
  });
  it('page: empty night says nothing ran', async () => {
    const res = await app.request('/digest/2026-01-02');
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('nothing ran');
  });
  it('json: 200 with same jobs in same order as the page', async () => {
    const res = await app.request('/api/digest/2026-01-01');
    const body = (await res.json()) as { rows: { job: string }[]; badLines: number };
    expect(res.status).toBe(200);
    expect(body.rows.map((r) => r.job)).toEqual(['a', 'b']);
    expect(body.badLines).toBe(1);
  });
  it('json: 404 for a night with no file, empty night has no rows', async () => {
    expect((await app.request('/api/digest/1999-01-01')).status).toBe(404);
    const body = (await (await app.request('/api/digest/2026-01-02')).json()) as { rows: unknown[] };
    expect(body.rows).toEqual([]);
  });
});
