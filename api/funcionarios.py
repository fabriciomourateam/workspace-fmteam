from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

FUNCIONARIOS = [
    {"id": "guido", "nome": "Guido", "horarioInicio": "09:00", "horarioFim": "17:30", "cor": "#2563eb"},
    {"id": "pedro", "nome": "Pedro", "horarioInicio": "09:00", "horarioFim": "17:30", "cor": "#10b981"},
    {"id": "michelle", "nome": "Michelle", "horarioInicio": "13:00", "horarioFim": "17:30", "cor": "#f59e0b"},
    {"id": "dayana", "nome": "Dayana", "horarioInicio": "09:00", "horarioFim": "17:30", "cor": "#ef4444"},
    {"id": "jean", "nome": "Jean", "horarioInicio": "08:00", "horarioFim": "17:30", "cor": "#8b5cf6"},
    {"id": "andreia", "nome": "Andreia", "horarioInicio": "14:00", "horarioFim": "17:30", "cor": "#06b6d4"},
    {"id": "thais", "nome": "Thais", "horarioInicio": "flexible", "horarioFim": "flexible", "cor": "#ec4899"},
    {"id": "teste_funcionario", "nome": "Funcionário de Teste", "horarioInicio": "", "horarioFim": "16:00", "cor": "#2563eb"}
]

def handler(request):
    return jsonify(FUNCIONARIOS)