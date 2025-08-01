#!/bin/bash
echo "🔨 Build script iniciado..."

# Verificar se Node.js está disponível
if command -v node &> /dev/null; then
    echo "✅ Node.js encontrado: $(node --version)"
    echo "📦 Instalando dependências do frontend..."
    cd frontend && npm install
    echo "🏗️ Compilando frontend..."
    npm run build
    echo "✅ Frontend compilado!"
    cd ..
else
    echo "❌ Node.js não encontrado - pulando build do frontend"
fi

echo "🐍 Instalando dependências Python..."
pip install -r requirements.txt

echo "✅ Build concluído!"