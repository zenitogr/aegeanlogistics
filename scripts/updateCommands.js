const fs = require('fs');
const path = require('path');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all variations of requires
  const requirePatterns = [
    /const\s+commandHandler\s*=\s*require\(['"]\.\.+\/commandHandler['"]\);/g,
    /const\s+{\s*commandHandler\s*}\s*=\s*require\(['"]\.\.+\/commandHandler['"]\);/g,
    /const\s+commandHandler\s*=\s*require\(['"]\.\.+\/commands\/commandHandler['"]\);/g
  ];

  requirePatterns.forEach(pattern => {
    content = content.replace(pattern, 'const commandRegistry = require(\'../commandRegistry\');');
  });
  
  // Replace all variations of register calls
  content = content.replace(
    /commandHandler\.registerCommand/g,
    'commandRegistry.registerCommand'
  );

  // Replace any remaining commandHandler references
  content = content.replace(
    /commandHandler\./g,
    'commandRegistry.'
  );
  
  // Fix relative paths if needed
  content = content.replace(
    /require\('\.\.\/commandRegistry'\)/g,
    (match, offset, string) => {
      // Count parent directory levels in the file path
      const levels = (filePath.match(/\//g) || []).length - 2;
      const prefix = '../'.repeat(levels);
      return `require('${prefix}commandRegistry')`;
    }
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated: ${filePath}`);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['base', 'services'].includes(file)) {
        walkDir(filePath);
      }
    } else if (
      file.endsWith('.js') && 
      !file.includes('commandRegistry.js') && 
      !file.includes('commandLoader.js') &&
      !file.includes('commandHandler.js')
    ) {
      updateFile(filePath);
    }
  });
}

const commandsDir = path.join(__dirname, '../src/commands');
console.log('Starting command files update...');
walkDir(commandsDir);
console.log('Successfully updated all command files to use commandRegistry');
