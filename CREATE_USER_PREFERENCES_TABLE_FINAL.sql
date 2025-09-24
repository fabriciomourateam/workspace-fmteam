-- Criar tabela user_preferences no Supabase
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  preference_type TEXT NOT NULL,
  preference_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference_type)
);

-- Criar política para permitir acesso total (temporário)
CREATE POLICY IF NOT EXISTS "Permitir acesso total às preferências" ON user_preferences
  FOR ALL USING (true) WITH CHECK (true);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
