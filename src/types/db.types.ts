export interface DbPool {
  query<T = any>(sql: string, params?: any[]): Promise<{ rows: T[] }>;
  end(): Promise<void>;
}
