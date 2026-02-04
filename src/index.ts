import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import config, { validateConfig } from './config';
import { allCommands, COMMAND_NAMES } from './commands';
import {
  handlePortfolio,
  handleAsset,
  handleOrder,
  handleCancel,
  handleSetOtp,
  handleOrders,
  handleLogin,
} from './handlers';

// Validate environment variables
validateConfig();

// Initialize Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Register slash commands
async function registerCommands(): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(config.botToken);

  try {
    console.log('📝 Đang đăng ký slash commands...');
    await rest.put(Routes.applicationCommands(config.clientId), { body: allCommands });
    console.log('✅ Đã đăng ký tất cả commands!');
  } catch (error) {
    console.error('❌ Lỗi đăng ký commands:', error);
  }
}

// Bot ready event
client.once('ready', async () => {
  console.log(`✅ Bot đã sẵn sàng! Logged in as ${client.user?.tag}`);
  await registerCommands();
});

// Command router - follows Single Responsibility Principle
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case COMMAND_NAMES.PORTFOLIO:
        await handlePortfolio(interaction);
        break;
      case COMMAND_NAMES.ASSET:
        await handleAsset(interaction);
        break;
      case COMMAND_NAMES.SET_OTP:
        await handleSetOtp(interaction);
        break;
      case COMMAND_NAMES.LOGIN:
        await handleLogin(interaction);
        break;
      case COMMAND_NAMES.ORDER:
        await handleOrder(interaction);
        break;
      case COMMAND_NAMES.CANCEL:
        await handleCancel(interaction);
        break;
      case COMMAND_NAMES.ORDERS:
        await handleOrders(interaction);
        break;
      default:
        console.warn(`Unknown command: ${commandName}`);
    }
  } catch (error) {
    console.error(`Error handling command ${commandName}:`, error);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply('❌ Đã xảy ra lỗi.');
    }
  }
});

// Start the bot
client.login(config.botToken);

