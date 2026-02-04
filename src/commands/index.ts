import { SlashCommandBuilder } from 'discord.js';

/**
 * Command Definitions - Central place for all slash commands
 * Follows Open/Closed Principle - easy to add new commands
 */

// Simple commands (no options)
export const portfolioCommand = new SlashCommandBuilder()
  .setName('mbs-portfolio')
  .setDescription('📊 Lấy báo cáo danh mục cổ phiếu');

export const assetCommand = new SlashCommandBuilder()
  .setName('mbs-asset')
  .setDescription('💰 Lấy thông tin tài sản');

// Set OTP command
export const setOtpCommand = new SlashCommandBuilder()
  .setName('mbs-set-otp')
  .setDescription('🔐 Lưu mã OTP để sử dụng cho các lệnh sau')
  .addStringOption(option =>
    option
      .setName('otp_code')
      .setDescription('Mã Smart OTP 6 số từ app MBS')
      .setRequired(true)
      .setMinLength(6)
      .setMaxLength(6)
  );

// Login command
export const loginCommand = new SlashCommandBuilder()
  .setName('mbs-login')
  .setDescription('🔑 Đăng nhập tài khoản MBS')
  .addStringOption(option =>
    option
      .setName('username')
      .setDescription('Tên đăng nhập MBS (VD: HH0357)')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('password')
      .setDescription('Mật khẩu MBS')
      .setRequired(true)
  );

// Order command (buy/sell)
export const orderCommand = new SlashCommandBuilder()
  .setName('mbs-order')
  .setDescription('📈📉 Đặt lệnh MUA/BÁN cổ phiếu')
  .addStringOption(option =>
    option
      .setName('side')
      .setDescription('Loại lệnh')
      .setRequired(true)
      .addChoices(
        { name: '📈 MUA', value: 'BUY' },
        { name: '📉 BÁN', value: 'SELL' }
      )
  )
  .addStringOption(option =>
    option
      .setName('symbol')
      .setDescription('Mã cổ phiếu (VD: SSI, VNM, FPT)')
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option
      .setName('quantity')
      .setDescription('Số lượng (tối thiểu 10)')
      .setRequired(true)
      .setMinValue(10)
  )
  .addNumberOption(option =>
    option
      .setName('price')
      .setDescription('Giá (nghìn đồng, VD: 32.5 = 32,500đ)')
      .setRequired(true)
      .setMinValue(0.1)
  )
  .addStringOption(option =>
    option
      .setName('otp_code')
      .setDescription('Mã OTP (để trống nếu đã set trước)')
      .setRequired(false)
      .setMinLength(6)
      .setMaxLength(6)
  );

// Cancel order command
export const cancelCommand = new SlashCommandBuilder()
  .setName('mbs-cancel')
  .setDescription('🚫 Hủy lệnh đang chờ')
  .addStringOption(option =>
    option
      .setName('trans_id')
      .setDescription('Transaction ID của lệnh cần hủy')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('otp_code')
      .setDescription('Mã OTP (để trống nếu đã set trước)')
      .setRequired(false)
      .setMinLength(6)
      .setMaxLength(6)
  );

// Orders list command
export const ordersCommand = new SlashCommandBuilder()
  .setName('mbs-orders')
  .setDescription('📋 Xem sổ lệnh (chờ khớp/đã hủy)');

// Export all commands as array for registration
export const allCommands = [
  portfolioCommand,
  assetCommand,
  setOtpCommand,
  loginCommand,
  orderCommand,
  cancelCommand,
  ordersCommand,
].map(cmd => cmd.toJSON());

// Command names for handler routing
export const COMMAND_NAMES = {
  PORTFOLIO: 'mbs-portfolio',
  ASSET: 'mbs-asset',
  SET_OTP: 'mbs-set-otp',
  LOGIN: 'mbs-login',
  ORDER: 'mbs-order',
  CANCEL: 'mbs-cancel',
  ORDERS: 'mbs-orders',
} as const;

