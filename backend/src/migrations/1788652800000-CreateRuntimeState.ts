import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRuntimeState1788652800000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE request_limits (
      key varchar(128) PRIMARY KEY,
      hits integer NOT NULL,
      expires_at timestamptz NOT NULL,
      blocked_until timestamptz
    )`);
    await queryRunner.query('CREATE INDEX request_limits_expiry_idx ON request_limits (expires_at)');
    await queryRunner.query(`CREATE TABLE provider_cache (
      key varchar(160) PRIMARY KEY,
      value jsonb,
      expires_at timestamptz NOT NULL,
      refresh_after timestamptz NOT NULL,
      lease_owner uuid,
      lease_until timestamptz
    )`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE provider_cache');
    await queryRunner.query('DROP TABLE request_limits');
  }
}
