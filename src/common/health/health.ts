/* eslint-disable @typescript-eslint/only-throw-error */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckService,
  MemoryHealthIndicator,
  HealthCheckResult,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { HealthCheckException } from 'src/common/exceptions/health.exception';
import { IHealthCheckException } from '../interfaces/health.interface';

@Injectable()
export class HealthIndicator {
  constructor(
    private config: ConfigService,
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private db: TypeOrmHealthIndicator,
  ) {}

  async isHealthy(): Promise<HealthCheckResult> {
    try {
      return await this.health.check([
        () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
        () => this.memory.checkRSS('memory_rss', 3000 * 1024 * 1024),
        () => this.db.pingCheck('database'),
      ]);
    } catch (error) {
      throw new HealthCheckException(error?.response as IHealthCheckException);
    }
  }
}
