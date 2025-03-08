const fs = require('fs').promises;
const path = require('path');

async function ensureDirectories() {
  const dataDir = path.join(process.cwd(), 'src', 'data');
  
  try {
    await fs.mkdir(dataDir, { recursive: true });
    console.log('[Setup] Data directory ensured at:', dataDir);
  } catch (error) {
    console.error('[Setup] Error creating data directory:', error);
  }
}

module.exports = { ensureDirectories };