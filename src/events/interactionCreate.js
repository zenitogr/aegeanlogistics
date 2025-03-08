const commandRegistry = require('../commands/commandRegistry');
const { MessageFlags } = require('../utils/discordConstants');

async function interactionCreate(interaction) {
  // Only handle chat input commands
  if (!interaction.isChatInputCommand()) return;

  try {
    console.log(`Received command interaction: ${interaction.commandName}`);
    const command = commandRegistry.getCommand(interaction.commandName);
    
    if (command) {
      await command.executeSlash(interaction);
    } else {
      console.log(`Command not found: ${interaction.commandName}`);
      await interaction.reply({
        content: 'Unknown command. Please use /help to see available commands.',
        flags: [MessageFlags.Ephemeral]
      });
    }
  } catch (error) {
    console.error('Error in interactionCreate handler:', error);
    
    try {
      const errorResponse = { 
        content: 'There was an error while executing this command!',
        flags: [MessageFlags.Ephemeral]
      };

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply(errorResponse);
      } else {
        await interaction.editReply(errorResponse);
      }
    } catch (err) {
      console.error('Error sending error response:', err);
    }
  }
}

module.exports = { interactionCreate };
