import type { ChatInputCommandInteraction } from 'discord.js';
import { apiService } from '../services/api.service';
import { MESSAGES } from '../types';

/**
 * Handler for trade info commands (portfolio, asset)
 */
export async function handlePortfolio(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const success = await apiService.call({ action: 'portfolio' });

  if (success) {
    await interaction.editReply(MESSAGES.PROCESSING_PORTFOLIO);
  } else {
    await interaction.editReply(MESSAGES.ERROR_GENERIC);
  }
}

export async function handleAsset(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const success = await apiService.call({ action: 'asset' });

  if (success) {
    await interaction.editReply(MESSAGES.PROCESSING_ASSET);
  } else {
    await interaction.editReply(MESSAGES.ERROR_GENERIC);
  }
}
