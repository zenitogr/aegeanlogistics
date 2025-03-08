const { ready } = require('./ready');
const { messageCreate } = require('./messageCreate');

function loadEvents(client) {
  client.once('ready', ready);
  client.on('messageCreate', messageCreate);
}

module.exports = { loadEvents };