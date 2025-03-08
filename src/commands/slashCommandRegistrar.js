const { REST, Routes } = require('discord.js');
const { config } = require('../config/config');

class SlashCommandRegistrar {
  constructor(client) {
    this.client = client;
    this.rest = new REST({ version: '10' }).setToken(config.discord.token);
  }

  async registerSlashCommands(commands, guildId) {
    try {
      console.log('Started refreshing application (/) commands.');

      const slashCommands = commands.map(command => ({
        name: command.name,
        description: command.description,
        options: command.slashCommandOptions || [],
        default_member_permissions: command.defaultMemberPermissions?.toString() || undefined,
        dm_permission: command.dmPermission ?? false
      }));

      console.log(`Registering ${slashCommands.length} commands for guild ${guildId}:`, 
        slashCommands.map(cmd => cmd.name).join(', '));

      // Register commands for specific guild instead of globally
      const result = await this.rest.put(
        Routes.applicationGuildCommands(this.client.user.id, guildId),
        { body: slashCommands }
      );

      console.log('Successfully reloaded application (/) commands.');
      return result;
    } catch (error) {
      console.error('Error registering slash commands:', error);
      throw error;
    }
  }
}

module.exports = SlashCommandRegistrar;
