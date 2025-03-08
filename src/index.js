const { Client, GatewayIntentBits } = require('discord.js');
const { config } = require('./config/config');
const { loadEvents } = require('./events/eventLoader');
const { loadCommands } = require('./commands/commandLoader');
const TwitchNotifier = require('./services/twitch/TwitchNotifier');
const { ensureDirectories } = require('./utils/ensureDirectories');

const client = new Client({
  disableEveryone: false,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Initialize services
let twitchNotifier = null;

client.once('ready', async () => {
  console.log(`[Bot] Logged in as ${client.user.tag}`);
  
  try {
    // Ensure required directories exist
    await ensureDirectories();
    
    // Load commands
    console.log('[Bot] Loading commands...');
    await loadCommands();
    
    // Initialize Twitch service
    console.log('[Bot] Initializing Twitch notification service...');
    twitchNotifier = new TwitchNotifier(client);
    await twitchNotifier.initialize(); // Make sure to await initialization
    
    console.log('[Bot] All services initialized successfully');
  } catch (error) {
    console.error('[Bot] Error during initialization:', error);
  }
});

// Register event handlers
loadEvents(client);

// Handle errors
client.on('error', error => {
  console.error('[Bot] Client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('[Bot] Unhandled promise rejection:', error);
});

// Login
client.login(config.discord.token).catch(error => {
  console.error('[Bot] Failed to login:', error);
});
