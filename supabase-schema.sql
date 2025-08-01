-- Schema para Supabase
-- Execute este SQL no painel do Supabase

-- Tabela de funcionários
CREATE TABLE funcionarios (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  horario_inicio TEXT,
  horario_fim TEXT,
  cor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tarefas
CREATE TABLE tarefas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  tempo_estimado INTEGER NOT NULL,
  descricao TEXT,
  prioridade TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de agenda
CREATE TABLE agenda (
  id SERIAL PRIMARY KEY,
  horario TEXT NOT NULL,
  funcionario_id TEXT NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
  tarefa_id TEXT NOT NULL REFERENCES tarefas(id) ON DELETE CASCADE,
  data DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'nao_iniciada', -- 'nao_iniciada', 'em_andamento', 'concluida', 'atrasada'
  tempo_inicio TIMESTAMP WITH TIME ZONE,
  tempo_fim TIMESTAMP WITH TIME ZONE,
  tempo_real INTEGER, -- em minutos
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de metas
CREATE TABLE metas (
  id SERIAL PRIMARY KEY,
  funcionario_id TEXT NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'diaria', 'semanal', 'mensal'
  periodo DATE NOT NULL,
  meta_horas INTEGER NOT NULL, -- em minutos
  meta_tarefas INTEGER NOT NULL,
  horas_realizadas INTEGER DEFAULT 0,
  tarefas_realizadas INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados iniciais
INSERT INTO funcionarios (id, nome, horario_inicio, horario_fim, cor) VALUES
('guido', 'Guido', '09:00', '17:30', '#2563eb'),
('pedro', 'Pedro', '09:00', '17:30', '#10b981'),
('michelle', 'Michelle', '13:00', '17:30', '#f59e0b'),
('dayana', 'Dayana', '09:00', '17:30', '#ef4444'),
('jean', 'Jean', '08:00', '17:30', '#8b5cf6'),
('andreia', 'Andreia', '14:00', '17:30', '#06b6d4'),
('thais', 'Thais', 'flexible', 'flexible', '#ec4899'),
('teste_funcionario', 'Funcionário de Teste', '', '16:00', '#2563eb');

INSERT INTO tarefas (id, nome, categoria, tempo_estimado, descricao, prioridade) VALUES
('checkins', 'Check-ins', 'gestao', 30, 'Acompanhamento individual dos alunos', 'alta'),
('reuniao_diaria', 'Reunião diária', 'gestao', 30, 'Alinhamento da equipe e planejamento do dia', 'alta'),
('suporte', 'Suporte', 'atendimento', 60, 'Atendimento aos clientes e resolução de dúvidas', 'alta'),
('social_selling', 'Social Selling Insta', 'marketing', 45, 'Atividades de marketing no Instagram', 'media'),
('engajamento_grupo', 'Enviar mensagens de engajamento no grupo', 'engajamento', 30, 'Comunicação ativa com grupos de alunos', 'alta'),
('separar_alunos', 'Separar alunos para engajamento', 'engajamento', 45, 'Segmentação de alunos para ações específicas', 'media'),
('material_renovacao', 'Elaborar material para alunos de renovação', 'conteudo', 90, 'Criação de conteúdo para retenção de clientes', 'alta'),
('montar_planos', 'Montar planos novos', 'produto', 60, 'Desenvolvimento de novos produtos e serviços', 'media'),
('engajamento_alunos', 'Engajamento dos alunos', 'engajamento', 45, 'Ativação e motivação dos alunos', 'alta'),
('conteudo_desengajados', 'Produção de conteúdo para alunos desengajados', 'conteudo', 60, 'Material específico para reativação de alunos', 'media'),
('engajamento_time', 'Engajamento no grupo do Time', 'interno', 15, 'Comunicação e motivação da equipe interna', 'baixa');

-- Inserir alguns agendamentos de exemplo
INSERT INTO agenda (horario, funcionario_id, tarefa_id) VALUES
('08:00', 'jean', 'suporte'),
('09:00', 'guido', 'checkins'),
('09:00', 'pedro', 'checkins'),
('09:00', 'dayana', 'social_selling'),
('09:30', 'guido', 'reuniao_diaria'),
('09:30', 'pedro', 'reuniao_diaria'),
('09:30', 'dayana', 'reuniao_diaria'),
('10:00', 'guido', 'reuniao_diaria'),
('10:00', 'pedro', 'reuniao_diaria'),
('10:30', 'guido', 'checkins'),
('10:30', 'pedro', 'checkins'),
('11:00', 'guido', 'checkins'),
('11:00', 'pedro', 'checkins'),
('11:30', 'guido', 'montar_planos'),
('13:00', 'michelle', 'checkins'),
('14:00', 'andreia', 'suporte'),
('15:00', 'pedro', 'material_renovacao'),
('16:00', 'michelle', 'material_renovacao'),
('17:00', 'thais', 'checkins');

-- Habilitar RLS (Row Level Security) se necessário
-- ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;