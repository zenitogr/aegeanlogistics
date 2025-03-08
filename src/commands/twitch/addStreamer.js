const BaseCommand = require('../base/BaseCommand');
const commandRegistry = require('../commandRegistry');
const StreamerStorage = require('../../services/storage/StreamerStorage');
const TwitchAPI = require('../../services/twitch/TwitchAPI');
const SettingsStorage = require('../../services/storage/SettingsStorage');
const { PermissionFlagsBits } = require('discord.js');

class AddStreamerCommand extends BaseCommand {
  constructor() {
    super({
      name: 'addstreamer',
      description: 'Adds a Twitch streamer to the monitoring list',
      usage: 'addstreamer <twitch_username>',
      example: 'addstreamer ninja',
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
      slashCommandOptions: [
        {
          name: 'username',
          description: 'Twitch username to monitor',
          type: 3, // STRING
          required: true
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
        ephemeral: true
      });
    }

    const twitchUsername = interaction.options.getString('username');
    await interaction.deferReply();

    try {
      const user = await TwitchAPI.getUserByUsername(twitchUsername);
      if (!user) {
        return interaction.editReply('Could not find that Twitch user.');
      }

      const defaultChannel = await SettingsStorage.getDefaultNotificationChannel();
      const channelId = defaultChannel || interaction.channel.id;

      await StreamerStorage.addStreamer(twitchUsername, channelId);
      return interaction.editReply(`Successfully added ${twitchUsername} to the monitored streamers list.`);
    } catch (error) {
      console.error('Error adding streamer:', error);
      return interaction.editReply('There was an error adding the streamer. Please try again later.');
    }
  }

  async executePrefix(message, args) {
    if (!await this.checkPermissions(message.member)) {
      return message.reply('You need administrator permissions to use this command.');
    }

    const twitchUsername = args[0];
    if (!twitchUsername) {
      return message.reply('Please provide a Twitch username to add.');
    }

    const statusMsg = await message.reply('Adding streamer...');

    try {
      const user = await TwitchAPI.getUserByUsername(twitchUsername);
      if (!user) {
        return statusMsg.edit('Could not find that Twitch user.');
      }

      const defaultChannel = await SettingsStorage.getDefaultNotificationChannel();
      const channelId = defaultChannel || message.channel.id;

      await StreamerStorage.addStreamer(twitchUsername, channelId);
      await statusMsg.edit(`Successfully added ${twitchUsername} to the monitored streamers list.`);
    } catch (error) {
      console.error('Error adding streamer:', error);
      await statusMsg.edit('There was an error adding the streamer. Please try again later.');
    }
  }
}

const addStreamerCommand = new AddStreamerCommand();
commandRegistry.registerCommand(addStreamerCommand);

module.exports = addStreamerCommand;
