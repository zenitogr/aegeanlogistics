require('dotenv').config();

const config = {
  discord: {
    token: process.env.DISCORD_TOKEN,
    prefix: process.env.DISCORD_PREFIX || '!',
    clientId: process.env.DISCORD_CLIENT_ID,
  },
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET
  }
};

module.exports = { config };
