const { messageCreate } = require('./messageCreate');
const { interactionCreate } = require('./interactionCreate');
const { ready } = require('./ready');

function loadEvents(client) {
  // Debug current listeners
  console.log('Current messageCreate listeners:', client.listenerCount('messageCreate'));
  
  // Remove any existing listeners
  client.removeAllListeners('messageCreate');
  client.removeAllListeners('interactionCreate');
  client.removeAllListeners('ready');

  // Add event listeners
  client.on('messageCreate', messageCreate);
  client.on('interactionCreate', interactionCreate);
  client.once('ready', ready);

  // Debug after adding listeners
  console.log('New messageCreate listeners:', client.listenerCount('messageCreate'));
  
  console.log('Events loaded successfully');
}

module.exports = { loadEvents };
