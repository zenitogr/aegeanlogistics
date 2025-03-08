const TwitchAPI = require('./TwitchAPI');
const StreamChecker = require('./StreamChecker');
const StreamerStorage = require('../storage/StreamerStorage');
const SettingsStorage = require('../storage/SettingsStorage');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

class TwitchNotifier {
  constructor(client) {
    this.client = client;
    this.streamers = new Map();
    this.checkInterval = null;
    this.streamChecker = new StreamChecker();
  }

  async initialize() {
    console.log('[TwitchNotifier] Initializing...');
    await this.loadStreamers();
    this.startPolling();
    console.log('[TwitchNotifier] Initialization complete');
  }

  async loadStreamers() {
    const streamers = await StreamerStorage.loadStreamers();
    this.streamers = new Map(streamers);
    return this.streamers;
  }

  async getStreamers() {
    return this.streamers;
  }

  startPolling() {
    // Check every minute
    const POLLING_INTERVAL = 60 * 1000;
    
    this.checkInterval = setInterval(async () => {
      try {
        await this.checkAllStreamers();
      } catch (error) {
        console.error('[TwitchNotifier] Error in polling:', error);
      }
    }, POLLING_INTERVAL);
  }

  async checkAllStreamers() {
    console.log('[TwitchNotifier] Starting check for all streamers');
    for (const [username] of this.streamers) {
      try {
        console.log(`[TwitchNotifier] Checking streamer: ${username}`);
        const result = await this.streamChecker.checkStream(username);
        console.log(`[TwitchNotifier] Check result for ${username}:`, {
          isLive: result.isLive,
          shouldNotify: result.shouldNotify
        });
        
        if (result.shouldNotify) {
          console.log(`[TwitchNotifier] Sending notification for ${username}`);
          await this.handleStreamOnline(username, result.streamInfo);
        }
        // Update streamer status in storage
        await StreamerStorage.updateStreamerStatus(username, result.isLive);
      } catch (error) {
        console.error(`[TwitchNotifier] Error checking streamer ${username}:`, error);
      }
    }
    console.log('[TwitchNotifier] Completed check for all streamers');
  }

  async handleStreamOnline(username, streamInfo) {
    try {
      const channelId = await SettingsStorage.getDefaultNotificationChannel();
      if (!channelId) {
        console.log('[TwitchNotifier] No notification channel set');
        return;
      }

      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        console.log('[TwitchNotifier] Could not find notification channel');
        return;
      }

      // Detailed permission checking
      const botMember = channel.guild.members.me;
      const channelPermissions = channel.permissionsFor(botMember);
      
      console.log('[TwitchNotifier] Permission check:', {
        hasAdminPermission: botMember.permissions.has(PermissionFlagsBits.Administrator),
        hasMentionEveryone: channelPermissions.has(PermissionFlagsBits.MentionEveryone),
        botRoleName: botMember.roles.highest.name,
        botRolePosition: botMember.roles.highest.position,
        channelName: channel.name,
        allPermissions: channelPermissions.toArray()
      });

      if (!channelPermissions.has(PermissionFlagsBits.MentionEveryone)) {
        console.log('[TwitchNotifier] Bot lacks permission to mention everyone');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#6441a5')
        .setTitle(`${streamInfo.user_name} is now live on Twitch!`)
        .setURL(`https://twitch.tv/${streamInfo.user_login}`)
        .setDescription(streamInfo.title)
        .addFields(
          { name: 'Game', value: streamInfo.game_name || 'No game set', inline: true },
          { name: 'Viewers', value: streamInfo.viewer_count.toString(), inline: true }
        )
        .setImage(streamInfo.thumbnail_url.replace('{width}', '1280').replace('{height}', '720'))
        .setTimestamp();

      // Send two separate messages with logging
      console.log('[TwitchNotifier] Attempting to send @everyone mention...');
      const roleId = '1347928402299977798';
      const mentionMsg = await channel.send({
        content: `<@&${roleId}>`, // Mention the role
        allowedMentions: { roles: [roleId] } // Allow role mention notifications
      });
      console.log('[TwitchNotifier] Mention message sent:', mentionMsg.id);

      const contentMsg = await channel.send({ 
        content: `🔴 **${streamInfo.user_name}** is now live!`,
        embeds: [embed]
      });
      console.log('[TwitchNotifier] Content message sent:', contentMsg.id);
      
      console.log(`[TwitchNotifier] Sent notification for ${username}`);
    } catch (error) {
      console.error('[TwitchNotifier] Error sending stream notification:', error);
    }
  }

  stopPolling() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

module.exports = TwitchNotifier;
