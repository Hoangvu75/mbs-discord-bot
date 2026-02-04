import type { ChatInputCommandInteraction } from 'discord.js';
import { apiService } from '../services/api.service';

/**
 * Handler for login command - stores MBS credentials in Redis
 */
export async function handleLogin(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ ephemeral: true }); // Ephemeral to hide credentials

  const username = interaction.options.getString('username', true).toUpperCase();
  const password = interaction.options.getString('password', true);

  console.log(`🔐 Login attempt for: ${username}`);

  const success = await apiService.call({
    action: 'login',
    username,
    password,
  });

  if (success) {
    await interaction.editReply(`✅ Đang xử lý đăng nhập cho tài khoản **${username}**...`);
  } else {
    await interaction.editReply('❌ Không thể kết nối đến server.');
  }
}
