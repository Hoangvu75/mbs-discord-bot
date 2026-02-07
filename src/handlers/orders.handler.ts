import type { ChatInputCommandInteraction } from 'discord.js';
import { apiService } from '../services/api.service';
import { MESSAGES } from '../types';

/**
 * Handler for orders list command
 */
export async function handleOrders(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  console.log('📋 Getting orders list');

  const success = await apiService.call({ action: 'orders-status' });

  if (success) {
    await interaction.editReply(MESSAGES.PROCESSING_ORDERS);
  } else {
    await interaction.editReply(MESSAGES.ERROR_GENERIC);
  }
}
