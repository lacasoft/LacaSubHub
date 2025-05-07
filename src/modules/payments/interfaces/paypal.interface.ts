import { PaymentProvider } from 'src/common/enums/payment-provider.enum';
import { PaymentStatus } from 'src/common/enums/payment-status.enum';

export interface Payment {
  id: string;
  provider: PaymentProvider;
  providerOrderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
