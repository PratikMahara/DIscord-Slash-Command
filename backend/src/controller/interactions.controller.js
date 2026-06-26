import Groq from 'groq-sdk';
import pool from '../DB/index.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Discord interaction type constants
const PING                          = 1;
const APPLICATION_COMMAND           = 2;
const PONG                          = 1;
const CHANNEL_MESSAGE_WITH_SOURCE   = 4;

const AI_FALLBACK = { summary: 'Could not analyze', tag: 'general', priority: 'low' };

async function analyzeWithAI(text) {
  const completion = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [
      {
        role: 'system',
        content:
          'reply ONLY with raw JSON no markdown no backticks: {"summary":"one sentence","tag":"bug|question|feedback|urgent|general","priority":"low|medium|high"}',
      },
      { role: 'user', content: text },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  return JSON.parse(raw);
}

async function mirrorToSlack(command, username, response, guildId, aiResult = null) {
  try {
    let text = `*Discord Command*\n*Server:* ${guildId}\n*User:* ${username}\n*Command:* /${command}\n*Response:* ${response}`;
    if (aiResult) {
      text += `\n*AI Tag:* ${aiResult.tag}\n*AI Priority:* ${aiResult.priority}`;
    }

    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return true;
  } catch (err) {
    console.error('Slack mirror failed:', err.message);
    return false;
  }
}

async function saveInteraction(interaction, response, mirrored, aiResult = null) {
  const { id, guild_id, channel_id, member, user, data } = interaction;
  const username = member?.user?.username || user?.username || 'unknown';
  const userId   = member?.user?.id       || user?.id       || 'unknown';
  const command  = data?.name             || 'unknown';
  const options  = data?.options          || [];

  const existing = await pool.query(
    'SELECT id FROM interactions WHERE id = $1', [id]
  );
  if (existing.rows.length > 0) {
    console.log(`Duplicate interaction ${id} — skipping`);
    return;
  }

  await pool.query(
    `INSERT INTO interactions
     (id, guild_id, channel_id, user_id, username, command, options, response, mirrored, status, ai_summary, ai_tag, ai_priority)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'processed',$10,$11,$12)`,
    [
      id, guild_id, channel_id, userId, username, command,
      JSON.stringify(options), response, mirrored,
      aiResult?.summary ?? null,
      aiResult?.tag ?? null,
      aiResult?.priority ?? null,
    ]
  );
}

function buildReportResponse(username, text, aiResult) {
  return (
    `✅ Report received from ${username}: "${text}"\n` +
    `🤖 AI Summary: ${aiResult.summary}\n` +
    `🏷️ Tag: ${aiResult.tag} | Priority: ${aiResult.priority}`
  );
}

function handleStatus() {
  return `Bot is online and operational. All systems running.`;
}

export async function handleInteraction(req, res) {
  const interaction = req.body;

  // Discord PING — must respond immediately with PONG (type: 1)
  if (interaction.type === PING) {
    return res.status(200).json({ type: PONG });
  }

  // Slash commands
  if (interaction.type === APPLICATION_COMMAND) {
    const command = interaction.data?.name;
    let responseText = '';
    let aiResult = null;

    if (command === 'report') {
      const text     = interaction.data?.options?.find((o) => o.name === 'text')?.value || '';
      const username = interaction.member?.user?.username || interaction.user?.username || 'someone';

      try {
        aiResult = await analyzeWithAI(text);
      } catch (err) {
        console.error('AI analysis failed:', err.message);
        aiResult = AI_FALLBACK;
      }

      responseText = buildReportResponse(username, text, aiResult);
    } else if (command === 'status') {
      responseText = handleStatus();
    } else {
      responseText = `Unknown command: /${command}`;
    }

    res.status(200).json({
      type: CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: responseText },
    });

    // Async work after response is sent
    const mirrored = await mirrorToSlack(
      command,
      interaction.member?.user?.username || interaction.user?.username || 'unknown',
      responseText,
      interaction.guild_id,
      aiResult
    );
    await saveInteraction(interaction, responseText, mirrored, aiResult);
    return;
  }

  return res.status(400).json({ error: 'Unknown interaction type' });
}
