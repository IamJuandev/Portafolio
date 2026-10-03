# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: static HTML, hand-written CSS with custom-property tokens, vanilla JS. No build step, no Tailwind CDN. Deployed as-is on GitHub Pages (`https://iamjuandev.github.io/Portafolio/`), which is the user's stated constraint ("keep it working the way it is with GitHub Pages").

## Users

- Inferred (stated to the user, not contradicted): technical recruiters and hiring managers evaluating a Cloud & Oracle consultant profile.
- Inferred: companies looking for someone to operate OCI infrastructure, build Oracle APEX applications, or integrate ERPs (JD Edwards) and electronic invoicing (DIAN).
- They arrive from LinkedIn, a CV link, or a direct referral, usually on desktop during work hours, sometimes on a phone. They scan for: what he does, proof it is real, and how to reach him.

## Product Purpose

Personal portfolio of Juan Gabriel Alfonso Rojas. It must reposition him from "software developer / automation" to **Consultor Cloud & Oracle — OCI · Oracle APEX · Automatización con Agentes de IA**, prove that with real work (integrations in production, supplier portal, invoicing automation), and get the visitor to contact him (WhatsApp, email, LinkedIn) or ask the portfolio's AI assistant.

## Positioning

He operates enterprise OCI infrastructure and builds Oracle APEX integrations, and his way of working is the differentiator: AI agents (Claude Code, Antigravity) used as engineering tools with documented skills, MCP servers connected to OCI and databases, persistent memory, and human validation before every production action. AI is a supervised multiplier, never a replacement.

## Operating Context

- Current role: Consultor Informático / Desarrollador at VCE Consulting (Aug 2024 – present).
- Work spans multiple client tenancies/compartments, Oracle Linux and Windows Server monitoring, recurring technical/executive reports, APEX 26.1 with APEXlang (`.apx`) + SQLcl versioned in Git, n8n flows, JD Edwards integrations.
- The site embeds a chat assistant backed by n8n (`https://n8n.arkanis.site/webhook/portfolio-chat`) and an agent that answers from `agent/portfolio-facts.json`.

## Capabilities and Constraints

- Site language: Spanish, neutral "tú" (no voseo).
- Section order (from `rediseño.md`): Hero, Sobre mí, Áreas de trabajo (4), Experiencia, Proyectos, Habilidades técnicas, Formación y certificaciones, Contacto.
- The chat widget must keep working against the same webhook and request contract.
- `agent/portfolio-facts.json` must stay in sync with the page content; remove the hexagonal-architecture vehicle project and the Java/Spring positioning paragraph.
- Fix `logo.cvg` → `logo.svg` and add a favicon.
- Open (must not be invented): number of clients/tenancies, number of servers monitored, report frequency per client type.

## Brand Commitments

- Name: Juan Gabriel Alfonso Rojas. Handle: IamJuandev.
- Existing photo `photo.png` and sticker `STIKER-removebg-preview.png`.
- No client names, IPs, OCIDs, or real console screenshots. Use "clientes empresariales" and generic diagrams.
- JD Edwards appears only as integration reference, never as functional/administrative experience.

## Evidence on Hand

- `rediseño.md`: full rewritten copy (hero, about, areas, experience, projects, skills, truth rules).
- 11 Anthropic Academy certificates with public verify links (skilljar).
- Real metric: electronic invoicing 10 min → under 2 min per invoice (−80 %).
- Live project URL: `https://ceremonias.arkanis.site/` (QR invitations).
- Directorio Terrario: 3 Airbnb sites in Armenia, 68 places.
- No testimonials, no client logos, no screenshots. Do not fabricate any.

## Product Principles

1. Proof over adjectives: every claim ties to a concrete system, flow, or number.
2. Generic diagrams, never client data.
3. AI is shown as disciplined engineering method, supervised by a human.
4. Contact is never more than one gesture away.

## Accessibility & Inclusion

WCAG 2.1 AA contrast, full keyboard access, `prefers-reduced-motion` respected, works at 390px.
