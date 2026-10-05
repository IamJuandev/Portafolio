# CV generated from portfolio facts

Edit `agent/portfolio-facts.json`, not the generated HTML or PDF. Canonical identity,
contact, availability, experience, projects, and education supply the shared facts.
The dedicated Spanish `cv` block supplies CV-specific phrasing and selection; it does
not make every CV field derive automatically from the rest of the facts.

`agent/scripts/validate-cv.mjs` cross-checks the CV experience, projects, and education
against their canonical counterparts. Keep those references aligned when changing the
`cv` block.

## Local regeneration

From the repository root, with Chrome and Poppler `pdftotext` available:

```sh
node agent/scripts/generate-agents.mjs
node agent/scripts/generate-cv.mjs
node agent/scripts/validate-agents.mjs
node agent/scripts/validate-cv.mjs
```

## CI and Pages

`.github/workflows/generate-cv.yml` runs on `master` changes to CV inputs and can also
be started with **Run workflow** for a manual regeneration. It tests, regenerates
`agent/AGENTS.md` and the CV outputs, validates them, then commits only those generated
files when they changed. A bot commit explicitly requests a legacy GitHub Pages build,
because GitHub-token commits do not trigger the existing legacy Pages/deploy workflows.
Consequently, generated `AGENTS.md` does not automatically deploy the SSH chat agent;
the existing `deploy-agent.yml` remains unchanged.
