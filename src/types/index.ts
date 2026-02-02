// API Actions
export type ApiAction = 'portfolio' | 'asset' | 'order' | 'cancel' | 'set-otp' | 'orders';

export type OrderSide = 'BUY' | 'SELL';

// Command types
export interface CommandDefinition {
  name: string;
  description: string;
}

// API Request params
export interface OrderParams {
  action: 'order';
  side: OrderSide;
  symbol: string;
  quantity: number;
  price: number;
  otpCode?: string;
}

export interface CancelParams {
  action: 'cancel';
  transId: string;
  otpCode?: string;
}

export interface SetOtpParams {
  action: 'set-otp';
  otpCode: string;
}

export interface TradeInfoParams {
  action: 'portfolio' | 'asset';
}

export interface OrdersParams {
  action: 'orders';
}

export type ApiParams = OrderParams | CancelParams | SetOtpParams | TradeInfoParams | OrdersParams;

// Response messages
export const MESSAGES = {
  PROCESSING_PORTFOLIO: '✅ Báo cáo danh mục đã được gửi!',
  PROCESSING_ASSET: '✅ Thông tin tài sản đã được gửi!',
  PROCESSING_ORDER: (side: string, qty: number, symbol: string, price: number) =>
    `⏳ Đang xử lý lệnh ${side} ${qty} ${symbol} @ ${price}k...`,
  PROCESSING_CANCEL: (transId: string) =>
    `⏳ Đang xử lý hủy lệnh ${transId}...`,
  PROCESSING_OTP: '⏳ Đang lưu OTP...',
  ERROR_GENERIC: '❌ Có lỗi. Vui lòng thử lại.',
  ERROR_CONNECTION: '❌ Không thể kết nối đến server.',
} as const;
