const { EmbedBuilder } = require('discord.js');
const TwitchAPI = require('./TwitchAPI');
const StreamerStorage = require('../storage/StreamerStorage');

class TwitchNotifier {
  constructor(client) {
    this.client = client;
    this.checkInterval = 2 * 60 * 1000; // Check every 2 minutes
    this.initialize();
  }

  initialize() {
    setInterval(() => this.checkStreamers(), this.checkInterval);
  }

  async checkStreamers() {
    const streamers = StreamerStorage.getStreamers();
    
    for (const [username, data] of streamers) {
      try {
        const streamData = await TwitchAPI.getStreamStatus(username);
        const wasLive = data.isLive;
        const isLive = Boolean(streamData);

        if (!wasLive && isLive) {
          await this.sendLiveNotification(username, streamData, data);
        }
        
        await StreamerStorage.updateStreamerStatus(username, isLive);
      } catch (error) {
        console.error(`Error checking streamer ${username}:`, error);
      }
    }
  }

  async sendLiveNotification(username, streamData, streamerData) {
    const channel = await this.client.channels.fetch(streamerData.channelId);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor('#6441A4')
      .setTitle(`${streamData.user_name} is now live on Twitch!`)
      .setURL(`https://twitch.tv/${username}`)
      .setDescription(streamData.title)
      .addFields(
        { name: 'Game', value: streamData.game_name || 'No game set', inline: true },
        { name: 'Viewers', value: streamData.viewer_count.toString(), inline: true }
      )
      .setImage(streamData.thumbnail_url.replace('{width}', '1280').replace('{height}', '720'))
      .setTimestamp();

    const mentionText = streamerData.discordUserId 
      ? `@everyone <@${streamerData.discordUserId}> is now live!`
      : '@everyone A driver is now live!';

    await channel.send({ 
      content: mentionText, 
      embeds: [embed] 
    });
  }
}

module.exports = TwitchNotifier;
