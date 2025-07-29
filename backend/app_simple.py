#!/usr/bin/env python3
"""
Backend minimalista que funciona garantidamente
"""
import json
import os
from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS

# Cria app Flask simples
app = Flask(__name__)
CORS(app)

# Carrega dados do JSON uma vez
DATA_PATH = os.path.join(os.path.dirname(__file__), 'src', 'data', 'agenda.json')

def load_data():
    try:
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Erro ao carregar dados: {e}")
        return {"funcionarios": [], "tarefas": [], "agenda": []}

# Carrega dados na inicialização
data = load_data()

# Rotas simples
@app.route('/')
def home():
    return jsonify({
        "message": "Backend funcionando!",
        "status": "ok",
        "funcionarios": len(data.get('funcionarios', [])),
        "tarefas": len(data.get('tarefas', [])),
        "agenda": len(data.get('agenda', []))
    })

@app.route('/api/funcionarios')
def get_funcionarios():
    return jsonify(data.get('funcionarios', []))

@app.route('/api/tarefas')
def get_tarefas():
    return jsonify(data.get('tarefas', []))

@app.route('/api/agenda')
def get_agenda():
    return jsonify(data.get('agenda', []))

@app.route('/api/funcionarios/<funcionario_id>')
def get_funcionario(funcionario_id):
    funcionarios = data.get('funcionarios', [])
    funcionario = next((f for f in funcionarios if f['id'] == funcionario_id), None)
    if funcionario:
        return jsonify(funcionario)
    return jsonify({"error": "Funcionário não encontrado"}), 404

@app.route('/api/tarefas/<tarefa_id>')
def get_tarefa(tarefa_id):
    tarefas = data.get('tarefas', [])
    tarefa = next((t for t in tarefas if t['id'] == tarefa_id), None)
    if tarefa:
        return jsonify(tarefa)
    return jsonify({"error": "Tarefa não encontrada"}), 404

@app.route('/api/agenda/funcionario/<funcionario_id>')
def get_agenda_funcionario(funcionario_id):
    agenda = data.get('agenda', [])
    agenda_funcionario = [item for item in agenda if item['funcionario'] == funcionario_id]
    return jsonify(agenda_funcionario)

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy", "message": "API funcionando"})

@app.route('/health')
def health_simple():
    return jsonify({"status": "healthy", "message": "API funcionando"})

# Teste simples para debug
@app.route('/test')
def test():
    return jsonify({"message": "Backend funcionando!", "timestamp": str(datetime.now())})

if __name__ == '__main__':
    print("🚀 Iniciando backend simples...")
    print("📊 Dados carregados:")
    print(f"   - {len(data.get('funcionarios', []))} funcionários")
    print(f"   - {len(data.get('tarefas', []))} tarefas")
    print(f"   - {len(data.get('agenda', []))} agendamentos")
    print("\n🌐 Servidor rodando em: http://localhost:5000")
    print("🔗 Teste: http://localhost:5000/api/funcionarios")
    
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)