from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

TAREFAS = [
    {"id": "checkins", "nome": "Check-ins", "categoria": "gestao", "tempoEstimado": 30, "descricao": "Acompanhamento individual dos alunos", "prioridade": "alta"},
    {"id": "reuniao_diaria", "nome": "Reunião diária", "categoria": "gestao", "tempoEstimado": 30, "descricao": "Alinhamento da equipe e planejamento do dia", "prioridade": "alta"},
    {"id": "suporte", "nome": "Suporte", "categoria": "atendimento", "tempoEstimado": 60, "descricao": "Atendimento aos clientes e resolução de dúvidas", "prioridade": "alta"},
    {"id": "social_selling", "nome": "Social Selling Insta", "categoria": "marketing", "tempoEstimado": 45, "descricao": "Atividades de marketing no Instagram", "prioridade": "media"},
    {"id": "engajamento_grupo", "nome": "Enviar mensagens de engajamento no grupo", "categoria": "engajamento", "tempoEstimado": 30, "descricao": "Comunicação ativa com grupos de alunos", "prioridade": "alta"},
    {"id": "separar_alunos", "nome": "Separar alunos para engajamento", "categoria": "engajamento", "tempoEstimado": 45, "descricao": "Segmentação de alunos para ações específicas", "prioridade": "media"},
    {"id": "material_renovacao", "nome": "Elaborar material para alunos de renovação", "categoria": "conteudo", "tempoEstimado": 90, "descricao": "Criação de conteúdo para retenção de clientes", "prioridade": "alta"},
    {"id": "montar_planos", "nome": "Montar planos novos", "categoria": "produto", "tempoEstimado": 60, "descricao": "Desenvolvimento de novos produtos e serviços", "prioridade": "media"},
    {"id": "engajamento_alunos", "nome": "Engajamento dos alunos", "categoria": "engajamento", "tempoEstimado": 45, "descricao": "Ativação e motivação dos alunos", "prioridade": "alta"},
    {"id": "conteudo_desengajados", "nome": "Produção de conteúdo para alunos desengajados", "categoria": "conteudo", "tempoEstimado": 60, "descricao": "Material específico para reativação de alunos", "prioridade": "media"},
    {"id": "engajamento_time", "nome": "Engajamento no grupo do Time", "categoria": "interno", "tempoEstimado": 15, "descricao": "Comunicação e motivação da equipe interna", "prioridade": "baixa"}
]

def handler(request):
    return jsonify(TAREFAS)