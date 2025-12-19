
# Guia de Deployment & Configuração de Banco (v3.1)

Execute o script abaixo no **SQL Editor** do seu projeto no Supabase para garantir que todas as colunas e tabelas necessárias para o LaunchOS 3.1 estejam presentes.

## Script de Configuração SQL

```sql
-- Habilitar extensão de UUID se não estiver ativa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Experts (Sincronizada com Curadoria de Marca)
CREATE TABLE IF NOT EXISTS experts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  niche TEXT,
  communication_style TEXT,
  branding JSONB DEFAULT '{}'::jsonb, -- Armazena Arquétipo, Tom de Voz, etc.
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Equipe (Sincronizada com Gestão de Acessos)
CREATE TABLE IF NOT EXISTS team (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT DEFAULT '123',
  role TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Blueprints (Modelos de Lançamento)
CREATE TABLE IF NOT EXISTS campaign_blueprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  phases JSONB DEFAULT '[]'::jsonb,
  ai_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Projetos (Onde a mágica acontece)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme TEXT NOT NULL,
  expert_id UUID REFERENCES experts(id) ON DELETE SET NULL,
  input_json JSONB, -- Dados do formulário
  strategy_json JSONB, -- Plano gerado pela IA (Contém Fases, Tarefas e Anexos)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NOTA: O LaunchOS v3.1 utiliza uma arquitetura baseada em Documento (JSONB) 
-- para as estratégias, permitindo maior velocidade e flexibilidade da IA.
-- Não é necessário criar tabelas separadas para tasks/fases nesta versão,
-- pois tudo é orquestrado dentro de projects.strategy_json.
```

## Variáveis de Ambiente Necessárias

Certifique-se de configurar estas chaves no seu ambiente de hospedagem:
- `API_KEY`: Sua chave do Google Gemini (obrigatória).
- `VITE_SUPABASE_URL`: URL do seu projeto Supabase.
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase.
