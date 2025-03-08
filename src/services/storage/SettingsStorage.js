const fs = require('fs/promises');
const path = require('path');

class SettingsStorage {
  static STORAGE_PATH = path.join(__dirname, '../../data/settings.json');

  static async loadSettings() {
    try {
      const data = await fs.readFile(this.STORAGE_PATH, 'utf8');
      return JSON.parse(data) || { defaultNotificationChannel: null, lastUpdated: 0 };
    } catch (error) {
      if (error.code === 'ENOENT') {
        const defaultSettings = { defaultNotificationChannel: null, lastUpdated: 0 };
        await this.saveSettings(defaultSettings);
        return defaultSettings;
      }
      throw error;
    }
  }

  static async saveSettings(settings) {
    await fs.mkdir(path.dirname(this.STORAGE_PATH), { recursive: true });
    settings.lastUpdated = Date.now();
    await fs.writeFile(this.STORAGE_PATH, JSON.stringify(settings, null, 2));
  }

  static async getDefaultNotificationChannel() {
    const settings = await this.loadSettings();
    return settings.defaultNotificationChannel;
  }

  static async setDefaultNotificationChannel(channelId) {
    const settings = await this.loadSettings();
    settings.defaultNotificationChannel = channelId;
    await this.saveSettings(settings);
    return true;
  }
}

module.exports = SettingsStorage;