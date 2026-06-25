import pool from '../DB/index.js';

// Discord interaction type constants
const PING                          = 1;
const APPLICATION_COMMAND           = 2;
const PONG                          = 1;
const CHANNEL_MESSAGE_WITH_SOURCE   = 4;

async function mirrorToSlack(command, username, response, guildId) {
  try {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `*Discord Command*\n*Server:* ${guildId}\n*User:* ${username}\n*Command:* /${command}\n*Response:* ${response}`,
      }),
    });
    return true;
  } catch (err) {
    console.error('Slack mirror failed:', err.message);
    return false;
  }
}

async function saveInteraction(interaction, response, mirrored) {
  const { id, guild_id, channel_id, member, data } = interaction;
  const username = member?.user?.username || 'unknown';
  const userId   = member?.user?.id       || 'unknown';
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
     (id, guild_id, channel_id, user_id, username, command, options, response, mirrored, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'processed')`,
    [id, guild_id, channel_id, userId, username, command, JSON.stringify(options), response, mirrored]
  );
}

function handleReport(interaction) {
  const text     = interaction.data?.options?.find((o) => o.name === 'text')?.value || '';
  const username = interaction.member?.user?.username || 'someone';
  return `Report received from **${username}**: "${text}" — logged and under review.`;
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

    if (command === 'report') {
      responseText = handleReport(interaction);
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
      interaction.member?.user?.username || 'unknown',
      responseText,
      interaction.guild_id
    );
    await saveInteraction(interaction, responseText, mirrored);
    return;
  }

  return res.status(400).json({ error: 'Unknown interaction type' });
}
