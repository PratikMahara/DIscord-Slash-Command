# AI_NOTES.md

## Tools Used
- **Claude (Anthropic)** — primary AI assistant throughout the project
- **Groq (llama3-8b-8192)** — free LLM integrated into the bot for report triage

## How I Split Work With AI

I used Claude as a senior pair programmer — not to write code blindly, but to:
- Understand the architecture before writing anything
- Get boilerplate for Express, Discord interactions, and Supabase fast
- Debug specific errors by pasting logs and reasoning through them together

All architectural decisions, debugging logic, and integration choices were mine.
Claude helped me move faster; I decided what to build and why.

## 3 Key Decisions I Made Myself

**1. tweetnacl over discord-interactions for Ed25519 verification**
The discord-interactions library kept failing signature verification on Render even
though the code looked correct. I noticed the error only appeared in production, not
locally, which pointed to an environment issue. I switched to tweetnacl and did the
raw Buffer comparison myself — timestamp + rawBody as a single Buffer — which gave
me full control and fixed it immediately.

**2. Supabase JS client over raw pg**
I initially tried connecting via the pg Pool with the direct Supabase host URL
(db.xxx.supabase.co) and kept getting ENOTFOUND errors. Rather than debugging DNS
resolution issues, I switched to the Supabase JS client with the service role key.
This is actually the recommended approach for Supabase and removed an entire class
of connection problems.

**3. Groq + llama3 for the AI step instead of OpenAI**
The assessment required a free LLM. Groq's free tier has no credit card requirement
and llama3-8b-8192 is fast enough to respond within Discord's 3-second window,
which was a hard constraint. I structured the prompt to return strict JSON only
(no markdown, no backticks) so parsing is reliable.

## The Hardest Bug — Ed25519 Signature Verification

This was the most painful part of the project and took the most debugging time.

**What went wrong:** Discord's endpoint verification kept returning "Invalid signature"
even though my verifyKey logic looked textbook correct. The discord-interactions
library's verifyKey function was returning false on every request on Render, but
I couldn't test it locally because Discord requires a public URL.

**How I noticed:** I added detailed console.log statements printing the signature,
timestamp, rawBody, and PUBLIC_KEY length to Render logs. I saw PUBLIC_KEY length
was 64 (correct), signature was 128 chars (correct), but the verification still
failed. This told me the key and headers were fine — the problem was how the
body was being passed.

**Root cause:** express.json() middleware was running before my raw body capture,
converting the Buffer into a parsed object. When I did req.body.toString(), I got
"[object Object]" instead of the raw JSON string. The timestamp + body string
being verified didn't match what Discord signed.

**Fix:** I moved express.json() after the /api/interactions route, used
express.raw({ type: '*/*' }) to capture the raw Buffer, called .toString('utf-8')
on it explicitly, then switched to tweetnacl for the actual Ed25519 verification
giving me full control over the byte buffers.

**What I learned:** Middleware order in Express is critical. Any body parser that
runs before your raw capture will silently corrupt the data you need for
cryptographic verification. Always isolate signature-verified routes from general
JSON parsing middleware.

## What I'd Improve With More Time

- **Retry queue** — if Slack mirror fails, queue it and retry with exponential backoff
- **Interactive buttons** — add Approve/Reject buttons on report responses (stretch goal)
- **Modal form** — open a Discord modal on /report instead of inline text
- **Multi-server isolation** — each Discord server gets its own config and log view
- **Better AI prompting** — fine-tune the triage categories based on real usage patterns
- **Rate limiting** — prevent abuse on the interactions endpoint

## Hardest Prompt (excerpt)

When debugging the signature issue I used this prompt:

> "My Discord Ed25519 verification returns invalid signature only on Render, not
> locally. I'm using express.raw() then JSON.parse(req.body). The PUBLIC_KEY is
> 64 chars, signature is 128 chars. Here are my Render logs: [logs]. What could
> cause this only in production?"

Claude identified that express.json() running globally was the likely cause and
suggested isolating the route — which led directly to the fix.