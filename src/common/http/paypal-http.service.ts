import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExternalHttpService } from './external-http.service';

interface PayPalAccessTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

@Injectable()
export class PaypalHttpService extends ExternalHttpService {
  private readonly cfg: ConfigService;

  private token: string | null = null;
  private tokenExpiresAt = 0;
  private refreshPromise: Promise<void> | null = null;

  constructor(cfg: ConfigService) {
    const apiBase = cfg.get<string>('PAYPAL_API_BASE');
    if (!apiBase) {
      throw new Error('PAYPAL_API_BASE is not defined in the configuration');
    }
    super(apiBase);
    this.cfg = cfg;
  }

  private async refreshToken(): Promise<void> {
    const clientId = this.cfg.get<string>('PAYPAL_CLIENT_ID');
    const secret = this.cfg.get<string>('PAYPAL_SECRET');
    const basicAuth = Buffer.from(`${clientId}:${secret}`).toString('base64');

    try {
      const response = await this.http.post<PayPalAccessTokenResponse>(
        '/v1/oauth2/token',
        new URLSearchParams({ grant_type: 'client_credentials' }),
        {
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const { access_token, expires_in, token_type } = response.data;

      if (!access_token || typeof access_token !== 'string') {
        throw new Error('Invalid PayPal access token');
      }
      if (!expires_in || typeof expires_in !== 'number') {
        throw new Error('Invalid expiration time');
      }
      if (token_type !== 'Bearer') {
        throw new Error('Unexpected token type');
      }

      this.token = access_token;
      this.tokenExpiresAt = Date.now() + expires_in * 1000 - 60000; // Renovación 1 min antes
      this.logger.log('Token de PayPal refrescado exitosamente');
    } catch (error) {
      this.logger.error('Error al refrescar el token de PayPal:', error);
      throw new Error('No se pudo refrescar el token de PayPal');
    }
  }

  private async getAuthHeader(): Promise<string> {
    if (!this.token || Date.now() >= this.tokenExpiresAt) {
      // Evitar múltiples refrescos concurrentes
      if (!this.refreshPromise) {
        this.refreshPromise = this.refreshToken().finally(() => {
          this.refreshPromise = null;
        });
      }
      await this.refreshPromise;
    }
    return `Bearer ${this.token}`;
  }

  async post<T = any>(url: string, data: unknown): Promise<T> {
    try {
      const auth = await this.getAuthHeader();
      const response = await this.http.post<T>(url, data, {
        headers: { Authorization: auth, 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Error en POST a ${url}:`, error);
      throw error;
    }
  }

  async get<T = any>(url: string): Promise<T> {
    try {
      const auth = await this.getAuthHeader();
      const response = await this.http.get<T>(url, {
        headers: { Authorization: auth },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Error en GET a ${url}:`, error);
      throw error;
    }
  }
}
