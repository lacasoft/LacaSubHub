import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { PaymentProvider } from 'src/common/enums/payment-provider.enum';
import { SubscriptionStatus } from 'src/common/enums/subscription-status.enum';
import { SubscriptionPlanType } from 'src/common/enums/subscription-plan-type.enum';

@Entity('subscriptions')
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.subscriptions)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPlanType,
    default: SubscriptionPlanType.BASIC,
  })
  planType: SubscriptionPlanType;

  @Column()
  planName: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIAL,
  })
  status: SubscriptionStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  discountPercentage: number;

  @Column({ nullable: true })
  discountEndDate: Date;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ default: false })
  autoRenew: boolean;

  @Column({ nullable: true })
  canceledAt: Date;

  @Column({ nullable: true })
  cancelReason: string;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
    nullable: true,
  })
  paymentProvider: PaymentProvider;

  @Column({ nullable: true })
  paymentProviderId: string;

  @Column({ nullable: true })
  lastPaymentDate: Date;

  @Column({ nullable: true })
  nextBillingDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
