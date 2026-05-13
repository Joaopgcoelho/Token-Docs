#!/usr/bin/env node
/**
 * deploy-docs.js
 * Limpa assets antigos do docs/, faz commit e push para o GitHub Pages.
 * Uso: node scripts/deploy-docs.js [mensagem de commit opcional]
 */

import { execSync } from 'child_process';
import { readdirSync, unlinkSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT, 'docs', 'assets');

// ── 1. Descobrir quais arquivos o index.html referencia ──────────────────────
const indexHtml = new URL(`file://${path.join(ROOT, 'docs', 'index.html')}`);
const htmlContent = (await import('fs')).readFileSync(path.join(ROOT, 'docs', 'index.html'), 'utf8');
const referenced = new Set(
  [...htmlContent.matchAll(/assets\/([\w.\-]+)/g)].map(m => m[1])
);

// ── 2. Remover assets não referenciados ──────────────────────────────────────
const allAssets = readdirSync(ASSETS_DIR);
const removed = [];
for (const file of allAssets) {
  if (!referenced.has(file)) {
    unlinkSync(path.join(ASSETS_DIR, file));
    removed.push(file);
  }
}
if (removed.length) {
  console.log('🗑  Removidos assets antigos:', removed.join(', '));
} else {
  console.log('✅ Nenhum asset antigo encontrado.');
}

// ── 3. Git: stage docs/, commit, push ────────────────────────────────────────
const msg = process.argv[2] || 'build: update token-docs';

function run(cmd) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

run('git add docs/');
run(`git commit -m "${msg}" || echo "Nada para commitar"`);
run('git push origin main');

console.log('\n🚀 Deploy concluído! GitHub Pages atualizado.');
