# Portfolio agent deployment

`docker-compose.yml` here is the single production definition. There is no
separate dev compose; the image is built from `agent/` (`Dockerfile`).

## Services

| Service   | Role | Networks |
|-----------|------|----------|
| `agent`   | OpenCode v2 `serve` on port 4096 with basic auth. Non-root, read-only rootfs, no capabilities. | `agent-internal` |
| `squid`   | Forward proxy; the agent's only egress. Allows only `*.opencode.ai` (HTTPS CONNECT) and denies private/link-local targets. | `agent-internal`, `agent-egress` |
| `gateway` | Unprivileged nginx on 4096, alias `portfolio-agent` on `dokploy-network`. Forwards only the API paths n8n uses; everything else is 404. | `dokploy-network`, `agent-internal` |
| `redis`   | n8n session store, alias `portfolio-redis`. | `dokploy-network` |

## Isolation model

The Zen free tier refuses requests unless the `bash` and `read` tools are
available. `opencode.json` keeps them present but allows only `bash: true` and
reading `AGENTS.md`; every other command, path and tool is denied. On top of
that, the agent is isolated by the network, and its config and cache dirs are
tmpfs so nothing it writes survives a restart:

- `agent-internal` is `internal: true`: no route to the internet, the VPS,
  OCI metadata (`169.254.169.254`) or other Dokploy services.
- The agent exits only via `HTTP(S)_PROXY=http://squid:3128`, and squid
  allowlists `.opencode.ai`.
- n8n never reaches the agent directly; it calls `http://portfolio-agent:4096`,
  which now resolves to the gateway.

## Deploy

1. The deploy script builds `portfolio-agent:1` from `agent/`.
2. It copies this directory (`docker-compose.yml`, `squid/`, `gateway/`) into
   the Dokploy compose dir, next to the existing `.env`
   (see `../.env.example`).
3. It runs `docker compose -p portfolio-agent-7tghcl up -d`.
4. Run `./verify.sh` on the VPS; every check must print `PASS`.
