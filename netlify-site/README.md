# Blue Tigers Fixture Tracker — Netlify deployment

This folder is a ready-to-deploy Netlify site. It syncs fixtures and Best XI
squads across every device using **Netlify Blobs** — no external database,
no signup, no API keys. Netlify provisions the storage automatically for
your site the moment the function runs.

## What's in here

```
index.html                     the app itself
netlify/functions/data.js      serverless function that reads/writes Netlify Blobs
netlify.toml                   tells Netlify where the functions & site files are
package.json                   the one dependency the function needs (@netlify/blobs)
```

## Deploy it (pick one)

### Option A — Connect a Git repo (recommended, most reliable)
1. Push this folder to a new GitHub (or GitLab/Bitbucket) repository.
2. On [app.netlify.com](https://app.netlify.com), click **Add new site → Import an existing project**, and pick that repo.
3. Netlify reads `netlify.toml` automatically — build command `npm install`, publish directory `.`, functions directory `netlify/functions`. Just click **Deploy**.
4. Once deployed, open the site URL — the footer badge should read *"Synced everywhere — same data on every device."*

### Option B — Netlify CLI (no Git needed)
```bash
npm install -g netlify-cli
cd this-folder
npm install
netlify deploy --prod
```
The CLI bundles the function's dependencies for you automatically.

### Option C — Drag-and-drop in the Netlify dashboard
This works for the static `index.html`, but **manual drag-and-drop deploys
don't run `npm install`**, so the function won't have `@netlify/blobs`
available unless you bundle it yourself first:
```bash
npm install
zip -r site.zip index.html netlify.toml netlify/ node_modules/
```
Then drag `site.zip` in. Option A or B is much less fiddly — use those if you can.

## How the sync works

- `netlify/functions/data.js` exposes `/.netlify/functions/data?key=...`
  which reads/writes a Netlify Blobs store called `blueTigersData`.
- Every visitor's browser talks to that *same* function on your deployed
  site, so everyone sees the same fixtures and squads — it's not stored
  per-browser.
- If you instead open `index.html` directly here inside Claude's chat
  preview, it'll use Anthropic's own artifact storage automatically — the
  app detects whichever backend is available and uses that, so the same
  file works in both places without any changes.
- If neither backend is reachable (e.g. you open `index.html` as a bare
  local file with no deployment), it falls back to in-memory only for
  that session — nothing crashes, it just won't remember changes.

## Notes
- No visitor authentication — anyone with the site URL can add/edit/delete
  fixtures and squads, since there's a single shared data store per site.
  Fine for a personal or small-group tracker; if you need to restrict who
  can edit, that's a separate step (e.g. Netlify Identity or a simple
  password gate) not included here.
- Netlify's free tier comfortably covers this — a handful of function
  calls per visit, well under any usage limits.
