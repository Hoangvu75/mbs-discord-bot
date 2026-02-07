import type { ChatInputCommandInteraction } from 'discord.js';
import { apiService } from '../services/api.service';
import { MESSAGES, type OrderSide } from '../types';

/**
 * Handler for order command (buy/sell) - gọi n8n webhook order-buy/order-sell
 * Nếu có otp_code: gọi set-otp trước rồi mới order (workflow lấy OTP từ Redis)
 */
export async function handleOrder(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const side = interaction.options.getString('side', true) as OrderSide;
  const symbol = interaction.options.getString('symbol', true).toUpperCase();
  const quantity = interaction.options.getInteger('quantity', true);
  const price = interaction.options.getNumber('price', true);
  const otpCode = interaction.options.getString('otp_code') || undefined;

  const sideLabel = side === 'BUY' ? 'MUA' : 'BÁN';
  const action = side === 'BUY' ? 'order-buy' : 'order-sell';
  console.log(`📊 Order: ${sideLabel} ${symbol} x${quantity} @ ${price}k`);

  // Nếu có OTP: set trước (workflow Get cached OTP lấy từ Redis)
  if (otpCode) {
    const otpOk = await apiService.call({ action: 'set-otp', otp: otpCode });
    if (!otpOk) {
      await interaction.editReply(MESSAGES.ERROR_CONNECTION);
      return;
    }
  }

  const success = await apiService.call({
    action,
    symbol,
    orderQty: quantity,
    price,
  });

  if (success) {
    await interaction.editReply(MESSAGES.PROCESSING_ORDER(sideLabel, quantity, symbol, price));
  } else {
    await interaction.editReply(MESSAGES.ERROR_CONNECTION);
  }
}
