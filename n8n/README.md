# Portfolio AI Chat

The assistant on the portfolio is an **opencode agent running in an isolated
container**, reached through an n8n workflow. It answers questions about Juan's
experience, projects, education, and contact channels.

```
Browser (GitHub Pages)
   └─ POST /webhook/portfolio-chat   { message, chatId }
        └─ n8n workflow
             ├─ Redis      chat:<chatId> → { session, turn count }
             └─ gateway (nginx) → opencode v2
                  POST /api/session/<id>/prompt
                  POST /api/experimental/session/<id>/wait
                  GET  /api/session/<id>/message
```

## Why there is no database

Earlier versions loaded the profile from PostgreSQL, then from Oracle with
vector search. Both were removed.

The whole profile is about 4,700 tokens. Retrieval exists for corpora that do
not fit in context; a single person's CV does. Keeping it in one file removes
the database, the query layer, and the second source of truth — updating the
profile is editing Markdown, not running SQL.

## Components

### opencode container

Runs OpenCode v2 (`@opencode/cli`) `serve` behind HTTP basic auth. n8n never
reaches it directly: it talks to the `gateway` (nginx) on the `dokploy-network`
alias `portfolio-agent`, which forwards only the API paths below. Details and
the full isolation model live in `agent/deploy/README.md`.

The OpenCode Zen free tier refuses requests unless the `bash` and `read` tools
exist, so they stay present but are allowlisted down to nothing useful:
`bash` may run only `true`, `read` may open only `AGENTS.md`; `grep`, `glob`,
`list`, `edit`, `webfetch`, `websearch`, `task`, `skill` and `question` are
denied. Config and cache are tmpfs, so nothing written survives a restart.

The agent container sits on an internal Docker network with no route out. Its
only egress is a squid proxy that allowlists `.opencode.ai`.

The profile lives in `AGENTS.md`, which opencode injects as instructions.

Prompt rules define scope and tone. They are **not** a security boundary — a
prompt injection can talk the model out of any instruction. Containment comes
from the permissions, the network isolation, and a profile that is already
public.

### Redis

One key per visitor, `chat2:<chatId>`, holding the opencode session id and the
turn count, with a 30 minute sliding TTL.

The frontend generates `chatId` with `crypto.randomUUID()` and keeps it in
`sessionStorage`, so a conversation ends with the tab.

Keys are partitioned per visitor, so concurrent visitors never touch the same
key and no locking is needed.

### Session janitor

A scheduled workflow runs hourly, lists opencode sessions (`GET /api/session`), and deletes any idle
for more than 30 minutes — the same threshold as the Redis TTL, so it can never
reclaim a session someone could still resume.

This is what bounds growth. When a visitor closes the tab their Redis key
expires, but the opencode session would otherwise remain forever.

## Workflow

`Portfolio AI Chat - opencode agent`

1. **Webhook** — `POST /webhook/portfolio-chat`
2. **Validate + Normalize** — rate limit per IP, length cap of 500 characters,
   and `chatId` validation against `/^[A-Za-z0-9-]{8,64}$/` (it becomes a Redis
   key, so it is never trusted as sent)
3. **Get Chat State** — Redis lookup
4. **Plan Session** — reuse, or rotate after 20 turns
5. **Rotate** — delete the old opencode session, create a new one
6. **Save Chat State** — Redis write with a fresh TTL
7. **Ask Portfolio Agent** — `POST /api/session/<id>/prompt`
8. **Wait For Agent** — `POST /api/experimental/session/<id>/wait` (until idle)
9. **Get Agent Messages** — `GET /api/session/<id>/message`
10. **Format** — takes the newest assistant message and keeps only `text`
    parts; `reasoning` parts never reach visitors
11. **Respond** — JSON with CORS for the portfolio origin

## Configuration

Container environment:

```bash
OPENCODE_MODEL=opencode/big-pickle
OPENCODE_SERVER_USERNAME=opencode
OPENCODE_SERVER_PASSWORD=...        # generated, never committed
```

`OPENCODE_MODEL` is an environment variable on purpose: the Zen free models are
a time-limited beta and can disappear, so swapping one is a redeploy rather
than an image rebuild.

n8n environment:

```bash
PORTFOLIO_CHAT_MAX_REQUESTS_PER_HOUR=20
```

## Updating the profile

The source of truth is `agent/portfolio-facts.json`. `AGENTS.md` is generated
from it and must never be edited by hand.

```bash
cd agent
# edit portfolio-facts.json
node scripts/generate-agents.mjs
node scripts/validate-agents.mjs
git commit -am "feat(agent): ..." && git push
```

Pushing to `master` with changes under `agent/` triggers
`.github/workflows/deploy-agent.yml`, which regenerates `AGENTS.md`, fails the
build if the committed copy is stale, then connects to the VPS over a
restricted SSH key. That key is pinned to a forced command
(`~/bin/deploy-portfolio-agent.sh`) and can do nothing else: it pulls the
repository, rebuilds `portfolio-agent:1`, syncs `agent/deploy/` into the
Dokploy compose directory, recreates the services, waits for the healthcheck
and runs `agent/deploy/verify.sh` before reporting success.

## Request and response

```json
{ "message": "¿Qué experiencia tiene Juan con n8n?", "chatId": "..." }
```

```json
{ "answer": "Juan diseñó e implementó flujos con n8n y Dataico..." }
```
