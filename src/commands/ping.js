const { registerCommand } = require('./commandHandler');

function pingCommand(message) {
  return message.reply('Pong!');
}

registerCommand('ping', pingCommand);