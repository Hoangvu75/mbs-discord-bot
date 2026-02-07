import config from '../config';
import type { ApiParams } from '../types';

/**
 * API Service - gọi n8n webhook MBS Trading 2
 * Khớp n8n + Postman: GET + urlencoded body ($json.query.action, $json.body.*)
 */
class ApiService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = config.webhookUrl;
  }

  /**
   * Gọi n8n webhook - action trong query, body urlencoded (format Postman)
   */
  async call(params: ApiParams): Promise<boolean> {
    try {
      const url = `${this.baseUrl}?action=${params.action}`;
      const body = this.buildUrlEncodedBody(params);

      console.log(`📡 API Call: ${params.action}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body || undefined,
      });

      return response.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  }

  /**
   * Build body urlencoded theo Postman (workflow expect $json.body.*)
   * Price: giữ nguyên format nghìn (30.1 = 30,100đ) - user nhập 30.1, 40.5
   */
  private buildUrlEncodedBody(params: ApiParams): string | null {
    const pairs: [string, string][] = [];
    switch (params.action) {
      case 'login':
        pairs.push(['username', params.username], ['password', params.password]);
        break;
      case 'set-otp':
        pairs.push(['otp', params.otp]);
        break;
      case 'order-buy':
      case 'order-sell':
        pairs.push(
          ['symbol', params.symbol],
          ['orderQty', String(params.orderQty)],
          ['price', String(params.price)] // 30.1, 40.5 - nghìn đồng
        );
        break;
      case 'cancel-order':
        pairs.push(['transId', params.transId]);
        break;
      case 'portfolio':
      case 'asset':
      case 'orders-status':
        return null;
      default:
        return null;
    }
    return new URLSearchParams(pairs).toString();
  }
}

export const apiService = new ApiService();
