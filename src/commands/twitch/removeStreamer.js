const { registerCommand } = require('../commandHandler');
const StreamerStorage = require('../../services/storage/StreamerStorage');
const { config } = require('../../config/config');

async function removeStreamerCommand(message, args) {
  // Check if user has admin permissions
  if (!message.member.permissions.has('ADMINISTRATOR')) {
    const errorMessage = await message.reply('You need administrator permissions to use this command.');
    setTimeout(() => errorMessage.delete().catch(() => {}), 10000);
    return;
  }

  if (!args.length) {
    const helpMessage = await message.reply(
      `⚠️ Incorrect usage. Command: \`${config.discord.prefix}removestreamer <twitch_username>\`\n` +
      `Example: \`${config.discord.prefix}removestreamer ninja\`\n` +
      `Use \`${config.discord.prefix}help removestreamer\` for more information.`
    );
    setTimeout(() => helpMessage.delete().catch(() => {}), 10000);
    return;
  }

  const twitchUsername = args[0];

  try {
    const removed = await StreamerStorage.removeStreamer(twitchUsername);
    if (removed) {
      return message.reply(`Successfully removed ${twitchUsername} from the notification list!`);
    } else {
      const errorMessage = await message.reply(
        `${twitchUsername} was not found in the notification list.\n` +
        `Use \`${config.discord.prefix}streamers\` to see all monitored streamers.`
      );
      setTimeout(() => errorMessage.delete().catch(() => {}), 10000);
    }
  } catch (error) {
    console.error('Error removing streamer:', error);
    const errorMessage = await message.reply(
      'There was an error removing the streamer. Please try again later.'
    );
    setTimeout(() => errorMessage.delete().catch(() => {}), 10000);
  }
}

registerCommand('removestreamer', removeStreamerCommand);
