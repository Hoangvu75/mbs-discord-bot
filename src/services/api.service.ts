import config from '../config';
import type { ApiParams } from '../types';

/**
 * API Service - gọi n8n webhook MBS Trading 2
 * POST + urlencoded body ($json.query.action, $json.body.*)
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
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body || '',
      });

      return response.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  }

  /**
   * Build body urlencoded theo Postman (workflow expect $json.body.*)
   * Price: user nhập nghìn (36, 40.1) → gửi VND đầy đủ (36000, 40100)
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
      case 'order-sell': {
        const priceVnd = Math.round(params.price * 1000);
        pairs.push(
          ['symbol', params.symbol],
          ['orderQty', String(params.orderQty)],
          ['price', String(priceVnd)] // 36 → 36000, 40.1 → 40100
        );
        break;
      }
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
