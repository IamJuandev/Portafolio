FROM node:22-bookworm-slim

# Pinned so a rebuild never silently changes the agent runtime.
ARG OPENCODE_VERSION=2.0.22

# opencode needs git present for its workspace detection, nothing else.
# The npm package ships prebuilt linux-arm64/x64 binaries as optional deps.
RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g "@opencode/cli@${OPENCODE_VERSION}" \
    && npm cache clean --force

# Unprivileged user. The image ships no secrets and no source code.
RUN groupadd -g 10001 agent \
    && useradd -u 10001 -g agent -d /workspace -M -s /usr/sbin/nologin agent

WORKDIR /workspace

# Keep the generated profile synchronized with its canonical facts at build time.
# opencode v2 reads opencode.json and AGENTS.md from the working directory.
COPY --chown=agent:agent portfolio-facts.json /workspace/portfolio-facts.json
COPY --chown=agent:agent scripts /workspace/scripts
COPY --chown=agent:agent AGENTS.md /workspace/AGENTS.md
COPY --chown=agent:agent opencode.json /workspace/opencode.json
RUN node scripts/validate-agents.mjs

# These must exist in the image: Docker seeds each named volume from the
# image path, and that is what carries the agent ownership into the volume.
RUN mkdir -p /workspace/.local/share/opencode \
             /workspace/.config/opencode \
             /workspace/.cache/opencode \
    && chown -R agent:agent /workspace

USER agent

ENV HOME=/workspace \
    OPENCODE_DISABLE_AUTOUPDATE=1 \
    OPENCODE_MODEL=opencode/big-pickle

EXPOSE 4096

CMD ["opencode", "serve", "--hostname", "0.0.0.0", "--port", "4096"]
