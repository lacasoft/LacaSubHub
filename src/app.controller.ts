import { Controller, Get, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckResult } from '@nestjs/terminus';

import { HealthIndicator } from './common/health/health';
import { HealthCheckExceptionFilter } from './common/filters/health.filter';
import { Public } from './common/decorators/public.decorator';

@ApiTags('KaIA Health Check')
@Controller()
export class AppController {
  constructor(private healthIndicator: HealthIndicator) {}

  @Get('health')
  @HealthCheck()
  @Public()
  @UseFilters(new HealthCheckExceptionFilter())
  async isHealthSamples(): Promise<HealthCheckResult> {
    return this.healthIndicator.isHealthy();
  }
}
