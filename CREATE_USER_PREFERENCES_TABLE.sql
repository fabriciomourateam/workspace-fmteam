-- Tabela específica para preferências de interface do usuário
-- Execute este SQL no painel do Supabase

CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- Identificador único do usuário (gerado automaticamente)
  preference_type TEXT NOT NULL, -- 'column_widths', 'column_order', etc.
  preference_data JSONB NOT NULL, -- Dados da preferência em formato JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference_type) -- Um registro por tipo de preferência por usuário
);

-- Política de segurança (permitir acesso total por enquanto)
CREATE POLICY "Permitir acesso total às preferências de interface" ON user_preferences
  FOR ALL USING (true) WITH CHECK (true);

-- Comentários explicativos
COMMENT ON TABLE user_preferences IS 'Armazena preferências de interface do usuário como larguras e ordem das colunas';
COMMENT ON COLUMN user_preferences.user_id IS 'ID único do usuário gerado automaticamente pelo sistema';
COMMENT ON COLUMN user_preferences.preference_type IS 'Tipo da preferência: column_widths, column_order, etc.';
COMMENT ON COLUMN user_preferences.preference_data IS 'Dados da preferência em formato JSON';

-- Exemplo de dados que serão armazenados:
-- user_id: 'user_abc123_1234567890'
-- preference_type: 'column_widths'
-- preference_data: {"guido": 120, "pedro": 100, "michelle": 80}
--
-- user_id: 'user_abc123_1234567890' 
-- preference_type: 'column_order'
-- preference_data: ["guido", "pedro", "michelle", "dayana"]
