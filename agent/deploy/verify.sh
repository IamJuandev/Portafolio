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
# so this exercises the raw network: it must not get out. The probe exits 10
# when the request went through and 20 when the network refused it; any other
# status means the probe itself did not run, which is a failure, not a pass.
agent_direct_must_fail() {
  local url="$1" code
  sudo docker exec "$AGENT" node -e "
    fetch('$url', { signal: AbortSignal.timeout(5000) })
      .then(() => process.exit(10), () => process.exit(20))" >/dev/null 2>&1
  code=$?
  case "$code" in
    20) report PASS "agent direct ${url} is blocked" ;;
    10) report FAIL "agent direct ${url} is reachable" ;;
    *)  report FAIL "agent direct ${url} probe did not run (exit ${code})" ;;
  esac
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
# Prints the HTTP status the gateway answered, or 000 if the probe failed.
gateway_status() { # gateway_status <path> [noauth]
  local cred='printf "%s:%s" "$OPENCODE_SERVER_USERNAME" "$OPENCODE_SERVER_PASSWORD" | base64 -w0'
  [[ "${2:-}" == noauth ]] && cred='echo'
  sudo docker exec "$AGENT" sh -c "$cred" 2>/dev/null |
    sudo docker exec -i "$GATEWAY" sh -c '
      read -r auth
      if [ -n "$auth" ]; then set -- --header "Authorization: Basic $auth" "$1"; else set -- "$1"; fi
      wget -S -q -O /dev/null -T 10 "$@" 2>&1 | sed -n "s/.*HTTP\/[0-9.]* \([0-9][0-9][0-9]\).*/\1/p" | tail -n1
    ' _ "http://127.0.0.1:4096$1" 2>/dev/null | grep -E '^[0-9]{3}$' || echo 000
}
expect_status() { # expect_status <expected> <path> [noauth]
  local got
  got="$(gateway_status "$2" "${3:-}")"
  if [[ "$got" == "$1" ]]; then
    report PASS "gateway ${2}${3:+ (${3})} -> ${got}"
  else
    report FAIL "gateway ${2}${3:+ (${3})} -> ${got}, expected ${1}"
  fi
}
expect_status 200 /global/health
expect_status 401 /api/session noauth
expect_status 404 /config

echo
if (( FAILURES > 0 )); then
  echo "${FAILURES} check(s) FAILED"
  exit 1
fi
echo "All checks passed"
