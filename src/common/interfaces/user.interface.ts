import { ISubscription } from './suscription.interface';

export interface IUserWithSubscription {
  id: string;
  whatsappId: string;
  subscription?: ISubscription;
  trialEndDate?: Date;
}
