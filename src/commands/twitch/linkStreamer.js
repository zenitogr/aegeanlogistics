const BaseCommand = require('../base/BaseCommand');
const commandRegistry = require('../commandRegistry');
const StreamerStorage = require('../../services/storage/StreamerStorage');
const TwitchAPI = require('../../services/twitch/TwitchAPI');
const { MessageFlags } = require('../../utils/discordConstants');

class LinkStreamerCommand extends BaseCommand {
  constructor() {
    super({
      name: 'linkstreamer',
      description: 'Links your Discord account to your Twitch username',
      usage: 'linkstreamer <twitch_username>',
      example: 'linkstreamer ninja',
      slashCommandOptions: [
        {
          name: 'username',
          description: 'Your Twitch username',
          type: 3, // STRING
          required: true
        }
      ]
    });
  }

  async executeSlash(interaction) {
    const twitchUsername = interaction.options.getString('username');
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    
    try {
      const user = await TwitchAPI.getUserByUsername(twitchUsername);
      if (!user) {
        return interaction.editReply('Could not find that Twitch user.');
      }

      const streamers = await StreamerStorage.getStreamers();
      const streamerExists = streamers.some(([username]) => 
        username.toLowerCase() === twitchUsername.toLowerCase()
      );

      if (!streamerExists) {
        // Add new streamer if not already monitored
        await StreamerStorage.addStreamer(twitchUsername, interaction.channel.id, interaction.user.id);
      } else {
        // If streamer exists, just link the Discord user
        await StreamerStorage.linkDiscordUser(twitchUsername, interaction.user.id);
      }

      return interaction.editReply(`Successfully linked your Discord account to Twitch username: ${twitchUsername}`);
    } catch (error) {
      console.error('Error linking streamer:', error);
      return interaction.editReply('There was an error linking your Twitch account. Please try again later.');
    }
  }

  async executePrefix(message, args) {
    const twitchUsername = args[0];
    
    if (!twitchUsername) {
      return message.reply('Please provide a Twitch username to link.');
    }

    const statusMsg = await message.reply('Checking Twitch username...');

    try {
      const user = await TwitchAPI.getUserByUsername(twitchUsername);
      if (!user) {
        return statusMsg.edit('Could not find that Twitch user. Please check the username and try again.');
      }

      const streamers = await StreamerStorage.getStreamers();
      const streamerExists = streamers.some(([username]) => 
        username.toLowerCase() === twitchUsername.toLowerCase()
      );

      if (!streamerExists) {
        // Add new streamer if not already monitored
        await StreamerStorage.addStreamer(twitchUsername, message.channel.id, message.author.id);
      } else {
        // If streamer exists, just link the Discord user
        await StreamerStorage.linkDiscordUser(twitchUsername, message.author.id);
      }

      await statusMsg.edit(`Successfully linked your Discord account to Twitch user: ${twitchUsername}`);
    } catch (error) {
      console.error('Error linking streamer:', error);
      await statusMsg.edit('There was an error linking your Twitch account. Please try again later.');
    }
  }
}

const linkStreamerCommand = new LinkStreamerCommand();
commandRegistry.registerCommand(linkStreamerCommand);

module.exports = linkStreamerCommand;
