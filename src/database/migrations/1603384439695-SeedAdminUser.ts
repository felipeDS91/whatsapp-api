import { getRepository, MigrationInterface, QueryRunner } from 'typeorm';
import User from '../../models/User';
import adminUser from '../seeds/adminUser.seed';

export default class SeedAdminUser1603384439695 implements MigrationInterface {
  public async up(_: QueryRunner): Promise<void> {
    await getRepository(User).save(adminUser);
  }

  public async down(_: QueryRunner): Promise<void> {
    // do nothing
  }
}
