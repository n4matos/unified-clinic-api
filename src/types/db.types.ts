import { Knex } from 'knex';

export interface DbPool extends Knex {
  type: 'postgres' | 'mysql';
}
