#!/usr/bin/env python3
"""
API minimalista sem Flask complexo
"""
from flask import Flask, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app, origins="*")

# Dados estáticos para teste
FUNCIONARIOS = [
    {"id": "guido", "nome": "Guido", "horarioInicio": "09:00", "horarioFim": "17:30", "cor": "#2563eb"},
    {"id": "pedro", "nome": "Pedro", "horarioInicio": "09:00", "horarioFim": "17:30", "cor": "#10b981"},
    {"id": "michelle", "nome": "Michelle", "horarioInicio": "13:00", "horarioFim": "17:30", "cor": "#f59e0b"}
]

TAREFAS = [
    {"id": "checkins", "nome": "Check-ins", "categoria": "gestao", "tempoEstimado": 30, "descricao": "Acompanhamento individual", "prioridade": "alta"},
    {"id": "suporte", "nome": "Suporte", "categoria": "atendimento", "tempoEstimado": 60, "descricao": "Atendimento aos clientes", "prioridade": "alta"}
]

AGENDA = [
    {"horario": "09:00", "funcionario": "guido", "tarefa": "checkins"},
    {"horario": "10:00", "funcionario": "pedro", "tarefa": "suporte"}
]

@app.route('/')
def home():
    return jsonify({
        "message": "API Minimalista funcionando!",
        "endpoints": [
            "/api/funcionarios",
            "/api/tarefas", 
            "/api/agenda",
            "/api/health"
        ]
    })

@app.route('/api/health')
def health():
    return jsonify({"status": "ok", "message": "API funcionando"})

@app.route('/api/funcionarios')
def funcionarios():
    return jsonify(FUNCIONARIOS)

@app.route('/api/tarefas')
def tarefas():
    return jsonify(TAREFAS)

@app.route('/api/agenda')
def agenda():
    return jsonify(AGENDA)

@app.route('/api/funcionarios/<funcionario_id>')
def funcionario_by_id(funcionario_id):
    func = next((f for f in FUNCIONARIOS if f['id'] == funcionario_id), None)
    if func:
        return jsonify(func)
    return jsonify({"error": "Funcionário não encontrado"}), 404

if __name__ == '__main__':
    print("🚀 API Minimalista iniciando...")
    print("📊 Dados de teste carregados")
    print("🌐 Acesse: http://localhost:5000")
    print("🔗 Funcionários: http://localhost:5000/api/funcionarios")
    
    app.run(host='0.0.0.0', port=5000, debug=True)