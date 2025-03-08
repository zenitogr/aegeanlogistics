const fs = require('fs/promises');
const path = require('path');

class StreamerStorage {
  static STORAGE_PATH = path.join(process.cwd(), 'src', 'data', 'streamers.json');

  static async loadStreamers() {
    try {
      const data = await fs.readFile(this.STORAGE_PATH, 'utf8');
      return JSON.parse(data) || [];
    } catch (error) {
      if (error.code === 'ENOENT') {
        // If file doesn't exist, create it with empty array
        await this.saveStreamers([]);
        return [];
      }
      console.error('Error loading streamers:', error);
      throw error;
    }
  }

  static async saveStreamers(streamers) {
    try {
      await fs.writeFile(this.STORAGE_PATH, JSON.stringify(streamers, null, 2));
    } catch (error) {
      console.error('Error saving streamers:', error);
      throw error;
    }
  }

  static async getStreamers() {
    return this.loadStreamers();
  }

  static async addStreamer(twitchUsername, channelId, discordUserId = null) {
    const streamers = await this.loadStreamers();
    const existingIndex = streamers.findIndex(([username]) => 
      username.toLowerCase() === twitchUsername.toLowerCase()
    );

    if (existingIndex !== -1) {
      // Update existing streamer
      streamers[existingIndex] = [
        twitchUsername,
        {
          ...streamers[existingIndex][1],
          channelId,
          discordUserId: discordUserId || streamers[existingIndex][1].discordUserId
        }
      ];
    } else {
      // Add new streamer
      streamers.push([
        twitchUsername,
        {
          channelId,
          discordUserId,
          isLive: false,
          lastCheck: null
        }
      ]);
    }

    await this.saveStreamers(streamers);
    return true;
  }

  static async removeStreamer(twitchUsername) {
    const streamers = await this.loadStreamers();
    const initialLength = streamers.length;
    
    const filtered = streamers.filter(([username]) => 
      username.toLowerCase() !== twitchUsername.toLowerCase()
    );
    
    if (filtered.length !== initialLength) {
      await this.saveStreamers(filtered);
      return true;
    }
    
    return false;
  }

  static async updateStreamerStatus(twitchUsername, isLive) {
    const streamers = await this.loadStreamers();
    const existingIndex = streamers.findIndex(([username]) => 
      username.toLowerCase() === twitchUsername.toLowerCase()
    );

    if (existingIndex === -1) return false;

    streamers[existingIndex] = [
      streamers[existingIndex][0],
      {
        ...streamers[existingIndex][1],
        isLive,
        lastCheck: Date.now()
      }
    ];

    await this.saveStreamers(streamers);
    return true;
  }

  static async linkDiscordUser(twitchUsername, discordUserId) {
    const streamers = await this.loadStreamers();
    const existingIndex = streamers.findIndex(([username]) => 
      username.toLowerCase() === twitchUsername.toLowerCase()
    );

    if (existingIndex !== -1) {
      streamers[existingIndex][1].discordUserId = discordUserId;
      await this.saveStreamers(streamers);
      return true;
    }

    return false;
  }

  static async unlinkDiscordUser(discordUserId) {
    const streamers = await this.loadStreamers();
    let found = false;

    for (const streamer of streamers) {
      if (streamer[1].discordUserId === discordUserId) {
        streamer[1].discordUserId = null;
        found = true;
      }
    }

    if (found) {
      await this.saveStreamers(streamers);
    }
    return found;
  }

  static async updateNotificationChannel(channelId) {
    const streamers = await this.loadStreamers();
    for (const streamer of streamers) {
      streamer[1].channelId = channelId;
    }
    await this.saveStreamers(streamers);
  }
}

module.exports = StreamerStorage;
