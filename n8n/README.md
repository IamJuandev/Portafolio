# Portfolio AI Chat

The assistant on the portfolio is an **opencode agent running in an isolated
container**, reached through an n8n workflow. It answers questions about Juan's
experience, projects, education, and contact channels.

```
Browser (GitHub Pages)
   └─ POST /webhook/portfolio-chat   { message, chatId }
        └─ n8n workflow
             ├─ Redis      chat:<chatId> → { session, turn count }
             └─ opencode   POST /session/<id>/message
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

Runs `opencode serve` behind HTTP basic auth. Reachable only from n8n over the
`dokploy-network` alias `portfolio-agent`; it publishes no ports.

The agent holds **no tools**. `bash`, `edit`, `read`, `webfetch`, and `task`
are set to `deny` in `opencode.json`, so it is a text generator, not an agent
with a shell. It also carries no credentials: the OpenCode Zen free models
answer anonymously.

The profile lives in `AGENTS.md`, which opencode injects as instructions. It is
deliberately not a separate file the agent reads, because `read` is denied.

Prompt rules define scope and tone. They are **not** a security boundary — a
prompt injection can talk the model out of any instruction. Containment comes
from the container holding nothing worth taking: no tools, no secrets, and a
profile that is already public.

### Redis

One key per visitor, `chat:<chatId>`, holding the opencode session id and the
turn count, with a 30 minute sliding TTL.

The frontend generates `chatId` with `crypto.randomUUID()` and keeps it in
`sessionStorage`, so a conversation ends with the tab.

Keys are partitioned per visitor, so concurrent visitors never touch the same
key and no locking is needed.

### Session janitor

A scheduled workflow runs hourly, lists opencode sessions, and deletes any idle
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
7. **Ask Portfolio Agent** — `POST /session/<id>/message`
8. **Format** — keeps only `text` parts; `reasoning` parts never reach visitors
9. **Respond** — JSON with CORS for the portfolio origin

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

Pushing to `main` with changes under `agent/` triggers
`.github/workflows/deploy-agent.yml`, which regenerates `AGENTS.md`, fails the
build if the committed copy is stale, then connects to the VPS over a
restricted SSH key. That key is pinned to a forced command
(`~/bin/deploy-portfolio-agent.sh`) and can do nothing else: it pulls the
repository, rebuilds `portfolio-agent:1`, recreates the Dokploy compose
service, and waits for the healthcheck before reporting success.

## Request and response

```json
{ "message": "¿Qué experiencia tiene Juan con n8n?", "chatId": "..." }
```

```json
{ "answer": "Juan diseñó e implementó flujos con n8n y Dataico..." }
```

## Legacy files

`portfolio-chat-openrouter.workflow.json` and `postgres/` belong to the
PostgreSQL version and are kept only as history. Neither is deployed.
