const { registerCommand } = require('../commandHandler');
const StreamerStorage = require('../../services/storage/StreamerStorage');
const TwitchAPI = require('../../services/twitch/TwitchAPI');

async function addStreamerCommand(message, args) {
  if (!args.length) {
    return message.reply('Please provide a Twitch username to add.');
  }

  const twitchUsername = args[0];

  try {
    // Verify the Twitch user exists
    const user = await TwitchAPI.getUserByUsername(twitchUsername);
    if (!user) {
      return message.reply('Could not find that Twitch user.');
    }

    await StreamerStorage.addStreamer(twitchUsername, message.channel.id);
    return message.reply(`Successfully added ${twitchUsername} to the notification list!`);
  } catch (error) {
    console.error('Error adding streamer:', error);
    return message.reply('There was an error adding the streamer.');
  }
}

registerCommand('addstreamer', addStreamerCommand);