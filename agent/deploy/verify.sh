#!/usr/bin/env bash
# Verifies the network isolation of the portfolio agent on the VPS.
# Usage: verify.sh [compose-project]   (default: portfolio-agent-7tghcl)
# Exits non-zero if any check fails. Never prints the server password.
set -uo pipefail

PROJECT="${1:-portfolio-agent-7tghcl}"
INTERNAL_NET="${PROJECT}_agent-internal"
CURL_IMAGE="curlimages/curl:8.11.1"
FAILURES=0

container_of() {
  sudo docker ps -q \
    --filter "label=com.docker.compose.project=${PROJECT}" \
    --filter "label=com.docker.compose.service=$1" | head -n1
}

report() { # report <PASS|FAIL> <description>
  printf '%-4s  %s\n' "$1" "$2"
  [[ "$1" == PASS ]] || FAILURES=$((FAILURES + 1))
}

# Direct fetch from inside the agent. Node's fetch ignores HTTP(S)_PROXY,
# so this exercises the raw network: it must not get out.
agent_direct_must_fail() {
  local url="$1"
  if sudo docker exec "$AGENT" node -e "
    fetch('$url', { signal: AbortSignal.timeout(5000) })
      .then(() => process.exit(0), () => process.exit(1))" >/dev/null 2>&1; then
    report FAIL "agent direct ${url} is reachable"
  else
    report PASS "agent direct ${url} is blocked"
  fi
}

# Request through squid from a throwaway container on agent-internal.
# Prints the HTTP status (000 when the connection itself failed).
via_proxy_status() {
  sudo docker run --rm --network "$INTERNAL_NET" "$CURL_IMAGE" \
    -sS -o /dev/null -w '%{http_code}' --max-time 15 \
    -x http://squid:3128 "$1" 2>/dev/null
}

AGENT="$(container_of agent)"
GATEWAY="$(container_of gateway)"
SQUID="$(container_of squid)"
for svc in AGENT GATEWAY SQUID; do
  if [[ -z "${!svc}" ]]; then
    echo "FAIL  ${svc,,} container not running in project ${PROJECT}" >&2
    exit 1
  fi
done

echo "== Direct egress from agent (must all fail)"
agent_direct_must_fail "https://example.com"
agent_direct_must_fail "http://169.254.169.254/"
agent_direct_must_fail "http://n8n:5678/"
agent_direct_must_fail "http://portfolio-redis:6379"

echo "== Egress through squid"
status="$(via_proxy_status https://opencode.ai)"
if [[ "$status" =~ ^[23][0-9][0-9]$ ]]; then
  report PASS "proxy https://opencode.ai -> ${status}"
else
  report FAIL "proxy https://opencode.ai -> ${status}"
fi
for url in https://example.com http://169.254.169.254/; do
  status="$(via_proxy_status "$url")"
  if [[ "$status" =~ ^[23][0-9][0-9]$ ]]; then
    report FAIL "proxy ${url} -> ${status} (should be denied)"
  else
    report PASS "proxy ${url} denied (${status})"
  fi
done

echo "== Gateway"
# Credentials are built inside the agent and piped into the gateway exec,
# so they never appear on a command line or in this script's output.
gateway_get() { # gateway_get <path>; exit 0 only on HTTP 2xx
  sudo docker exec "$AGENT" sh -c \
    'printf "%s:%s" "$OPENCODE_SERVER_USERNAME" "$OPENCODE_SERVER_PASSWORD" | base64 -w0' |
    sudo docker exec -i "$GATEWAY" sh -c \
      'read -r auth; wget -q -O /dev/null -T 10 --header "Authorization: Basic $auth" "http://127.0.0.1:4096$1"' \
      _ "$1" >/dev/null 2>&1
}
if gateway_get /global/health; then
  report PASS "gateway /global/health with auth -> 200"
else
  report FAIL "gateway /global/health with auth failed"
fi
if gateway_get /config; then
  report FAIL "gateway /config is exposed (should be 404)"
else
  report PASS "gateway /config not exposed"
fi

echo
if (( FAILURES > 0 )); then
  echo "${FAILURES} check(s) FAILED"
  exit 1
fi
echo "All checks passed"
