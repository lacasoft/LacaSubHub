import { IHealthCheckException } from 'src/common/interfaces/health.interface';

export class HealthCheckException {
  constructor(private data: IHealthCheckException) {}

  getDetails(): IHealthCheckException {
    return this.data;
  }
}
