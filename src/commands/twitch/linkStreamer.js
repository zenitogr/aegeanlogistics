const { registerCommand } = require('../commandHandler');
const StreamerStorage = require('../../services/storage/StreamerStorage');
const TwitchAPI = require('../../services/twitch/TwitchAPI');
const { config } = require('../../config/config');

async function linkStreamerCommand(message, args) {
  if (!args.length) {
    const helpMessage = await message.reply(
      `⚠️ Incorrect usage. Command: \`${config.discord.prefix}linkstreamer <twitch_username>\`\n` +
      `Example: \`${config.discord.prefix}linkstreamer ninja\`\n` +
      `Use \`${config.discord.prefix}help linkstreamer\` for more information.`
    );
    setTimeout(() => helpMessage.delete().catch(() => {}), 10000);
    return;
  }

  const twitchUsername = args[0];
  const discordUserId = message.author.id;

  try {
    // Check if user is already linked
    const existingLink = StreamerStorage.getStreamerByDiscordId(discordUserId);
    if (existingLink) {
      const errorMessage = await message.reply(
        `You are already linked to Twitch username: ${existingLink[0]}\n` +
        `Use \`${config.discord.prefix}unlinkstreamer\` first if you want to link a different account.`
      );
      setTimeout(() => errorMessage.delete().catch(() => {}), 10000);
      return;
    }

    // Verify the Twitch user exists
    const user = await TwitchAPI.getUserByUsername(twitchUsername);
    if (!user) {
      const errorMessage = await message.reply(
        `Could not find Twitch user: ${twitchUsername}\n` +
        `Please verify the username and try again.`
      );
      setTimeout(() => errorMessage.delete().catch(() => {}), 10000);
      return;
    }

    // Check if streamer exists in our system
    const streamers = StreamerStorage.getStreamers();
    const existingStreamer = streamers.find(([username]) => username.toLowerCase() === twitchUsername.toLowerCase());

    if (existingStreamer) {
      // Link existing streamer
      await StreamerStorage.linkDiscordUser(twitchUsername, discordUserId);
      return message.reply(`Successfully linked your Discord account to Twitch username: ${twitchUsername}`);
    } else {
      // Add new streamer and link
      await StreamerStorage.addStreamer(twitchUsername, message.channel.id, discordUserId);
      return message.reply(`Successfully added and linked your Discord account to Twitch username: ${twitchUsername}`);
    }
  } catch (error) {
    console.error('Error linking streamer:', error);
    const errorMessage = await message.reply(
      'There was an error linking your Twitch account. Please try again later.'
    );
    setTimeout(() => errorMessage.delete().catch(() => {}), 10000);
  }
}

registerCommand('linkstreamer', linkStreamerCommand);
