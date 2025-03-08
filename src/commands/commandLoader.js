const fs = require('fs');
const path = require('path');

function loadCommands() {
  const commandFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.js') 
    && file !== 'commandLoader.js' 
    && file !== 'commandHandler.js');

  for (const file of commandFiles) {
    require(path.join(__dirname, file));
  }
}

module.exports = { loadCommands };