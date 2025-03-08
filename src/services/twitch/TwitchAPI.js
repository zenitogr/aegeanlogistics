const axios = require('axios');
const { config } = require('../../config/config');

class TwitchAPI {
  static accessToken = null;
  static tokenExpiresAt = null;

  static async getAccessToken() {
    // If token exists and is not expired, return it
    if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `https://id.twitch.tv/oauth2/token`,
        null,
        {
          params: {
            client_id: config.twitch.clientId,
            client_secret: config.twitch.clientSecret,
            grant_type: 'client_credentials'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiration to 1 hour from now (Twitch tokens typically last 2 months, but we'll refresh more often)
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('[TwitchAPI] Error getting access token:', error.response?.data || error);
      throw new Error('Failed to get Twitch access token');
    }
  }

  static async makeAuthorizedRequest(endpoint, params = {}) {
    const token = await this.getAccessToken();
    
    try {
      const response = await axios.get(`https://api.twitch.tv/helix/${endpoint}`, {
        params,
        headers: {
          'Client-ID': config.twitch.clientId,
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token might be invalid, clear it and try once more
        this.accessToken = null;
        const newToken = await this.getAccessToken();
        
        const retryResponse = await axios.get(`https://api.twitch.tv/helix/${endpoint}`, {
          params,
          headers: {
            'Client-ID': config.twitch.clientId,
            'Authorization': `Bearer ${newToken}`
          }
        });
        
        return retryResponse.data;
      }
      throw error;
    }
  }

  static async getUserByUsername(username) {
    try {
      const data = await this.makeAuthorizedRequest('users', { login: username });
      return data.data[0] || null;
    } catch (error) {
      console.error('[TwitchAPI] Error getting user info:', error.response?.data || error);
      throw error;
    }
  }

  static async getStreamInfo(username) {
    try {
      const data = await this.makeAuthorizedRequest('streams', { user_login: username });
      return data.data[0] || null;
    } catch (error) {
      console.error('[TwitchAPI] Error getting stream info:', error.response?.data || error);
      throw error;
    }
  }

  static async isStreamLive(username) {
    try {
      const streamInfo = await this.getStreamInfo(username);
      return streamInfo !== null;
    } catch (error) {
      console.error('[TwitchAPI] Error checking stream status:', error);
      return false;
    }
  }
}

module.exports = TwitchAPI;
