import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  botToken: process.env.BOT_TOKEN!,
  clientId: process.env.CLIENT_ID!,
  webhookUrl: process.env.N8N_WEBHOOK_URL!,
};

if (!config.botToken || !config.clientId || !config.webhookUrl) {
  console.error('❌ Missing environment variables. Check .env file.');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Command definitions - dễ mở rộng sau này
const COMMANDS = {
  'mbs-trade-info-portfolio': { type: 'portfolio', description: '📊 Lấy báo cáo danh mục cổ phiếu' },
  'mbs-trade-info-asset': { type: 'asset', description: '💰 Lấy thông tin tài sản' },
};

async function registerCommands(): Promise<void> {
  const commands = Object.entries(COMMANDS).map(([name, { description }]) =>
    new SlashCommandBuilder()
      .setName(name)
      .setDescription(description)
      .toJSON()
  );

  const rest = new REST({ version: '10' }).setToken(config.botToken);

  try {
    console.log('📝 Đang đăng ký slash commands...');
    await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
    console.log(`✅ Đã đăng ký: ${Object.keys(COMMANDS).map(c => '/' + c).join(', ')}`);
  } catch (error) {
    console.error('❌ Lỗi đăng ký commands:', error);
  }
}

client.once('ready', async () => {
  console.log(`✅ Bot đã sẵn sàng! Logged in as ${client.user?.tag}`);
  await registerCommands();
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  const command = COMMANDS[commandName as keyof typeof COMMANDS];

  if (command) {
    await handleRequest(interaction, command.type);
  }
});

async function handleRequest(interaction: ChatInputCommandInteraction, type: string): Promise<void> {
  await interaction.deferReply();

  try {
    const url = `${config.webhookUrl}?type=${type}`;
    console.log(`📡 Calling: ${url}`);

    const response = await fetch(url);

    if (response.ok) {
      const messages: Record<string, string> = {
        'portfolio': '✅ Báo cáo danh mục đã được gửi!',
        'asset': '✅ Thông tin tài sản đã được gửi!',
      };
      await interaction.editReply(messages[type] || '✅ Đã gửi!');
    } else {
      await interaction.editReply('❌ Có lỗi. Vui lòng thử lại.');
    }
  } catch (error) {
    console.error('Error:', error);
    await interaction.editReply('❌ Không thể kết nối đến server.');
  }
}

client.login(config.botToken);
