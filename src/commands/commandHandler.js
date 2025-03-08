const commands = new Map();

function registerCommand(name, handler) {
  commands.set(name, handler);
}

async function executeCommand(message, commandName, args) {
  const command = commands.get(commandName);
  if (!command) return;

  try {
    await command(message, args);
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    await message.reply('There was an error executing that command.');
  }
}

module.exports = { registerCommand, executeCommand };