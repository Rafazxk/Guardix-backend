import pkg, { PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === 'production';

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  // Apenas ativa SSL se estiver estritamente em produção
  ssl: isProduction ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10
};

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log(`--- [BANCO] Conectado ao banco com sucesso ---`);
});

pool.on('error', (err: Error) => {
  console.error('--- [ERRO BANCO] Erro inesperado no pool:', err.message);
});

export default pool;