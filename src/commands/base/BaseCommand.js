class BaseCommand {
  constructor(options = {}) {
    this.name = options.name;
    this.description = options.description || 'No description provided';
    this.usage = options.usage || '';
    this.example = options.example || '';
    this.details = options.details || '';
    this.aliases = options.aliases || [];
    this.defaultMemberPermissions = options.defaultMemberPermissions;
    this.dmPermission = options.dmPermission;
    this.slashCommandOptions = options.slashCommandOptions || [];
  }

  async executeSlash(interaction) {
    throw new Error(`Command ${this.name} does not implement executeSlash`);
  }

  async executePrefix(message, args) {
    throw new Error(`Command ${this.name} does not implement executePrefix`);
  }

  async deferredReply(interaction, callback) {
    await interaction.deferReply();
    return callback();
  }

  async loadingReply(message, loadingText, callback) {
    const loadingMsg = await message.reply(loadingText);
    try {
      const result = await callback();
      await loadingMsg.delete().catch(() => {});
      return result;
    } catch (error) {
      await loadingMsg.delete().catch(() => {});
      throw error;
    }
  }

  async checkPermissions(member) {
    return true; // Override in specific commands to add permission checks
  }
}

module.exports = BaseCommand;
