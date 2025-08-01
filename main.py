#!/usr/bin/env python3
"""
API Backend para Railway - Só API
"""
import os
import sys

# Adiciona o diretório backend ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Importa o app do backend
from app_simple import app

if __name__ == '__main__':
    # Render usa PORT do ambiente (padrão 10000)
    port = int(os.environ.get('PORT', 10000))
    print(f"🚀 Iniciando API na porta {port}")
    print("📡 Render Backend - API funcionando")
    print("🔗 Endpoints: /api/funcionarios, /api/tarefas, /api/agenda")
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)