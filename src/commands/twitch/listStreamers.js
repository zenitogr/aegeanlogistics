const BaseCommand = require('../base/BaseCommand');
const commandRegistry = require('../commandRegistry');
const StreamerStorage = require('../../services/storage/StreamerStorage');
const TwitchAPI = require('../../services/twitch/TwitchAPI');
const { EmbedBuilder } = require('discord.js');

class ListStreamersCommand extends BaseCommand {
  constructor() {
    super({
      name: 'liststreamers',
      description: 'Lists all monitored Twitch streamers',
      usage: 'liststreamers',
      example: 'liststreamers',
      aliases: ['streamers']
    });
  }

  async createStreamerListEmbed(streamers) {
    const embed = new EmbedBuilder()
      .setColor('#6441a5')
      .setTitle('Monitored Twitch Streamers')
      .setTimestamp();

    if (streamers.length === 0) {
      embed.setDescription('No streamers are currently being monitored.');
      return embed;
    }

    // Create streamer list with current status
    const streamerList = await Promise.all(streamers.map(async ([username, data]) => {
      try {
        const isLive = await TwitchAPI.isStreamLive(username);
        // Update the stored status
        await StreamerStorage.updateStreamerStatus(username, isLive);
        
        const status = isLive ? '🟢 Live' : '⚫ Offline';
        const discordLink = data.discordUserId ? ` (<@${data.discordUserId}>)` : '';
        return `• **${username}** ${status}${discordLink}`;
      } catch (error) {
        console.error(`Error checking status for ${username}:`, error);
        return `• **${username}** ❓ Status Unknown${data.discordUserId ? ` (<@${data.discordUserId}>)` : ''}`;
      }
    }));

    embed.setDescription(streamerList.join('\n'));
    return embed;
  }

  async executeSlash(interaction) {
    await interaction.deferReply();
    
    try {
      const streamers = await StreamerStorage.getStreamers();
      const embed = await this.createStreamerListEmbed(streamers);
      return await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error listing streamers:', error);
      return await interaction.editReply('There was an error retrieving the streamers list.');
    }
  }

  async executePrefix(message) {
    try {
      const loadingMsg = await message.reply('Fetching streamer list...');
      const streamers = await StreamerStorage.getStreamers();
      const embed = await this.createStreamerListEmbed(streamers);
      await loadingMsg.delete().catch(() => {}); // Clean up loading message
      return await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error listing streamers:', error);
      return await message.reply('There was an error retrieving the streamers list.');
    }
  }
}

const listStreamersCommand = new ListStreamersCommand();
commandRegistry.registerCommand(listStreamersCommand);

module.exports = listStreamersCommand;
