import type { ChatInputCommandInteraction } from 'discord.js';
import { apiService } from '../services/api.service';
import { MESSAGES } from '../types';

/**
 * Handler for set OTP command
 */
export async function handleSetOtp(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const otpCode = interaction.options.getString('otp_code', true);

  console.log(`🔐 Set OTP: ${otpCode.substring(0, 2)}****`);

  const success = await apiService.call({
    action: 'set-otp',
    otpCode,
  });

  if (success) {
    await interaction.editReply(MESSAGES.PROCESSING_OTP);
  } else {
    await interaction.editReply(MESSAGES.ERROR_CONNECTION);
  }
}
