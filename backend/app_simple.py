#!/usr/bin/env python3
"""
Backend minimalista que funciona garantidamente
"""
import json
import os
from datetime import datetime
from flask import Flask, jsonify, send_from_directory, send_file
from flask_cors import CORS

# Cria app Flask simples
app = Flask(__name__)
CORS(app)

# Configuração para servir arquivos estáticos do frontend
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'dist')

# Debug: verificar se o diretório existe
print(f"🔍 Procurando frontend em: {FRONTEND_DIST}")
print(f"📁 Diretório existe: {os.path.exists(FRONTEND_DIST)}")
if os.path.exists(FRONTEND_DIST):
    print(f"📄 Arquivos encontrados: {os.listdir(FRONTEND_DIST)}")
else:
    print("❌ Diretório frontend/dist não encontrado!")

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

# Rotas para servir o frontend React
@app.route('/')
def serve_frontend():
    """Serve o index.html do frontend"""
    try:
        if os.path.exists(os.path.join(FRONTEND_DIST, 'index.html')):
            return send_file(os.path.join(FRONTEND_DIST, 'index.html'))
        else:
            return jsonify({
                "message": "🚀 Backend funcionando!", 
                "frontend": "Compilando...",
                "api": "/api/funcionarios"
            })
    except Exception as e:
        return jsonify({
            "message": "🚀 Backend funcionando!", 
            "error": str(e),
            "api": "/api/funcionarios"
        })

@app.route('/<path:path>')
def serve_static(path):
    """Serve arquivos estáticos do frontend"""
    # Ignora rotas da API
    if path.startswith('api/'):
        return jsonify({"error": "Rota da API não encontrada"}), 404
    
    try:
        # Se o arquivo existe, serve ele
        if os.path.exists(os.path.join(FRONTEND_DIST, path)):
            return send_from_directory(FRONTEND_DIST, path)
        # Senão, serve o index.html (para SPA routing)
        elif os.path.exists(os.path.join(FRONTEND_DIST, 'index.html')):
            return send_file(os.path.join(FRONTEND_DIST, 'index.html'))
        else:
            return jsonify({"error": "Frontend não compilado ainda"}), 404
    except Exception as e:
        return jsonify({"error": f"Erro ao servir arquivo: {str(e)}"}), 404

if __name__ == '__main__':
    # Pega a porta do ambiente (Render, Heroku, etc.) ou usa 5000 como padrão
    port = int(os.environ.get('PORT', 5000))
    
    print("🚀 Iniciando backend simples...")
    print("📊 Dados carregados:")
    print(f"   - {len(data.get('funcionarios', []))} funcionários")
    print(f"   - {len(data.get('tarefas', []))} tarefas")
    print(f"   - {len(data.get('agenda', []))} agendamentos")
    print(f"\n🌐 Servidor rodando na porta: {port}")
    print(f"🔗 Teste: http://localhost:{port}/api/funcionarios")
    
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)