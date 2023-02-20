import { EntityRepository, Repository } from 'typeorm';
import Token from '../models/Token';

@EntityRepository(Token)
class TokensRepository extends Repository<Token> {
  public async findByPhone(phone: string): Promise<Token | null> {
    const findToken = await this.findOne({
      where: { phone },
    });

    return findToken || null;
  }

  public async deleteByPhone(phone: string): Promise<void> {
    await this.delete({ phone });
  }

}

export default TokensRepository;
