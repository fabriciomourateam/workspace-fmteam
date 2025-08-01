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
    # Railway usa PORT do ambiente
    port = int(os.environ.get('PORT', 8080))
    print(f"🚀 Iniciando API na porta {port}")
    print("📡 Backend funcionando - só API")
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)