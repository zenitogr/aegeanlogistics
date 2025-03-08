const BaseCommand = require('../base/BaseCommand');
const commandRegistry = require('../commandRegistry');
const { PermissionFlagsBits } = require('discord.js');
const SlashCommandRegistrar = require('../../services/discord/SlashCommandRegistrar');

class SyncCommandsCommand extends BaseCommand {
  constructor() {
    super({
      name: 'sync-commands',
      description: 'Synchronizes slash commands with Discord (Admin only)',
      usage: 'sync-commands',
      example: 'sync-commands',
      defaultMemberPermissions: PermissionFlagsBits.Administrator,
      details: 'This command will register all available slash commands with Discord. Only administrators can use this command.'
    });
  }

  async checkPermissions(member) {
    return member.permissions.has(PermissionFlagsBits.Administrator);
  }

  async executeSync(client, guildId) {
    const registrar = new SlashCommandRegistrar(client);
    const commands = Array.from(commandRegistry.getCommands().values());
    console.log('Starting command sync with commands:', commands.map(cmd => cmd.name));
    const result = await registrar.registerSlashCommands(commands, guildId);
    return { total: commands.length, registered: result.length };
  }

  async executeSlash(interaction) {
    return this.deferredReply(interaction, async () => {
      if (!await this.checkPermissions(interaction.member)) {
        return interaction.editReply({
          content: 'You need administrator permissions to use this command.',
          ephemeral: true
        });
      }

      try {
        const result = await this.executeSync(interaction.client, interaction.guildId);
        await interaction.editReply(`✅ Successfully synchronized ${result.registered} commands for this server.`);
      } catch (error) {
        console.error('Error syncing commands:', error);
        await interaction.editReply('There was an error synchronizing commands. Please check the console for details.');
      }
    });
  }

  async executePrefix(message) {
    if (!await this.checkPermissions(message.member)) {
      return message.reply('You need administrator permissions to use this command.');
    }

    const statusMessage = await message.reply('Synchronizing commands...');

    try {
      const result = await this.executeSync(message.client, message.guildId);
      await statusMessage.edit(`✅ Successfully synchronized ${result.registered} commands for this server.`);
    } catch (error) {
      console.error('Error syncing commands:', error);
      await statusMessage.edit('There was an error synchronizing commands. Please check the console for details.');
    }
  }
}

const syncCommandsCommand = new SyncCommandsCommand();
commandRegistry.registerCommand(syncCommandsCommand);

module.exports = syncCommandsCommand;
