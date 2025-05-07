import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ExternalHttpService {
  protected readonly http: AxiosInstance;
  protected readonly logger = new Logger(ExternalHttpService.name);

  constructor(baseURL: string, headers: Record<string, string> = {}) {
    this.http = axios.create({
      baseURL,
      timeout: 10_000,
      headers,
    });

    axiosRetry(this.http, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) =>
        error.code === 'ECONNABORTED' || (error.response?.status ?? 0) >= 500,
    });

    this.http.interceptors.request.use((c) => {
      this.logger.debug(`[→] ${c.method?.toUpperCase()} ${c.baseURL}${c.url}`);
      return c;
    });

    this.http.interceptors.response.use(
      (res) => res,
      (err) => {
        this.logger.error(
          `[✖] ${err.config?.url} :: ${err.message}`,
          err.response?.data,
        );
        return Promise.reject(
          err instanceof Error
            ? err
            : new Error(err.message || 'Unknown error'),
        );
      },
    );
  }
}
