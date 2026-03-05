/**
 * Deploy slash commands to Discord
 *
 * Usage:
 *   pnpm deploy
 *   pnpm deploy -- --guild-id 123456789012345678
 *
 * Environment:
 *   DISCORD_TOKEN (required)
 *   DISCORD_CLIENT_ID (required, fallback: CLIENT_ID)
 */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenvConfig } from 'dotenv';
import { error as logError } from './logger.js';
import { loadCommandsFromDirectory } from './utils/loadCommands.js';
import { registerCommands } from './utils/registerCommands.js';

dotenvConfig();

const __dirname = dirname(fileURLToPath(import.meta.url));

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID;

function getGuildIdFromArgs(argv) {
  const guildIdFlag = '--guild-id';
  const guildIdFlagWithValue = '--guild-id=';

  const inlineFlag = argv.find((arg) => arg.startsWith(guildIdFlagWithValue));
  if (inlineFlag) {
    const value = inlineFlag.slice(guildIdFlagWithValue.length).trim();
    if (!value) {
      throw new Error('--guild-id requires a value');
    }
    return value;
  }

  const flagIndex = argv.indexOf(guildIdFlag);
  if (flagIndex === -1) {
    return null;
  }

  const value = argv[flagIndex + 1]?.trim();
  if (!value || value.startsWith('-')) {
    throw new Error('--guild-id requires a value');
  }

  return value;
}

if (!token) {
  logError('DISCORD_TOKEN is required');
  process.exit(1);
}

if (!clientId) {
  logError('DISCORD_CLIENT_ID (or legacy CLIENT_ID) is required');
  process.exit(1);
}

async function loadCommands() {
  return loadCommandsFromDirectory({
    commandsPath: join(__dirname, 'commands'),
    logLoaded: false,
  });
}

async function main() {
  const guildId = getGuildIdFromArgs(process.argv.slice(2));
  const commands = await loadCommands();
  await registerCommands(commands, clientId, token, guildId);
}

main().catch((err) => {
  logError('Command deployment failed', { error: err.message, stack: err.stack });
  process.exit(1);
});
