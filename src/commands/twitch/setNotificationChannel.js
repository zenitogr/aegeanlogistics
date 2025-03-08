const BaseCommand = require('../base/BaseCommand');
const commandRegistry = require('../commandRegistry');
const { PermissionFlagsBits, MessageFlags } = require('../../utils/discordConstants');
const StreamerStorage = require('../../services/storage/StreamerStorage');
const SettingsStorage = require('../../services/storage/SettingsStorage');

class SetNotificationChannelCommand extends BaseCommand {
  constructor() {
    super({
      name: 'setnotificationchannel',
      description: 'Sets the channel for Twitch stream notifications',
      usage: 'setnotificationchannel',
      example: 'setnotificationchannel',
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
      slashCommandOptions: [
        {
          name: 'channel',
          description: 'The channel to send notifications in (defaults to current channel)',
          type: 7, // CHANNEL
          required: false,
          channel_types: [0] // TEXT channels only
        }
      ]
    });
  }

  async checkPermissions(member) {
    return member.permissions.has(PermissionFlagsBits.Administrator);
  }

  async executeSlash(interaction) {
    if (!await this.checkPermissions(interaction.member)) {
      return interaction.reply({ 
        content: 'You need administrator permissions to use this command.',
        flags: [MessageFlags.Ephemeral]
      });
    }

    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

    try {
      // Check if the bot has permission to send messages in the target channel
      const botMember = interaction.guild.members.me;
      const channelPermissions = targetChannel.permissionsFor(botMember);
      
      if (!channelPermissions.has(PermissionFlagsBits.SendMessages)) {
        return interaction.reply({
          content: `I don't have permission to send messages in ${targetChannel}. Please grant me the necessary permissions first.`,
          flags: [MessageFlags.Ephemeral]
        });
      }

      // Update both the default channel and existing streamers
      await SettingsStorage.setDefaultNotificationChannel(targetChannel.id);
      await StreamerStorage.updateNotificationChannel(targetChannel.id);

      return interaction.reply({
        content: `Successfully set ${targetChannel} as the notification channel for all Twitch streams!`,
        flags: [] // Non-ephemeral message
      });
    } catch (error) {
      console.error('Error setting notification channel:', error);
      return interaction.reply({
        content: 'There was an error setting the notification channel. Please try again later.',
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

    try {
      // Check if the bot has permission to send messages in the channel
      const botMember = message.guild.members.me;
      const channelPermissions = message.channel.permissionsFor(botMember);
      
      if (!channelPermissions.has(PermissionFlagsBits.SendMessages)) {
        const errorMessage = await message.reply(
          "I don't have permission to send messages in this channel. Please grant me the necessary permissions first."
        );
        setTimeout(() => errorMessage.delete().catch(() => {}), 10000);
        return;
      }

      // Update both the default channel and existing streamers
      await SettingsStorage.setDefaultNotificationChannel(message.channel.id);
      await StreamerStorage.updateNotificationChannel(message.channel.id);

      return message.reply(`Successfully set ${message.channel} as the notification channel for all Twitch streams!`);
    } catch (error) {
      console.error('Error setting notification channel:', error);
      const errorMessage = await message.reply('There was an error setting the notification channel. Please try again later.');
      setTimeout(() => errorMessage.delete().catch(() => {}), 10000);
    }
  }
}

const setNotificationChannelCommand = new SetNotificationChannelCommand();
commandRegistry.registerCommand(setNotificationChannelCommand);

module.exports = setNotificationChannelCommand;
