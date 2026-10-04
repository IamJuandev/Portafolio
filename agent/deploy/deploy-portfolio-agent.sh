#!/usr/bin/env bash
# Rebuilds and redeploys the portfolio chat agent from the Git checkout.
# Installed on the VPS as /home/ubuntu/bin/deploy-portfolio-agent.sh and
# invoked only through the restricted CI SSH key (forced command).
# agent/deploy is the source of truth for the compose files; the compose
# .env (server password) stays on the host and is never copied from Git.
set -euo pipefail

REPO_DIR=/home/ubuntu/portfolio-agent-src
AGENT_DIR="$REPO_DIR/agent"
COMPOSE_DIR=/etc/dokploy/compose/portfolio-agent-7tghcl/code
COMPOSE_PROJECT=portfolio-agent-7tghcl
IMAGE=portfolio-agent:1

echo "==> Syncing repository"
cd "$REPO_DIR"
git fetch --prune origin
git reset --hard origin/master
git --no-pager log -1 --oneline

echo "==> Regenerating AGENTS.md from portfolio-facts.json"
cd "$AGENT_DIR"
node scripts/generate-agents.mjs

echo "==> Validating"
node scripts/validate-agents.mjs

echo "==> Building image"
sudo docker build -t "$IMAGE" .

echo "==> Syncing compose files"
sudo install -m 0644 "$AGENT_DIR/deploy/docker-compose.yml" "$COMPOSE_DIR/docker-compose.yml"
sudo rm -rf "$COMPOSE_DIR/squid" "$COMPOSE_DIR/gateway"
sudo cp -r "$AGENT_DIR/deploy/squid" "$AGENT_DIR/deploy/gateway" "$COMPOSE_DIR/"

echo "==> Redeploying"
cd "$COMPOSE_DIR"
sudo docker compose -p "$COMPOSE_PROJECT" up -d --remove-orphans
# The image tag is reused and the squid/nginx configs are bind mounts that
# were just replaced (new inodes), so recreate the services that consume them.
sudo docker compose -p "$COMPOSE_PROJECT" up -d --force-recreate agent squid gateway

echo "==> Waiting for health"
for i in $(seq 1 30); do
  status=$(sudo docker inspect --format "{{.State.Health.Status}}" "${COMPOSE_PROJECT}-agent-1" 2>/dev/null || echo unknown)
  echo "   [$i] $status"
  if [ "$status" = healthy ]; then
    echo "==> Verifying network isolation"
    bash "$AGENT_DIR/deploy/verify.sh" "$COMPOSE_PROJECT"
    echo "==> Deployed"
    exit 0
  fi
  sleep 4
done
echo "!! Agent did not become healthy in time" >&2
exit 1
