import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  botToken: process.env.BOT_TOKEN!,
  clientId: process.env.CLIENT_ID!,
  webhookUrl: process.env.N8N_WEBHOOK_URL!,
  orderWebhookUrl: process.env.N8N_ORDER_WEBHOOK_URL!,
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
  const simpleCommands = Object.entries(COMMANDS).map(([name, { description }]) =>
    new SlashCommandBuilder()
      .setName(name)
      .setDescription(description)
      .toJSON()
  );

  // Lệnh đặt lệnh mua/bán cổ phiếu
  const orderCommand = new SlashCommandBuilder()
    .setName('mbs-order-stock')
    .setDescription('��📉 Đặt lệnh MUA/BÁN cổ phiếu MBS')
    .addStringOption(option =>
      option.setName('side')
        .setDescription('Loại lệnh: MUA hoặc BÁN')
        .setRequired(true)
        .addChoices(
          { name: '📈 MUA', value: 'BUY' },
          { name: '📉 BÁN', value: 'SELL' }
        ))
    .addStringOption(option =>
      option.setName('symbol')
        .setDescription('Mã cổ phiếu (VD: SSI, VNM, FPT)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('quantity')
        .setDescription('Số lượng cổ phiếu (tối thiểu 10)')
        .setRequired(true)
        .setMinValue(10))
    .addNumberOption(option =>
      option.setName('price')
        .setDescription('Giá (nghìn đồng, VD: 32.5 = 32,500đ)')
        .setRequired(true)
        .setMinValue(0.1))
    .addStringOption(option =>
      option.setName('otp_code')
        .setDescription('Mã Smart OTP 6 số từ app MBS')
        .setRequired(true)
        .setMinLength(6)
        .setMaxLength(6))
    .toJSON();

  const allCommands = [...simpleCommands, orderCommand];

  const rest = new REST({ version: '10' }).setToken(config.botToken);

  try {
    console.log('📝 Đang đăng ký slash commands...');
    await rest.put(Routes.applicationCommands(config.clientId), { body: allCommands });
    console.log(`✅ Đã đăng ký: ${[...Object.keys(COMMANDS), 'mbs-order-stock'].map(c => '/' + c).join(', ')}`);
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

  // Handle order stock command
  if (commandName === 'mbs-order-stock') {
    await handleOrderStock(interaction);
    return;
  }

  // Handle simple commands
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

async function handleOrderStock(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const side = interaction.options.getString('side', true);
  const symbol = interaction.options.getString('symbol', true).toUpperCase();
  const quantity = interaction.options.getInteger('quantity', true);
  const price = interaction.options.getNumber('price', true);
  const otpCode = interaction.options.getString('otp_code', true);

  const sideLabel = side === 'BUY' ? 'MUA' : 'BÁN';
  const emoji = side === 'BUY' ? '📈' : '📉';

  try {
    const url = `${config.orderWebhookUrl}?side=${side}&symbol=${symbol}&quantity=${quantity}&price=${price}&otpCode=${otpCode}`;
    console.log(`${emoji} Order: ${sideLabel} ${symbol} x${quantity} @ ${price}k`);

    const response = await fetch(url);

    if (response.ok) {
      await interaction.editReply(`⏳ Đang xử lý lệnh ${sideLabel} ${quantity} ${symbol} @ ${price}k...`);
    } else {
      await interaction.editReply('❌ Có lỗi khi gửi lệnh. Vui lòng thử lại.');
    }
  } catch (error) {
    console.error('Order Error:', error);
    await interaction.editReply('❌ Không thể kết nối đến server.');
  }
}

client.login(config.botToken);
