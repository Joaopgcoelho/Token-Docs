#!/bin/bash
# deploy.sh — Token Docs
# Uso: ./deploy.sh "mensagem de commit"
# Requer nvm com node instalado.

set -e

export PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH"

MSG="${1:-build: update token docs}"

echo "🔨 Buildando docs-site..."
cd "$(dirname "$0")/docs-site"
npm run build

echo "🗑  Limpando assets antigos..."
node ../scripts/deploy-docs.js "$MSG"

echo "✅ Deploy concluído! https://joaopgcoelho.github.io/Token-Docs/"
