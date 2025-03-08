const WebSocket = require('ws');
const crypto = require('crypto');
const axios = require('axios');
const { config } = require('../../config/config');
const TwitchAPI = require('./TwitchAPI');

class TwitchEventSub {
  constructor(client) {
    this.client = client;
    this.ws = null;
    this.subscriptions = new Map();
    this.notifier = null;
    this.sessionId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async initialize(notifier) {
    console.log('[TwitchEventSub] Starting initialization...');
    this.notifier = notifier;
    await this.connectWebSocket();
    console.log('[TwitchEventSub] Initialization complete');
  }

  async connectWebSocket() {
    try {
      console.log('[TwitchEventSub] Connecting to Twitch WebSocket...');
      
      const token = await TwitchAPI.getAccessToken();
      const response = await axios.post('https://eventsub.wss.twitch.tv/create', {}, {
        headers: {
          'Client-ID': config.twitch.clientId,
          'Authorization': `Bearer ${token}`
        }
      });

      const wsUrl = response.data.data.websocket_url;
      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        console.log('[TwitchEventSub] WebSocket connection established');
        this.reconnectAttempts = 0;
        this.subscribeToAllStreamers();
      });

      this.ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('[TwitchEventSub] Error processing message:', error);
        }
      });

      this.ws.on('close', (code, reason) => {
        console.log(`[TwitchEventSub] WebSocket closed: ${code} - ${reason}`);
        this.handleReconnect();
      });

      this.ws.on('error', (error) => {
        console.error('[TwitchEventSub] WebSocket error:', error);
      });

    } catch (error) {
      console.error('[TwitchEventSub] Failed to connect to WebSocket:', error);
      this.handleReconnect();
    }
  }

  async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[TwitchEventSub] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`[TwitchEventSub] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => this.connectWebSocket(), delay);
  }

  async handleWebSocketMessage(message) {
    if (!message.metadata) return;

    switch (message.metadata.message_type) {
      case 'session_welcome':
        this.sessionId = message.payload.session.id;
        console.log('[TwitchEventSub] Received session ID:', this.sessionId);
        await this.subscribeToAllStreamers();
        break;

      case 'notification':
        await this.handleNotification(message.payload);
        break;

      case 'session_keepalive':
        // Optional: Log keepalive for debugging
        // console.log('[TwitchEventSub] Received keepalive');
        break;

      default:
        console.log('[TwitchEventSub] Unhandled message type:', message.metadata.message_type);
    }
  }

  async handleNotification(payload) {
    if (payload.subscription.type === 'stream.online') {
      const username = payload.event.broadcaster_user_login;
      console.log(`[TwitchEventSub] Stream online: ${username}`);
      const streamInfo = await TwitchAPI.getStreamInfo(username);
      if (streamInfo) {
        await this.notifier.handleStreamOnline(username, streamInfo);
      }
    }
  }

  async subscribeToAllStreamers() {
    if (!this.sessionId) {
      console.log('[TwitchEventSub] No session ID available, skipping subscriptions');
      return;
    }

    console.log('[TwitchEventSub] Subscribing to all streamers...');
    const streamers = await this.notifier.getStreamers();
    
    for (const [username] of streamers) {
      await this.subscribeToStreamer(username);
    }
  }

  async subscribeToStreamer(username) {
    try {
      console.log(`[TwitchEventSub] Subscribing to ${username}...`);
      const user = await TwitchAPI.getUserByUsername(username);
      
      if (!user) {
        console.error(`[TwitchEventSub] Could not find user: ${username}`);
        return;
      }

      const token = await TwitchAPI.getAccessToken();
      const subscriptionData = {
        type: 'stream.online',
        version: '1',
        condition: {
          broadcaster_user_id: user.id
        },
        transport: {
          method: 'websocket',
          session_id: this.sessionId
        }
      };

      const response = await axios.post(
        'https://api.twitch.tv/helix/eventsub/subscriptions',
        subscriptionData,
        {
          headers: {
            'Client-ID': config.twitch.clientId,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[TwitchEventSub] Successfully subscribed to ${username}`);
      this.subscriptions.set(username, response.data.data[0].id);
    } catch (error) {
      console.error(`[TwitchEventSub] Error subscribing to ${username}:`, 
        error.response?.data || error.message);
    }
  }
}

module.exports = TwitchEventSub;
