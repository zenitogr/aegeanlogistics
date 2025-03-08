const BaseCommand = require('../base/BaseCommand');
const commandRegistry = require('../commandRegistry');
const StreamerStorage = require('../../services/storage/StreamerStorage');
const { config } = require('../../config/config');
const { PermissionFlagsBits, MessageFlags } = require('../../utils/discordConstants');

class RemoveStreamerCommand extends BaseCommand {
  constructor() {
    super({
      name: 'removestreamer',
      description: 'Removes a Twitch streamer from the notification list',
      usage: 'removestreamer <twitch_username>',
      example: 'removestreamer ninja',
      slashCommandOptions: [
        {
          name: 'username',
          description: 'Twitch username to remove',
          type: 3, // STRING
          required: true
        }
      ]
    });
  }

  async checkPermissions(member) {
    return member.permissions.has('ADMINISTRATOR');
  }

  async executeSlash(interaction) {
    if (!await this.checkPermissions(interaction.member)) {
      return interaction.reply({ 
        content: 'You need administrator permissions to use this command.',
        flags: [MessageFlags.Ephemeral]
      });
    }

    const twitchUsername = interaction.options.getString('username');
    
    try {
      const removed = await StreamerStorage.removeStreamer(twitchUsername);
      if (removed) {
        return interaction.reply(`Successfully removed ${twitchUsername} from the notification list!`);
      } else {
        return interaction.reply({
          content: `${twitchUsername} was not found in the notification list.\nUse \`${config.discord.prefix}streamers\` to see all monitored streamers.`,
          flags: [MessageFlags.Ephemeral]
        });
      }
    } catch (error) {
      console.error('Error removing streamer:', error);
      return interaction.reply({
        content: 'There was an error removing the streamer. Please try again later.',
        flags: [MessageFlags.Ephemeral]
      });
    }
  }

  async executePrefix(message, args) {
    if (!await this.checkPermissions(message.member)) {
      const errorMessage = await message.reply('You need administrator permissions to use this command.');
      setTimeout(() => errorMessage.delete().catch(() => {}), 10000);
      return;
    }

    if (!args.length) {
      const helpMessage = await message.reply(
        `⚠️ Incorrect usage. Command: \`${config.discord.prefix}removestreamer <twitch_username>\`\n` +
        `Example: \`${config.discord.prefix}removestreamer ninja\`\n` +
        `Use \`${config.discord.prefix}help removestreamer\` for more information.`
      );
      setTimeout(() => helpMessage.delete().catch(() => {}), 10000);
      return;
    }

    const twitchUsername = args[0];

    try {
      const removed = await StreamerStorage.removeStreamer(twitchUsername);
      if (removed) {
        return message.reply(`Successfully removed ${twitchUsername} from the notification list!`);
      } else {
        const errorMessage = await message.reply(
          `${twitchUsername} was not found in the notification list.\n` +
          `Use \`${config.discord.prefix}streamers\` to see all monitored streamers.`
        );
        setTimeout(() => errorMessage.delete().catch(() => {}), 10000);
      }
    } catch (error) {
      console.error('Error removing streamer:', error);
      const errorMessage = await message.reply(
        'There was an error removing the streamer. Please try again later.'
      );
      setTimeout(() => errorMessage.delete().catch(() => {}), 10000);
    }
  }
}

const removeStreamerCommand = new RemoveStreamerCommand();
commandRegistry.registerCommand(removeStreamerCommand);

module.exports = removeStreamerCommand;
