import config from '../config';
import type { ApiParams } from '../types';

/**
 * API Service - handles all communication with n8n webhook
 * Follows Single Responsibility Principle
 */
class ApiService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = config.webhookUrl;
  }

  /**
   * Call the MBS Trading API
   */
  async call(params: ApiParams): Promise<boolean> {
    try {
      const url = this.buildUrl(params);
      console.log(`📡 API Call: ${params.action}`);

      const response = await fetch(url);
      return response.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(params: ApiParams): string {
    const searchParams = new URLSearchParams();

    // Add all params as query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    return `${this.baseUrl}?${searchParams.toString()}`;
  }
}

// Singleton instance
export const apiService = new ApiService();
