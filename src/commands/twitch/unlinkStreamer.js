const { registerCommand } = require('../commandHandler');
const StreamerStorage = require('../../services/storage/StreamerStorage');

async function unlinkStreamerCommand(message) {
  const discordUserId = message.author.id;

  try {
    const existingLink = StreamerStorage.getStreamerByDiscordId(discordUserId);
    if (!existingLink) {
      return message.reply('You don\'t have any linked Twitch account.');
    }

    const [twitchUsername] = existingLink;
    await StreamerStorage.unlinkDiscordUser(twitchUsername);
    return message.reply(`Successfully unlinked your Discord account from Twitch username: ${twitchUsername}`);
  } catch (error) {
    console.error('Error unlinking streamer:', error);
    return message.reply('There was an error unlinking your Twitch account.');
  }
}

registerCommand('unlinkstreamer', unlinkStreamerCommand);