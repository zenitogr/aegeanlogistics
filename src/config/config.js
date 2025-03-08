exports.config = {
  discord: {
    token: process.env.DISCORD_TOKEN,
    prefix: '!'
  },
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET
  }
};