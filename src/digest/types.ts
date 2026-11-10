export type Status = 'ok' | 'retry' | 'fail';

// One row per job in a night's run log.
export type DigestRow = {
  job: string;
  owner: string | null; // null renders as "—"
  runs: number;
  retries: number;
  lastStatus: Status;
  lastError: string | null;
  firstAt: string; // offset kept from the log, never converted to UTC
  lastAt: string;
};

export type Night = {
  rows: DigestRow[]; // sorted by job
  badLines: number; // lines that did not parse, counted not thrown
};

// Reads runs/<night>.jsonl. Returns null when the night has no file.
export type ReadNight = (runsDir: string, night: string) => Night | null;
