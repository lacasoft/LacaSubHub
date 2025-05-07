import axios from 'axios';
import { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BaseHttpService {
  protected readonly http: AxiosInstance;
  protected readonly logger = new Logger(BaseHttpService.name);

  constructor(
    baseURL: string,
    private defaultConfig: AxiosRequestConfig = {},
  ) {
    this.http = axios.create({ baseURL, ...defaultConfig });
  }
}
