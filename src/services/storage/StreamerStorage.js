const fs = require('fs').promises;
const path = require('path');

class StreamerStorage {
  constructor() {
    this.filePath = path.join(__dirname, '../../data/streamers.json');
    this.streamers = new Map();
    this.initialize();
  }

  async initialize() {
    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      const data = await fs.readFile(this.filePath, 'utf8');
      const streamers = JSON.parse(data);
      this.streamers = new Map(streamers);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this.save();
      } else {
        console.error('Error initializing streamer storage:', error);
      }
    }
  }

  async save() {
    const data = JSON.stringify(Array.from(this.streamers.entries()), null, 2);
    await fs.writeFile(this.filePath, data, 'utf8');
  }

  async addStreamer(twitchUsername, discordChannelId, discordUserId = null) {
    this.streamers.set(twitchUsername.toLowerCase(), {
      channelId: discordChannelId,
      discordUserId: discordUserId,
      isLive: false,
      lastCheck: null,
    });
    await this.save();
  }

  async removeStreamer(twitchUsername) {
    const removed = this.streamers.delete(twitchUsername.toLowerCase());
    if (removed) {
      await this.save();
    }
    return removed;
  }

  getStreamers() {
    return Array.from(this.streamers.entries());
  }

  getStreamerByDiscordId(discordUserId) {
    return Array.from(this.streamers.entries()).find(([_, data]) => data.discordUserId === discordUserId);
  }

  async updateStreamerStatus(twitchUsername, isLive) {
    const streamer = this.streamers.get(twitchUsername.toLowerCase());
    if (streamer) {
      streamer.isLive = isLive;
      streamer.lastCheck = Date.now();
      await this.save();
    }
  }

  async linkDiscordUser(twitchUsername, discordUserId) {
    const streamer = this.streamers.get(twitchUsername.toLowerCase());
    if (streamer) {
      streamer.discordUserId = discordUserId;
      await this.save();
      return true;
    }
    return false;
  }

  async unlinkDiscordUser(twitchUsername) {
    const streamer = this.streamers.get(twitchUsername.toLowerCase());
    if (streamer) {
      streamer.discordUserId = null;
      await this.save();
      return true;
    }
    return false;
  }
}

module.exports = new StreamerStorage();
