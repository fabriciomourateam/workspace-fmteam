import os
import sys

# Adiciona o diretório src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from main import app

# Vercel precisa de uma função handler
def handler(request):
    return app(request.environ, lambda status, headers: None)