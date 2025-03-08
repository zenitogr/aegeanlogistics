const { EmbedBuilder } = require('discord.js');
const { registerCommand } = require('../commandHandler');
const { config } = require('../../config/config');

const commandHelp = {
  help: {
    description: 'Shows command help',
    shortDescription: 'Show help',
    usage: 'help [command] [-v]',
    example: 'help linkstreamer -v',
    details: 'Use -v flag for detailed information. You can also get help for a specific command.'
  },
  linkstreamer: {
    description: 'Links your Discord account to your Twitch username for stream notifications',
    shortDescription: 'Link Twitch account',
    usage: 'linkstreamer <twitch_username>',
    example: 'linkstreamer ninja',
    details: 'This command will associate your Discord account with your Twitch username. When you go live, the bot will notify the server.'
  },
  unlinkstreamer: {
    description: 'Removes the link between your Discord and Twitch accounts',
    shortDescription: 'Unlink Twitch account',
    usage: 'unlinkstreamer',
    example: 'unlinkstreamer',
    details: 'This will stop stream notifications for your Twitch account.'
  },
  addstreamer: {
    description: 'Add a Twitch streamer to the notification list (Admin only)',
    shortDescription: 'Add streamer to watch',
    usage: 'addstreamer <twitch_username>',
    example: 'addstreamer ninja',
    details: 'Administrators can use this to add any Twitch streamer to the notification list, even if they\'re not in the Discord server.'
  },
  removestreamer: {
    description: 'Remove a Twitch streamer from notifications (Admin only)',
    shortDescription: 'Remove streamer',
    usage: 'removestreamer <twitch_username>',
    example: 'removestreamer ninja',
    details: 'Administrators can remove any streamer from the notification list.'
  },
  streamers: {
    description: 'Shows all monitored Twitch streamers',
    shortDescription: 'List streamers',
    usage: 'streamers',
    example: 'streamers',
    details: 'Displays a list of all Twitch streamers currently being monitored for stream notifications.'
  }
};

async function helpCommand(message, args) {
  const prefix = config.discord.prefix;
  const isVerbose = args.includes('-v');
  
  // Remove -v from args if present
  const filteredArgs = args.filter(arg => arg !== '-v');
  
  // If a specific command was asked for
  if (filteredArgs.length > 0) {
    const commandName = filteredArgs[0].toLowerCase();
    const command = commandHelp[commandName];
    
    if (command) {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Help: ${commandName}`)
        .addFields(
          { name: 'Description', value: command.description },
          { name: 'Usage', value: `${prefix}${command.usage}` },
          { name: 'Example', value: `${prefix}${command.example}` }
        );

      // Add details if verbose mode
      if (isVerbose && command.details) {
        embed.addFields({ name: 'Additional Details', value: command.details });
      }
      
      return message.reply({ embeds: [embed] });
    } else {
      const errorMessage = await message.reply(
        `Command "${commandName}" not found. Use \`${prefix}help\` to see all commands.`
      );
      setTimeout(() => errorMessage.delete().catch(() => {}), 10000);
      return;
    }
  }

  // Show all commands
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('ALC Bot Commands')
    .setDescription(
      isVerbose 
        ? `Use \`${prefix}help <command>\` for detailed information about a command.\nUse \`${prefix}help -v\` for verbose help.`
        : `Use \`${prefix}help <command>\` or \`${prefix}help -v\` for more details.`
    );

  // Add fields based on verbosity
  const fields = Object.entries(commandHelp).map(([name, info]) => ({
    name: `${prefix}${name}`,
    value: isVerbose ? info.description : info.shortDescription
  }));

  if (isVerbose) {
    embed.addFields(
      { name: 'Command Format', value: 'All commands start with the prefix: ' + prefix },
      { name: 'Need More Help?', value: 'Use `-v` with any help command for additional details.' }
    );
  }

  embed.addFields(fields);

  return message.reply({ embeds: [embed] });
}

registerCommand('help', helpCommand);
