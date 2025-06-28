import { Knex } from 'knex';
import { User, UserCreate } from '../types/user.types';

export class UserRepository {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.db('users').where({ username }).first<User>();
  }

  async create(user: UserCreate): Promise<User> {
    const [createdUser] = await this.db('users').insert(user).returning('*');
    return createdUser;
  }
}
