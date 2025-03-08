const { loadCommands } = require('../commands/commandLoader');
const SlashCommandRegistrar = require('../services/discord/SlashCommandRegistrar');
const commandRegistry = require('../commands/commandRegistry');
const TwitchNotifier = require('../services/twitch/TwitchNotifier');

async function ready(client) {
  console.log(`Logged in as ${client.user.tag}!`);

  try {
    // Load commands only if not already loaded
    if (!commandRegistry.initialized) {
      loadCommands();
      commandRegistry.initialized = true;
    }

    // Initialize Twitch Notifier
    console.log('[Ready] Initializing Twitch notification service...');
    const twitchNotifier = new TwitchNotifier(client);
    await twitchNotifier.initialize();
    console.log('[Ready] Twitch notification service initialized');

    // Register slash commands with Discord
    const registrar = new SlashCommandRegistrar(client);
    const guildId = client.guilds.cache.first()?.id;
    
    if (guildId) {
      const commands = Array.from(commandRegistry.getCommands().values());
      await registrar.registerSlashCommands(commands, guildId);
      console.log('Slash commands registered successfully');
    } else {
      console.error('No guild found to register commands');
    }
  } catch (error) {
    console.error('Error during ready event:', error);
  }
}

module.exports = { ready };
