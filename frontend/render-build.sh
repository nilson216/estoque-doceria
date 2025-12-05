#!/bin/bash
# Script para build seguro no Render (sem cache)
# Executar como Build Command: bash render-build.sh

set -e

echo "🧹 Limpando cache e dependências antigas..."
rm -rf node_modules package-lock.json dist .vite

echo "📦 Instalando dependências..."
npm install

echo "🔨 Buildando projeto (sem cache)..."
npm run build

echo "✅ Build completo! Pronto para deploy."
