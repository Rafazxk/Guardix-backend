import pool from './database.js';

export const setupDatabase = async (): Promise<void> => {
  try {
    console.log("--- [DB] Iniciando criação das tabelas... ---");
    
    const sql = `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      -- 1. Tabela de Usuários (com controle de planos e gateway)
      CREATE TABLE IF NOT EXISTS users (
          user_id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          email varchar NOT NULL UNIQUE,
          senha text NOT NULL,
          plano varchar DEFAULT 'free' NOT NULL, -- 'free', 'pro', 'premium'
          status_assinatura varchar DEFAULT 'active' NOT NULL, -- 'active', 'canceled', 'past_due'
          stripe_customer_id varchar(255) UNIQUE,
          stripe_subscription_id varchar(255) UNIQUE,
          fim_periodo_atual timestamp,
          data_criacao timestamp DEFAULT CURRENT_TIMESTAMP,
          tipo_pessoa varchar DEFAULT 'Pessoa física'
      );

      -- 2. Tabela de Historico de Pagamentos/Faturas (Opcional, mas muito útil)
      CREATE TABLE IF NOT EXISTS historico_pagamentos (
          pagamento_id SERIAL PRIMARY KEY,
          user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
          valor numeric(10, 2) NOT NULL,
          plano varchar NOT NULL,
          status varchar NOT NULL, -- 'paid', 'failed', 'pending'
          gateway_payment_id varchar(255),
          data_pagamento timestamp DEFAULT CURRENT_TIMESTAMP
      );

      -- 3. Tabela de Consultas (Mestra)
      CREATE TABLE IF NOT EXISTS consultas (
          consulta_id SERIAL PRIMARY KEY,
          user_id uuid NOT NULL REFERENCES users(user_id),
          tipo_consulta varchar NOT NULL CHECK (tipo_consulta IN ('link', 'telefone', 'print')),
          score_risco numeric,
          resultado text,
          data_consulta timestamp DEFAULT CURRENT_TIMESTAMP
      );

      -- 4. Tabela de Blacklist
      CREATE TABLE IF NOT EXISTS blacklist (
          blacklist_id SERIAL PRIMARY KEY,
          tipo varchar NOT NULL CHECK (tipo IN ('dominio', 'link', 'telefone', 'cpf', 'hash')),
          valor text NOT NULL,
          motivo text,
          data_adicao timestamp DEFAULT CURRENT_TIMESTAMP,
          fonte varchar
      );

      -- 5. Detalhes das Consultas
      CREATE TABLE IF NOT EXISTS consulta_detalhes (
          id SERIAL PRIMARY KEY,
          consulta_id integer NOT NULL REFERENCES consultas(consulta_id),
          regra_ativada varchar NOT NULL,
          pontuacao integer NOT NULL,
          mensagem text NOT NULL,
          risco text,
          criado_em timestamp DEFAULT now()
      );

      -- 6. Links Analisados
      CREATE TABLE IF NOT EXISTS links_analisados (
          link_id SERIAL PRIMARY KEY,
          consulta_id integer UNIQUE REFERENCES consultas(consulta_id),
          url text NOT NULL,
          dominio varchar,
          idade_dominio integer,
          reputacao varchar,
          status varchar
      );

      -- 7. Prints Analisados (OCR)
      CREATE TABLE IF NOT EXISTS prints_analisados (
          print_id SERIAL PRIMARY KEY,
          consulta_id integer UNIQUE REFERENCES consultas(consulta_id),
          caminho_arquivo text NOT NULL,
          texto_extraido text,
          tipo_golpe varchar,
          score_risco numeric,
          id_hash varchar(64) UNIQUE
      );

      -- 8. Telefones Reportados
      DROP TABLE IF EXISTS telefones_reportados CASCADE;

      CREATE TABLE telefones_reportados (
          telefone_id SERIAL PRIMARY KEY,
          consulta_id integer UNIQUE REFERENCES consultas(consulta_id),
          numero varchar NOT NULL,
          denuncias integer DEFAULT 1,
          score_spam numeric,
          operadora varchar,
          status varchar DEFAULT 'suspeito',
          data_criacao timestamp DEFAULT CURRENT_TIMESTAMP
      );

      -- 9. Links Reportados
      CREATE TABLE IF NOT EXISTS links_reportados (
          link_id SERIAL PRIMARY KEY,
          consulta_id INTEGER UNIQUE REFERENCES consultas(consulta_id),
          url VARCHAR NOT NULL,
          denuncias INTEGER DEFAULT 1,
          status VARCHAR DEFAULT 'suspeito',
          data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Script para popular dados iniciais (Seed)
      INSERT INTO telefones_reportados (numero, status, denuncias)
      VALUES 
      ('11987654321', 'perigoso', 15),
      ('21912345678', 'suspeito', 5),
      ('81999887766', 'perigoso', 22)
      ON CONFLICT DO NOTHING;
    `;

    await pool.query(sql);
    console.log("--- [DB] Tudo pronto! Tabelas criadas ou já existentes. ---");
  } catch (err: any) {
    console.error("--- [DB ERRO] Falha no setup:", err.message);
  }
};