import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1746578919685 implements MigrationInterface {
  name = 'Migration1746578919685';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."subscriptions_plantype_enum" AS ENUM('trial', 'basic', 'premium', 'family')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."subscriptions_status_enum" AS ENUM(
                'active',
                'canceled',
                'expired',
                'trial',
                'pending'
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."subscriptions_paymentprovider_enum" AS ENUM('stripe', 'paypal', 'bank_transfer')
        `);
    await queryRunner.query(`
            CREATE TABLE "subscriptions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "planType" "public"."subscriptions_plantype_enum" NOT NULL DEFAULT 'basic',
                "planName" character varying NOT NULL,
                "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'trial',
                "price" numeric(10, 2) NOT NULL,
                "discountPercentage" integer,
                "discountEndDate" TIMESTAMP,
                "startDate" TIMESTAMP NOT NULL,
                "endDate" TIMESTAMP NOT NULL,
                "autoRenew" boolean NOT NULL DEFAULT false,
                "canceledAt" TIMESTAMP,
                "cancelReason" character varying,
                "paymentProvider" "public"."subscriptions_paymentprovider_enum",
                "paymentProviderId" character varying,
                "lastPaymentDate" TIMESTAMP,
                "nextBillingDate" TIMESTAMP,
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin', 'family_head', 'family_menber')
        `);
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "whatsappId" character varying(50) NOT NULL,
                "name" character varying(255),
                "email" character varying(255),
                "pinHash" character varying,
                "role" "public"."users_role_enum" NOT NULL DEFAULT 'user',
                "preferences" jsonb DEFAULT '{}',
                "financialGoals" jsonb DEFAULT '[]',
                "trialEndDate" TIMESTAMP,
                "stripeCustomerId" character varying(255),
                "paypalCustomerId" character varying(255),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_77c752efdf71b22c274bd3f35ca" UNIQUE ("whatsappId"),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_77c752efdf71b22c274bd3f35c" ON "users" ("whatsappId")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."payments_provider_enum" AS ENUM('stripe', 'paypal', 'bank_transfer')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."payments_status_enum" AS ENUM(
                'created',
                'pending',
                'processing',
                'completed',
                'failed',
                'canceled',
                'refunded'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "payments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "provider" "public"."payments_provider_enum" NOT NULL,
                "providerOrderId" character varying NOT NULL,
                "amount" numeric(12, 2) NOT NULL,
                "currency" character varying(3) NOT NULL,
                "status" "public"."payments_status_enum" NOT NULL,
                "metadata" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "subscriptions"
            ADD CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"
        `);
    await queryRunner.query(`
            DROP TABLE "payments"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."payments_status_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."payments_provider_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_77c752efdf71b22c274bd3f35c"
        `);
    await queryRunner.query(`
            DROP TABLE "users"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."users_role_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "subscriptions"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."subscriptions_paymentprovider_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."subscriptions_status_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."subscriptions_plantype_enum"
        `);
  }
}
