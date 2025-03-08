const BaseCommand = require('../base/BaseCommand');
const commandRegistry = require('../commandRegistry');
const StreamerStorage = require('../../services/storage/StreamerStorage');
const { MessageFlags } = require('../../utils/discordConstants');

class UnlinkStreamerCommand extends BaseCommand {
  constructor() {
    super({
      name: 'unlinkstreamer',
      description: 'Unlinks your Discord account from your Twitch username',
      usage: 'unlinkstreamer',
      example: 'unlinkstreamer'
    });
  }

  async executeSlash(interaction) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    
    try {
      const unlinked = await StreamerStorage.unlinkDiscordUser(interaction.user.id);
      
      if (unlinked) {
        return interaction.editReply('Successfully unlinked your Discord account from your Twitch account.');
      } else {
        return interaction.editReply('No linked Twitch account found for your Discord account.');
      }
    } catch (error) {
      console.error('Error unlinking streamer:', error);
      return interaction.editReply('There was an error unlinking your Twitch account. Please try again later.');
    }
  }

  async executePrefix(message) {
    try {
      const unlinked = await StreamerStorage.unlinkDiscordUser(message.author.id);
      
      if (unlinked) {
        return message.reply('Successfully unlinked your Discord account from your Twitch account.');
      } else {
        return message.reply('No linked Twitch account found for your Discord account.');
      }
    } catch (error) {
      console.error('Error unlinking streamer:', error);
      return message.reply('There was an error unlinking your Twitch account. Please try again later.');
    }
  }
}

const unlinkStreamerCommand = new UnlinkStreamerCommand();
commandRegistry.registerCommand(unlinkStreamerCommand);

module.exports = unlinkStreamerCommand;
