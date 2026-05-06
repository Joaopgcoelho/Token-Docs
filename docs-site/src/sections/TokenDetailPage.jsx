import React, { useMemo } from 'react';
import {
  getEnrichedToken,
  getResolvedValue,
  getRelatedTokens,
  getRecommendedSurface,
  enrichedData,
} from '../shared/tokenData';
import { contrastRatio, wcagLevel } from '../shared/colorUtils';
import { generateGuidelines } from '../shared/guidelinesEngine';

// Section components
import BreadcrumbNavigator from './token-detail/BreadcrumbNavigator';
import HeroSection from './token-detail/HeroSection';
import QuickUsage from './token-detail/QuickUsage';
import Collapsible from './token-detail/Collapsible';
import MetadataPanel from './token-detail/MetadataPanel';
import ValueSection from './token-detail/ValueSection';
import VisualPreview from './token-detail/VisualPreview';
import GuidelinesPanel from './token-detail/GuidelinesPanel';
import DecisionEngineSection from './token-detail/DecisionEngineSection';
import UsageExamples from './token-detail/UsageExamples';
import ContextSection from './token-detail/ContextSection';
import CodeSection from './token-detail/CodeSection';
import TokenMappingSection from './token-detail/TokenMappingSection';
import TechnicalDetails from './token-detail/TechnicalDetails';
import RelatedReferences from './token-detail/RelatedReferences';

export default function TokenDetailPage({ tokenName, brand, mode, onNavigate, onBrandChange, onModeChange }) {
  const enriched = useMemo(() => getEnrichedToken(tokenName), [tokenName]);
  const resolvedValue = getResolvedValue(tokenName, brand, mode);

  const recommendedSurface = useMemo(() => {
    if (!enriched) return undefined;
    const surface = getRecommendedSurface(enriched);
    if (!surface) return undefined;
    const surfaceValue = getResolvedValue(surface.name, brand, mode);
    return {
      name: surface.name,
      path: surface.path,
      value: surfaceValue,
      isColor: surface.isColor,
    };
  }, [enriched, brand, mode]);

  const contrastInfo = useMemo(() => {
    if (!enriched || !enriched.isColor || !resolvedValue || !recommendedSurface || !recommendedSurface.isColor || !recommendedSurface.value) {
      return null;
    }
    const ratio = contrastRatio(resolvedValue, recommendedSurface.value);
    if (ratio == null) return null;
    const level = wcagLevel(ratio);
    return { ratio, level, foreground: resolvedValue, background: recommendedSurface.value };
  }, [enriched?.isColor, resolvedValue, recommendedSurface?.isColor, recommendedSurface?.value]);

  const guidelines = useMemo(() => {
    return generateGuidelines(enriched);
  }, [enriched]);

  const enrichedName = enriched?.name;
  const relatedTokens = useMemo(() => {
    if (!enriched) return [];
    return getRelatedTokens(enriched);
  }, [enrichedName]);

  const generatedAt = enrichedData.generatedAt;

  // Error state
  if (!enriched) {
    return (
      <div className="td-page">
        <button onClick={() => onNavigate('browse')} className="td-back-btn" style={{ marginBottom: '12px', cursor: 'pointer', background: 'none', border: '1px solid #e5e5e5', borderRadius: 8, padding: '4px 16px', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
          ← Voltar ao Token Browser
        </button>
        <h1>Token não encontrado</h1>
        <p>O token <code>{tokenName}</code> não foi encontrado no catálogo.</p>
      </div>
    );
  }

  return (
    <div className="td-page">
      <button onClick={() => onNavigate('browse')} className="td-back-btn" style={{ marginBottom: '12px', cursor: 'pointer', background: 'none', border: '1px solid #e5e5e5', borderRadius: 8, padding: '4px 16px', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
        ← Voltar ao Token Browser
      </button>

      {/* Breadcrumb */}
      {enriched.segments && enriched.segments.length > 0 && (
        <BreadcrumbNavigator segments={enriched.segments} onNavigate={onNavigate} />
      )}

      {/* ═══ LAYER 1: HERO (always visible) ═══ */}
      <HeroSection
        enriched={enriched}
        resolvedValue={resolvedValue}
        contrastInfo={contrastInfo}
        brand={brand}
      />

      {/* ═══ LAYER 2: QUICK USAGE ═══ */}
      <QuickUsage enriched={enriched} recommendedSurface={recommendedSurface} />

      {/* ═══ LAYER 3: PROGRESSIVE DISCLOSURE ═══ */}

      <Collapsible title="Metadados" defaultOpen={false}>
        <MetadataPanel enriched={enriched} />
      </Collapsible>

      <Collapsible title="Valores detalhados" defaultOpen={false}>
        <ValueSection
          tokenName={tokenName}
          brand={brand}
          mode={mode}
          onBrandChange={onBrandChange}
          onModeChange={onModeChange}
          enriched={enriched}
        />
      </Collapsible>

      <Collapsible title="Preview completo" defaultOpen={false}>
        <VisualPreview enriched={enriched} resolvedValue={resolvedValue} />
      </Collapsible>

      <Collapsible title="Exemplos de uso" defaultOpen={true}>
        <UsageExamples enriched={enriched} resolvedValue={resolvedValue} brand={brand} mode={mode} />
      </Collapsible>

      {guidelines && guidelines.length > 0 && (
        <Collapsible title="Diretrizes" defaultOpen={false}>
          <GuidelinesPanel guidelines={guidelines} />
        </Collapsible>
      )}

      {(enriched.context || recommendedSurface) && (
        <Collapsible title="Contexto de uso" defaultOpen={false}>
          <ContextSection
            enriched={enriched}
            recommendedSurface={recommendedSurface}
            contrastRatio={contrastInfo ? contrastInfo.ratio : undefined}
          />
        </Collapsible>
      )}

      <Collapsible title="Decision Engine" defaultOpen={false}>
        <DecisionEngineSection enriched={enriched} />
      </Collapsible>

      {enriched.aliasChain && enriched.aliasChain.length > 0 && (
        <Collapsible title="Mapeamento de tokens" defaultOpen={false}>
          <TokenMappingSection enriched={enriched} brand={brand} mode={mode} />
        </Collapsible>
      )}

      <Collapsible title="Código" defaultOpen={false}>
        <CodeSection enriched={enriched} brand={brand} resolvedValue={resolvedValue} />
      </Collapsible>

      <Collapsible title="Detalhes técnicos" defaultOpen={false}>
        <TechnicalDetails enriched={enriched} generatedAt={generatedAt} />
      </Collapsible>

      {relatedTokens && relatedTokens.length > 0 && (
        <Collapsible title="Tokens relacionados" defaultOpen={false}>
          <RelatedReferences relatedTokens={relatedTokens} onNavigate={onNavigate} />
        </Collapsible>
      )}
    </div>
  );
}
