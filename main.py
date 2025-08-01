#!/usr/bin/env python3
"""
Arquivo principal para Railway - Frontend + Backend integrados
"""
import os
import sys

# Adiciona o diretório backend ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Importa e executa o app do backend
from app_simple import app

if __name__ == '__main__':
    # Railway usa PORT do ambiente
    port = int(os.environ.get('PORT', 8080))
    print(f"🚀 Iniciando aplicação na porta {port}")
    app.run(host='0.0.0.0', port=port, debug=False)