const { Collection } = require('discord.js');

class CommandRegistry {
  constructor() {
    this.commands = new Collection();
    this.aliases = new Collection();
    this.initialized = false;
  }

  registerCommand(command) {
    if (!command || !command.name) {
      console.error('Invalid command registration attempt:', command);
      return;
    }
    
    if (this.commands.has(command.name)) {
      console.log(`Command already registered: ${command.name}`);
      return;
    }
    
    console.log(`Registering command: ${command.name}`);
    this.commands.set(command.name, command);

    // Register aliases if they exist
    if (command.aliases && Array.isArray(command.aliases)) {
      command.aliases.forEach(alias => {
        console.log(`Registering alias: ${alias} for command: ${command.name}`);
        this.aliases.set(alias, command.name);
      });
    }
  }

  getCommands() {
    return this.commands;
  }

  getCommand(name) {
    let command = this.commands.get(name);
    if (!command) {
      // Check aliases if command not found
      const aliasedName = this.aliases.get(name);
      if (aliasedName) {
        command = this.commands.get(aliasedName);
      }
    }
    
    if (!command) {
      console.log(`Command not found: ${name}`);
      console.log('Available commands:', Array.from(this.commands.keys()));
      console.log('Available aliases:', Array.from(this.aliases.keys()));
    }
    return command;
  }
}

module.exports = new CommandRegistry();
