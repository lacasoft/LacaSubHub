// src/common/http/paypal-verifier.service.ts
import { Injectable } from '@nestjs/common';
import { PaypalHttpService } from './paypal-http.service';
@Injectable()
export class PaypalVerifierService {
  constructor(private paypal: PaypalHttpService) {}

  async verify(req: {
    body: unknown;
    headers: Record<string, string>;
  }): Promise<boolean> {
    const body = JSON.stringify(req.body); // PayPal exige string
    const headers: Record<string, string> = req.headers;

    const resp: any = await this.paypal.post(
      '/v1/notifications/verify-webhook-signature',
      {
        transmission_id: headers['paypal-transmission-id'],
        transmission_time: headers['paypal-transmission-time'],
        cert_url: headers['paypal-cert-url'],
        auth_algo: headers['paypal-auth-algo'],
        transmission_sig: headers['paypal-transmission-sig'],
        webhook_id: process.env.PAYPAL_WEBHOOK_ID, // <-- tu ID
        webhook_event: JSON.parse(body) as Record<string, unknown>,
      },
    );

    return resp.verification_status === 'SUCCESS';
  }
}
