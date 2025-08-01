#!/usr/bin/env python3
"""
Arquivo principal para Railway - Frontend + Backend integrados
Configurado para produção com Gunicorn
"""
import os
import sys

# Adiciona o diretório backend ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Importa o app do backend
from app_simple import app

# Para Gunicorn
application = app

if __name__ == '__main__':
    # Fallback para desenvolvimento local
    port = int(os.environ.get('PORT', 8080))
    print(f"🚀 Iniciando aplicação na porta {port}")
    app.run(host='0.0.0.0', port=port, debug=False)