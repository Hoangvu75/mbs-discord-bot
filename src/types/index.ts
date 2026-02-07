// API Actions - khớp với n8n workflow MBS Trading 2
export type ApiAction =
  | 'portfolio'
  | 'asset'
  | 'orders-status'
  | 'order-buy'
  | 'order-sell'
  | 'cancel-order'
  | 'set-otp'
  | 'login';

export type OrderSide = 'BUY' | 'SELL';

// Command types
export interface CommandDefinition {
  name: string;
  description: string;
}

// API Request - workflow expect query.action + JSON body
export interface OrderParams {
  action: 'order-buy' | 'order-sell';
  symbol: string;
  orderQty: number;
  price: number; // giá nghìn đồng (32.5 = 32,500đ)
}

export interface CancelParams {
  action: 'cancel-order';
  transId: string;
}

export interface SetOtpParams {
  action: 'set-otp';
  otp: string;
}

export interface TradeInfoParams {
  action: 'portfolio' | 'asset';
}

export interface OrdersParams {
  action: 'orders-status';
}

export interface LoginParams {
  action: 'login';
  username: string;
  password: string;
}

export type ApiParams =
  | OrderParams
  | CancelParams
  | SetOtpParams
  | TradeInfoParams
  | OrdersParams
  | LoginParams;

// Response messages
export const MESSAGES = {
  PROCESSING_PORTFOLIO: '✅ Báo cáo danh mục đã được gửi!',
  PROCESSING_ASSET: '✅ Thông tin tài sản đã được gửi!',
  PROCESSING_ORDERS: '✅ Sổ lệnh đã được gửi!',
  PROCESSING_ORDER: (side: string, qty: number, symbol: string, price: number) =>
    `⏳ Đang xử lý lệnh ${side} ${qty} ${symbol} @ ${price}k...`,
  PROCESSING_CANCEL: (transId: string) =>
    `⏳ Đang xử lý hủy lệnh ${transId}...`,
  PROCESSING_OTP: '⏳ Đang lưu OTP...',
  ERROR_GENERIC: '❌ Có lỗi. Vui lòng thử lại.',
  ERROR_CONNECTION: '❌ Không thể kết nối đến server.',
} as const;
