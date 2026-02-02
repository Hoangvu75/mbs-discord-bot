import type { ChatInputCommandInteraction } from 'discord.js';
import { apiService } from '../services/api.service';
import { MESSAGES } from '../types';

/**
 * Handler for cancel order command
 */
export async function handleCancel(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const transId = interaction.options.getString('trans_id', true);
  const otpCode = interaction.options.getString('otp_code') || undefined;

  console.log(`🚫 Cancel: ${transId}`);

  const success = await apiService.call({
    action: 'cancel',
    transId,
    otpCode,
  });

  if (success) {
    await interaction.editReply(MESSAGES.PROCESSING_CANCEL(transId));
  } else {
    await interaction.editReply(MESSAGES.ERROR_CONNECTION);
  }
}
