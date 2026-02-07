import type { ChatInputCommandInteraction } from 'discord.js';
import { apiService } from '../services/api.service';
import { MESSAGES } from '../types';

/**
 * Handler for cancel order command - gọi n8n webhook cancel-order
 * Nếu có otp_code: gọi set-otp trước (workflow lấy OTP từ Redis)
 */
export async function handleCancel(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const transId = interaction.options.getString('trans_id', true);
  const otpCode = interaction.options.getString('otp_code') || undefined;

  console.log(`🚫 Cancel: ${transId}`);

  if (otpCode) {
    const otpOk = await apiService.call({ action: 'set-otp', otp: otpCode });
    if (!otpOk) {
      await interaction.editReply(MESSAGES.ERROR_CONNECTION);
      return;
    }
  }

  const success = await apiService.call({
    action: 'cancel-order',
    transId,
  });

  if (success) {
    await interaction.editReply(MESSAGES.PROCESSING_CANCEL(transId));
  } else {
    await interaction.editReply(MESSAGES.ERROR_CONNECTION);
  }
}
