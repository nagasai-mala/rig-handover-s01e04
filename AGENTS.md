# rig

The lane's resident service: keeps a heartbeat, serves the status board, reads the night's run
log. Hono + JSX, rendered on the server, Node 22+.

Read first: `docs/vision.md`, `docs/styleguide.md`. Decisions: `docs/adr/`.

## Commands

- `pnpm dev` / `pnpm start`: serves on `PORT` (8787). Needs `.env` (copy `.env.example`).
- `pnpm test`: vitest. `pnpm typecheck`: tsc.

## How work moves here

1. A feature starts as a plan: `plan.md` at the root (one at a time). Finished plans live in
   `docs/plans/done/`.
2. The plan is split into GitHub issues: skill `plan-to-issues` (`.agents/skills/`). A human
   reviews the split before anything is published. GitHub issues out of reach: files in
   `docs/issues/` (ADR 0004).
3. Issues are worked by workers, one issue per worker, each on its own branch or worktree.
   Pick the model per issue: the strongest for logic, a cheaper one for views and tests.
4. A worker closes its issue with a closing comment, exactly this shape:

   ```
   done: <what changed, one line>
   worker: <harness> · <model> · <effort>
   commit: <sha or "none">
   ```

5. An issue is closed only when its "Done when" holds. If it can't hold yet, leave it open and
   say what it waits on.

## Skills

Shared skills live in `.agents/skills/`, one folder each, `SKILL.md` inside. That folder is the
one source for every harness on the team. If yours loads skills from somewhere else, point it
here (a link or a config entry). Don't copy: copies drift.

## Closing issues

- Close an issue only when its "Done when" holds, not when you have sent or started it.
- A step that waits on someone else (a reviewer's look, an approval) stays open until they
  have confirmed. Say in a comment what it waits on.
- Don't use `closes #n` for a step that still waits on someone. GitHub closes the issue on push.

## Previews (upload tool)

Previews go to GitHub Pages from a separate public repo, never from this one (ADR 0003).

1. Save the page with a command, not a browser: run rig on a spare port, then
   `curl -s localhost:<port>/digest/<night> -o index.html`. Stop that server afterwards.
2. `gh repo create <owner>/rig-preview-<plan> --public --clone`, copy in `index.html`, push to `main`.
3. `gh api -X POST repos/<owner>/rig-preview-<plan>/pages -f 'source[branch]=main' -f 'source[path]=/'`.
   The link is `https://<owner>.github.io/rig-preview-<plan>/`.
4. Check the link with `curl` from outside rig before you send it.
5. Clean-up: regenerate the page with `.env` moved aside and `LANE_MARKER` unset (the banner reads
   "no marker set"), push over the same link, and `curl` the link to confirm the marker is gone.
   Check that no old rig server still holds the port first.
6. Ask the human before creating the repo and before each upload. Delete the preview repo when the
   plan is done.

## Rules

- Never commit `.env`, tokens or previews.
- Don't touch `runs/`: those are real nights, read-only fixtures.
- No client JS (ADR 0001).
