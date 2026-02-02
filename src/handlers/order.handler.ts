import type { ChatInputCommandInteraction } from 'discord.js';
import { apiService } from '../services/api.service';
import { MESSAGES, type OrderSide } from '../types';

/**
 * Handler for order command (buy/sell)
 */
export async function handleOrder(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const side = interaction.options.getString('side', true) as OrderSide;
  const symbol = interaction.options.getString('symbol', true).toUpperCase();
  const quantity = interaction.options.getInteger('quantity', true);
  const price = interaction.options.getNumber('price', true);
  const otpCode = interaction.options.getString('otp_code') || undefined;

  const sideLabel = side === 'BUY' ? 'MUA' : 'BÁN';
  console.log(`📊 Order: ${sideLabel} ${symbol} x${quantity} @ ${price}k`);

  const success = await apiService.call({
    action: 'order',
    side,
    symbol,
    quantity,
    price,
    otpCode,
  });

  if (success) {
    await interaction.editReply(MESSAGES.PROCESSING_ORDER(sideLabel, quantity, symbol, price));
  } else {
    await interaction.editReply(MESSAGES.ERROR_CONNECTION);
  }
}
