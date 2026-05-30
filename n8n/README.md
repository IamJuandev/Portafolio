# Portfolio AI Chat with n8n + OpenRouter

This folder contains an importable n8n workflow for the portfolio chat.

## Security rule

Do **not** put the OpenRouter API key in GitHub Pages or frontend JavaScript. Keep it only in the n8n server environment.

## Required n8n environment variables

Add these to your n8n VPS/OCI environment:

```bash
OPENROUTER_API_KEY=OPENROUTER_API_KEY_GOES_HERE
OPENROUTER_MODEL=google/gemini-2.0-flash-001
PORTFOLIO_SITE_URL=https://iamjuandev.github.io/Portafolio/
PORTFOLIO_ALLOWED_ORIGIN=https://iamjuandev.github.io
PORTFOLIO_CHAT_MAX_REQUESTS_PER_HOUR=20
```

If you run n8n with Docker Compose, add them under `environment:` for the n8n service and restart the container.

## Import steps

1. Open n8n.
2. Import `portfolio-chat-openrouter.workflow.json`.
3. Confirm the `Portfolio Chat Webhook` path is `portfolio-chat`.
4. Activate the workflow.
5. Copy the **production** webhook URL. It usually looks like:

```txt
https://your-n8n-domain.com/webhook/portfolio-chat
```

6. Paste that URL into `js/index.js` in `ChatAssistant.webhookUrl`.

## Expected request

The portfolio frontend sends:

```json
{
  "message": "¿Qué experiencia tiene Juan con n8n?"
}
```

## Expected response

n8n returns:

```json
{
  "answer": "Juan ha usado n8n para automatizar procesos financieros..."
}
```

## Notes

- The workflow limits questions to 500 characters.
- The assistant is constrained to answer only about Juan Gabriel Alfonso Rojas and his portfolio.
- The workflow includes a basic per-IP hourly limit using n8n static data. For stronger production protection, also add rate limiting at the reverse proxy level, for example Nginx `limit_req` or Cloudflare WAF.
