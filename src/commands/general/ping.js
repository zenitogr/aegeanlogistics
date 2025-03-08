const BaseCommand = require('../base/BaseCommand');
const commandRegistry = require('../commandRegistry');

class PingCommand extends BaseCommand {
  constructor() {
    super({
      name: 'ping',
      description: 'Replies with Pong!',
      usage: 'ping',
      example: 'ping'
    });
  }

  async executeSlash(interaction) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);
    
    await interaction.editReply(`🏓 Pong!\n⏱️ Bot Latency: ${latency}ms\n📡 API Latency: ${apiLatency}ms`);
  }

  async executePrefix(message) {
    // First message
    const sent1 = await message.channel.send('Pinging...');
    
    // Second message
    const sent2 = await message.channel.send('Calculating...');
    
    const latency = sent2.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(message.client.ws.ping);
    
    // Update both messages
    await sent1.edit('🏓 Pong!');
    await sent2.edit(`⏱️ Bot Latency: ${latency}ms\n📡 API Latency: ${apiLatency}ms`);
  }
}

const pingCommand = new PingCommand();
commandRegistry.registerCommand(pingCommand);

module.exports = pingCommand;
