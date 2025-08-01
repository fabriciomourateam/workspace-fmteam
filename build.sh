#!/bin/bash
echo "🔨 Iniciando build do projeto..."

# Build do frontend
echo "📦 Instalando dependências do frontend..."
cd frontend
npm install

echo "🏗️ Compilando frontend..."
npm run build

echo "✅ Build concluído!"
cd ..