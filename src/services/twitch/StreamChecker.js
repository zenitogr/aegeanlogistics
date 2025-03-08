const TwitchAPI = require('./TwitchAPI');

class StreamChecker {
  constructor() {
    this.knownStreams = new Map();
  }

  async checkStream(username) {
    try {
      const streamInfo = await TwitchAPI.getStreamInfo(username);
      const wasLive = this.knownStreams.get(username)?.isLive || false;
      
      console.log(`[StreamChecker] Checking ${username}:`, {
        currentlyLive: !!streamInfo,
        wasLive,
        knownStreamData: this.knownStreams.get(username)
      });
      
      if (streamInfo) {
        // Stream is live
        const isNewStream = this.isNewStream(username, streamInfo);
        console.log(`[StreamChecker] ${username} is live, isNewStream:`, isNewStream);
        
        this.knownStreams.set(username, {
          isLive: true,
          lastStreamId: streamInfo.id,
          lastCheck: Date.now()
        });
        
        return {
          isLive: true,
          shouldNotify: isNewStream,
          streamInfo
        };
      } else {
        // Stream is offline
        console.log(`[StreamChecker] ${username} is offline`);
        
        this.knownStreams.set(username, {
          isLive: false,
          lastStreamId: null,
          lastCheck: Date.now()
        });
        
        return {
          isLive: false,
          shouldNotify: false,
          streamInfo: null
        };
      }
    } catch (error) {
      console.error(`[StreamChecker] Error checking stream for ${username}:`, error);
      return {
        isLive: false,
        shouldNotify: false,
        streamInfo: null
      };
    }
  }

  isNewStream(username, streamInfo) {
    const knownStream = this.knownStreams.get(username);
    if (!knownStream) {
      console.log(`[StreamChecker] New stream detected for ${username} (no previous data)`);
      return true;
    }
    if (!knownStream.isLive) {
      console.log(`[StreamChecker] New stream detected for ${username} (was offline)`);
      return true;
    }
    if (knownStream.lastStreamId !== streamInfo.id) {
      console.log(`[StreamChecker] New stream detected for ${username} (different stream ID)`);
      return true;
    }
    console.log(`[StreamChecker] Not a new stream for ${username}`);
    return false;
  }

  clearStreamHistory(username) {
    console.log(`[StreamChecker] Clearing stream history for ${username}`);
    this.knownStreams.delete(username);
  }
}

module.exports = StreamChecker;
