import React, { useState } from 'react';
import { LfProvider } from '@lift/ds-web/components/LfProvider/';
import { Estacio } from '@lift/ds-tokens/brands';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AboutProject from './sections/AboutProject';
import HowToUse from './sections/HowToUse';
import Maintenance from './sections/Maintenance';
import Anatomy from './sections/Anatomy';
import Architecture from './sections/Architecture';
import BaseTokens from './sections/BaseTokens';
import Dynamic from './sections/Dynamic';
import Interactive from './sections/Interactive';
import Static from './sections/Static';
import Inputable from './sections/Inputable';
import CoreSection from './sections/CoreSection';
import BrandSection from './sections/BrandSection';
import HowToChoose from './sections/HowToChoose';
import ComponentExamples from './sections/ComponentExamples';
import CommonErrors from './sections/CommonErrors';
import DecisionEngine from './sections/DecisionEngine';
import DecisionTreeSection from './sections/DecisionTreeSection';
import AIInstructions from './sections/AIInstructions';
import QuickReference from './sections/QuickReference';
import Glossary from './sections/Glossary';
import PluginGuide from './sections/PluginGuide';
import TokenBrowser from './sections/TokenBrowser';
import TokenComparison from './sections/TokenComparison';
import TokenDetailPage from './sections/TokenDetailPage';
import PageTOC from './components/PageTOC.jsx';
import './styles.css';

const themes = {
  estacio: {
    default: Estacio.Ts.Default,
  },
};

const SECTIONS = [
  // Sobre o Projeto
  { id: 'about', label: 'Visão Geral', group: 'Sobre o Projeto', color: '#3b82f6', icon: 'Eye' },
  { id: 'howto', label: 'Como Usar', group: 'Sobre o Projeto', color: '#10b981', icon: 'RocketUp' },
  { id: 'maintain', label: 'Manutenção', group: 'Sobre o Projeto', color: '#f59e0b', icon: 'Tool' },
  { id: 'plugin', label: 'Plugin Figma', group: 'Sobre o Projeto', color: '#603DA2', icon: 'Figma' },

  // Fundamentos
  { id: 'anatomy', label: 'Anatomia', group: 'Fundamentos', color: '#076AEA', icon: 'Layers' },
  { id: 'arch', label: 'Camadas', group: 'Fundamentos', color: '#076AEA', icon: 'Grid' },
  { id: 'base', label: 'Base Tokens', group: 'Fundamentos', color: '#6b7280', icon: 'Box' },
  { id: 'browse', label: 'Consulta de Tokens', group: 'Fundamentos', color: '#8b5cf6', icon: 'Search' },
  { id: 'comparison', label: 'Figma × npm', group: 'Fundamentos', color: '#f59e0b', icon: 'ArrowRightLeft' },

  // Catálogo de Tokens
  { id: 'brand', label: 'Brand', group: 'Catálogo de Tokens', color: '#076AEA', icon: 'Tag' },
  { id: 'core', label: 'Core', group: 'Catálogo de Tokens', color: '#6b7280', icon: 'Settings' },
  { id: 'dynamic', label: 'Dynamic', group: 'Catálogo de Tokens', color: '#076AEA', icon: 'Zap' },
  { id: 'interactive', label: 'Interactive', group: 'Catálogo de Tokens', color: '#6c1bed', icon: 'MousePointer' },
  { id: 'static', label: 'Static', group: 'Catálogo de Tokens', color: '#059669', icon: 'Image' },
  { id: 'inputable', label: 'Inputable', group: 'Catálogo de Tokens', color: '#d97706', icon: 'Edit' },

  // Guia de Uso
  { id: 'choose', label: 'Como escolher', group: 'Guia de Uso', color: '#f59e0b', icon: 'Compass' },
  { id: 'decision-tree', label: 'Árvore de Decisão', group: 'Guia de Uso', color: '#10b981', icon: 'Share' },
  { id: 'examples', label: 'Exemplos em componentes', group: 'Guia de Uso', color: '#8b5cf6', icon: 'Lightbulb' },
  { id: 'errors', label: 'Erros comuns', group: 'Guia de Uso', color: '#ef4444', icon: 'AlertTriangle' },

  // Para IA
  { id: 'engine', label: 'Decision Engine', group: 'Para IA', color: '#10b981', icon: 'ArtificialIntelligence' },
  { id: 'quickref', label: 'Referência rápida', group: 'Para IA', color: '#06b6d4', icon: 'Bookmark' },
  { id: 'ai-instructions', label: 'Instruções para IA', group: 'Para IA', color: '#8b5cf6', icon: 'Download' },

  // Referência
  { id: 'glossary', label: 'Glossário', group: 'Referência', color: '#6b7280', icon: 'BookOpen' },
];

const SECTION_MAP = {
  about: AboutProject,
  howto: HowToUse,
  maintain: Maintenance,
  anatomy: Anatomy,
  arch: Architecture,
  base: BaseTokens,
  browse: TokenBrowser,
  comparison: TokenComparison,
  dynamic: Dynamic,
  interactive: Interactive,
  static: Static,
  inputable: Inputable,
  core: CoreSection,
  brand: BrandSection,
  choose: HowToChoose,
  'decision-tree': DecisionTreeSection,
  examples: ComponentExamples,
  errors: CommonErrors,
  engine: DecisionEngine,
  quickref: QuickReference,
  'ai-instructions': AIInstructions,
  glossary: Glossary,
  plugin: PluginGuide,
};

export default function App() {
  const [active, setActive] = useState('about');
  const [browserState, setBrowserState] = useState({ brand: 'estacio', mode: 'default', category: 'Dynamic', search: '' });

  const isTokenDetail = active.startsWith('token-detail:');
  const tokenName = isTokenDetail ? active.slice('token-detail:'.length) : null;

  if (isTokenDetail) {
    return (
      <LfProvider theme="estacio" template="default" themes={themes}>
        <Topbar sections={SECTIONS} onNavigate={setActive} />
        <Sidebar sections={SECTIONS} active="browse" onNavigate={setActive} />
        <main className="main-content">
          <TokenDetailPage
            tokenName={tokenName}
            brand={browserState.brand}
            mode={browserState.mode}
            onNavigate={setActive}
            onBrandChange={(b) => setBrowserState(prev => ({ ...prev, brand: b }))}
            onModeChange={(m) => setBrowserState(prev => ({ ...prev, mode: m }))}
          />
        </main>
        <PageTOC active="browse" />
      </LfProvider>
    );
  }

  const ActiveSection = SECTION_MAP[active] || Anatomy;
  return (
    <LfProvider theme="estacio" template="default" themes={themes}>
      <Topbar sections={SECTIONS} onNavigate={setActive} />
      <Sidebar sections={SECTIONS} active={active} onNavigate={setActive} />
      <main className="main-content">
        <ActiveSection onNavigate={setActive} onBrowserStateChange={setBrowserState} />
      </main>
      <PageTOC active={active} />
    </LfProvider>
  );
}
