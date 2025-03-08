const BaseCommand = require('../base/BaseCommand');
const commandRegistry = require('../commandRegistry');
const StreamerStorage = require('../../services/storage/StreamerStorage');
const TwitchAPI = require('../../services/twitch/TwitchAPI');
const { PermissionFlagsBits } = require('discord.js');

class SyncCommand extends BaseCommand {
  constructor() {
    super({
      name: 'sync',
      description: 'Synchronizes Twitch streamer statuses',
      usage: 'sync',
      example: 'sync',
      defaultMemberPermissions: PermissionFlagsBits.Administrator
    });
  }

  async checkPermissions(member) {
    return member.permissions.has(PermissionFlagsBits.Administrator);
  }

  async executeSync() {
    const streamers = await StreamerStorage.getStreamers();
    const results = {
      total: streamers.length,
      updated: 0,
      failed: 0,
      details: []
    };

    for (const [username, data] of streamers) {
      try {
        const isLive = await TwitchAPI.isStreamLive(username);
        await StreamerStorage.updateStreamerStatus(username, isLive);
        
        results.updated++;
        results.details.push({
          username,
          status: isLive ? '🟢 Live' : '⚫ Offline',
          success: true
        });
      } catch (error) {
        console.error(`Error syncing streamer ${username}:`, error);
        results.failed++;
        results.details.push({
          username,
          status: '❌ Error',
          success: false
        });
      }
    }

    return results;
  }

  async executeSlash(interaction) {
    if (!await this.checkPermissions(interaction.member)) {
      return interaction.reply({
        content: 'You need administrator permissions to use this command.',
        ephemeral: true
      });
    }

    await interaction.deferReply();

    try {
      const results = await this.executeSync();
      
      const statusMessage = [
        '**Sync Results**',
        `Total streamers: ${results.total}`,
        `✅ Successfully updated: ${results.updated}`,
        `❌ Failed: ${results.failed}`,
        '',
        '**Details:**',
        ...results.details.map(detail => 
          `${detail.success ? '✓' : '✗'} ${detail.username}: ${detail.status}`
        )
      ].join('\n');

      await interaction.editReply(statusMessage);
    } catch (error) {
      console.error('Error executing sync command:', error);
      await interaction.editReply('There was an error synchronizing streamer statuses. Please try again later.');
    }
  }

  async executePrefix(message) {
    if (!await this.checkPermissions(message.member)) {
      return message.reply('You need administrator permissions to use this command.');
    }

    const statusMessage = await message.reply('Synchronizing streamer statuses...');

    try {
      const results = await this.executeSync();
      
      const resultMessage = [
        '**Sync Results**',
        `Total streamers: ${results.total}`,
        `✅ Successfully updated: ${results.updated}`,
        `❌ Failed: ${results.failed}`,
        '',
        '**Details:**',
        ...results.details.map(detail => 
          `${detail.success ? '✓' : '✗'} ${detail.username}: ${detail.status}`
        )
      ].join('\n');

      await statusMessage.edit(resultMessage);
    } catch (error) {
      console.error('Error executing sync command:', error);
      await statusMessage.edit('There was an error synchronizing streamer statuses. Please try again later.');
    }
  }
}

const syncCommand = new SyncCommand();
commandRegistry.registerCommand(syncCommand);

module.exports = syncCommand;
