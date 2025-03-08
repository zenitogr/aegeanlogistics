const fs = require('fs');
const path = require('path');
const commandRegistry = require('./commandRegistry');

function loadCommands() {
  // Clear existing commands from the registry
  commandRegistry.commands.clear();
  
  const commandsPath = path.join(__dirname);
  
  function loadCommandsRecursive(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip the base directory and services
        if (file !== 'base' && file !== 'services') {
          loadCommandsRecursive(filePath);
        }
      } else if (file.endsWith('.js') && 
                !file.includes('commandLoader.js') && 
                !file.includes('commandHandler.js') &&
                !file.includes('commandRegistry.js')) {
        try {
          const relativePath = path.relative(__dirname, filePath);
          console.log(`Loading command from: ${relativePath}`);
          
          // Clear require cache to ensure fresh load
          delete require.cache[require.resolve(filePath)];
          
          // Load the command module
          require(filePath);
          
        } catch (error) {
          console.error(`Error loading command from ${filePath}:`, error);
        }
      }
    }
  }

  loadCommandsRecursive(commandsPath);
  
  // Log loaded commands
  console.log('Total commands loaded:', commandRegistry.commands.size);
  console.log('Registered commands:', Array.from(commandRegistry.commands.keys()));
}

module.exports = { loadCommands };
