import dotenv from 'dotenv';
dotenv.config();

const commands = [
  {
    name: 'report',
    description: 'Submit a report',
    options: [{
      name: 'text',
      description: 'Your report text',
      type: 3, // STRING
      required: true
    }]
  },
  {
    name: 'status',
    description: 'Check bot status'
  }
];

const res = await fetch(
  `https://discord.com/api/v10/applications/${process.env.DISCORD_APP_ID}/commands`,
  {
    method: 'PUT',
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commands)
  }
);

const data = await res.json();
console.log('Commands registered:', data);