const { executeCommand } = require('../commands/commandHandler');
const { config } = require('../config/config');

async function messageCreate(message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.discord.prefix)) return;

  const args = message.content.slice(config.discord.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  await executeCommand(message, commandName, args);
}

module.exports = { messageCreate };