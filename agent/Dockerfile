FROM node:22-alpine

# opencode needs git present for its workspace detection, nothing else.
RUN apk add --no-cache git ca-certificates \
    && npm install -g opencode-ai \
    && npm cache clean --force

# Unprivileged user. The image ships no secrets and no source code.
RUN addgroup -g 10001 agent && adduser -u 10001 -G agent -D -h /workspace agent

WORKDIR /workspace

# Keep the generated profile synchronized with its canonical facts at build time.
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
