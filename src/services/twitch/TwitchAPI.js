const { config } = require('../../config/config');

class TwitchAPI {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.twitch.clientId,
        client_secret: config.twitch.clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    return this.accessToken;
  }

  async getStreamStatus(username) {
    const token = await this.getAccessToken();
    const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${username}`, {
      headers: {
        'Client-ID': config.twitch.clientId,
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data.data[0] || null;
  }

  async getUserByUsername(username) {
    const token = await this.getAccessToken();
    const response = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
      headers: {
        'Client-ID': config.twitch.clientId,
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data.data[0] || null;
  }
}

module.exports = new TwitchAPI();