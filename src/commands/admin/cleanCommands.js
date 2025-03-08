const BaseCommand = require('../base/BaseCommand');
const commandRegistry = require('../commandRegistry');
const { PermissionFlagsBits, REST, Routes } = require('discord.js');
const { config } = require('../../config/config');

class CleanCommandsCommand extends BaseCommand {
  constructor() {
    super({
      name: 'clean-commands',
      description: 'Removes all registered slash commands',
      usage: 'clean-commands',
      example: 'clean-commands',
      defaultMemberPermissions: PermissionFlagsBits.Administrator
    });
  }

  async executePrefix(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('You need administrator permissions to use this command.');
    }

    const statusMessage = await message.reply('Cleaning up commands...');

    try {
      const rest = new REST({ version: '10' }).setToken(config.discord.token);
      
      // Clean up guild commands
      await rest.put(
        Routes.applicationGuildCommands(message.client.user.id, message.guild.id),
        { body: [] }
      );

      // Clean up global commands
      await rest.put(
        Routes.applicationCommands(message.client.user.id),
        { body: [] }
      );

      await statusMessage.edit('✅ All commands have been cleaned up. Use `!sync-commands` to register them again.');
    } catch (error) {
      console.error('Error cleaning commands:', error);
      await statusMessage.edit('There was an error cleaning up commands.');
    }
  }

  async executeSlash(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: 'You need administrator permissions to use this command.',
        ephemeral: true
      });
    }

    await interaction.deferReply();

    try {
      const rest = new REST({ version: '10' }).setToken(config.discord.token);
      
      // Clean up guild commands
      await rest.put(
        Routes.applicationGuildCommands(interaction.client.user.id, interaction.guild.id),
        { body: [] }
      );

      // Clean up global commands
      await rest.put(
        Routes.applicationCommands(interaction.client.user.id),
        { body: [] }
      );

      await interaction.editReply('✅ All commands have been cleaned up. Use `!sync-commands` to register them again.');
    } catch (error) {
      console.error('Error cleaning commands:', error);
      await interaction.editReply('There was an error cleaning up commands.');
    }
  }
}

const cleanCommandsCommand = new CleanCommandsCommand();
commandRegistry.registerCommand(cleanCommandsCommand);

module.exports = cleanCommandsCommand;
