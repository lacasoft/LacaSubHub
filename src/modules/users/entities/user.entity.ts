import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SubscriptionEntity } from 'src/modules/subscriptions/entities/subscription.entity';
import { UserRole } from 'src/common/enums/user-role.enum';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  whatsappId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  pinHash: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  preferences: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  financialGoals: Record<string, any>[];

  @Column({ type: 'timestamp', nullable: true })
  trialEndDate: Date | null;

  @OneToMany(() => SubscriptionEntity, (subscription) => subscription.user)
  subscriptions: SubscriptionEntity[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeCustomerId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paypalCustomerId: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp with time zone',
    nullable: true,
    default: null,
  })
  deletedAt: Date | null;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPin() {
    if (this.pinHash && /^[0-9]{4}$/.test(this.pinHash)) {
      const saltRounds = 10;
      this.pinHash = await bcrypt.hash(this.pinHash, saltRounds);
    }
  }

  async validatePin(pin: string): Promise<boolean> {
    if (!this.pinHash || !/^[0-9]{4}$/.test(pin)) return false;
    return bcrypt.compare(pin, this.pinHash);
  }
}
