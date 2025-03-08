const { EmbedBuilder } = require('discord.js');
const { registerCommand } = require('../commandHandler');
const StreamerStorage = require('../../services/storage/StreamerStorage');

async function listStreamersCommand(message) {
  const streamers = StreamerStorage.getStreamers();
  
  const embed = new EmbedBuilder()
    .setTitle('Monitored Twitch Streamers')
    .setColor('#6441A4')
    .setDescription(
      streamers.length 
        ? streamers.map(([username, data]) => {
            const status = data.isLive ? '🔴 Live' : '⚫ Offline';
            const discordLink = data.discordUserId ? `<@${data.discordUserId}>` : 'Not linked';
            return `• ${username} ${status}\n  Discord: ${discordLink}`;
          }).join('\n')
        : 'No streamers are currently being monitored.'
    )
    .setTimestamp();

  return message.reply({ embeds: [embed] });
}

registerCommand('streamers', listStreamersCommand);
