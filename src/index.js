const { Client, GatewayIntentBits } = require('discord.js');
const { loadEvents } = require('./events/eventLoader');
const { loadCommands } = require('./commands/commandLoader');
const { config } = require('./config/config');
const TwitchNotifier = require('./services/twitch/TwitchNotifier');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Initialize bot
async function initializeBot() {
  try {
    // Load all event handlers
    loadEvents(client);
    
    // Load all commands
    loadCommands(client);
    
    // Login to Discord
    await client.login(config.discord.token);

    // Initialize Twitch notification system
    new TwitchNotifier(client);
  } catch (error) {
    console.error('Error initializing bot:', error);
    process.exit(1);
  }
}

initializeBot();
