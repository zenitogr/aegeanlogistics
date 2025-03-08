const commandRegistry = require('../commands/commandRegistry');
const { config } = require('../config/config');

async function messageCreate(message) {
  // Ignore bot messages and messages without prefix
  if (message.author.bot || !message.content.startsWith(config.discord.prefix)) {
    return;
  }

  // Extract command name and args
  const args = message.content.slice(config.discord.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Check for command or alias
  const command = commandRegistry.getCommand(commandName);
  if (!command) return;

  try {
    // Only execute the command once
    return await command.executePrefix(message, args);
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    return message.reply('There was an error executing that command.');
  }
}

module.exports = { messageCreate };
