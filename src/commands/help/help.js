const { EmbedBuilder } = require('discord.js');
const BaseCommand = require('../base/BaseCommand');
const commandRegistry = require('../commandRegistry');
const { config } = require('../../config/config');

class HelpCommand extends BaseCommand {
  constructor() {
    super({
      name: 'help',
      description: 'Shows command help',
      usage: 'help [command] [-v]',
      example: 'help linkstreamer -v',
      slashCommandOptions: [
        {
          name: 'command',
          description: 'Specific command to get help for',
          type: 3, // STRING
          required: false
        },
        {
          name: 'verbose',
          description: 'Show detailed information',
          type: 5, // BOOLEAN
          required: false
        }
      ]
    });
  }

  async executeSlash(interaction) {
    const commandName = interaction.options.getString('command');
    const isVerbose = interaction.options.getBoolean('verbose') ?? false;
    
    const embed = await this.generateHelpEmbed(commandName, isVerbose);
    return interaction.reply({ 
      content: '📚 **ALC Bot Help System**',
      embeds: [embed],
      ephemeral: true 
    });
  }

  async executePrefix(message, args) {
    const isVerbose = args.includes('-v');
    const filteredArgs = args.filter(arg => arg !== '-v');
    const commandName = filteredArgs[0];
    
    const embed = await this.generateHelpEmbed(commandName, isVerbose);
    return message.reply({ 
      content: '📚 **ALC Bot Help System**',
      embeds: [embed]
    });
  }

  async generateHelpEmbed(commandName, isVerbose) {
    const prefix = config.discord.prefix;
    
    if (commandName) {
      const command = commandRegistry.getCommands().get(commandName);
      if (!command) {
        return new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('Command Not Found')
          .setDescription(`The command \`${commandName}\` does not exist.\nUse \`${prefix}help\` to see all available commands.`);
      }

      return new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Command: ${commandName}`)
        .addFields(
          { name: 'Description', value: command.description },
          { name: 'Usage', value: `${prefix}${command.usage}` },
          { name: 'Example', value: `${prefix}${command.example}` }
        )
        .setFooter({ text: isVerbose && command.details ? command.details : 'Use -v flag for more details' });
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Available Commands')
      .setDescription(`Use \`${prefix}help <command>\` for detailed information about a specific command.\nUse \`${prefix}help -v\` for verbose help.`);

    // Group commands by category
    const categories = new Map();
    for (const [name, cmd] of commandRegistry.getCommands()) {
      const category = cmd.category || 'General';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category).push({
        name,
        description: isVerbose ? cmd.description : cmd.description.split('\n')[0]
      });
    }

    // Add fields for each category
    for (const [category, commands] of categories) {
      embed.addFields({
        name: category,
        value: commands.map(cmd => 
          `\`${prefix}${cmd.name}\` - ${cmd.description}`
        ).join('\n')
      });
    }

    return embed;
  }


}

const helpCommand = new HelpCommand();
commandRegistry.registerCommand(helpCommand);

module.exports = helpCommand;
