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

// Decision-first components
import BreadcrumbNavigator from './token-detail/BreadcrumbNavigator';
import DecisionHeroSection from './token-detail/DecisionHeroSection';
import TokenResultHeader from './token-detail/TokenResultHeader';
import UsageBlock from './token-detail/UsageBlock';
import ContextBlock from './token-detail/ContextBlock';
import TechnicalDetailsCollapse from './token-detail/TechnicalDetailsCollapse';
import RelatedReferences from './token-detail/RelatedReferences';

// Technical sections (inside collapse)
import MetadataPanel from './token-detail/MetadataPanel';
import ValueSection from './token-detail/ValueSection';
import TokenMappingSection from './token-detail/TokenMappingSection';
import CodeSection from './token-detail/CodeSection';
import TechnicalDetails from './token-detail/TechnicalDetails';

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

      {/* ═══ 1. DECISION HERO — "Qual token usar?" ═══ */}
      <DecisionHeroSection token={enriched} />

      {/* ═══ 2. TOKEN RESULT — compact header ═══ */}
      <TokenResultHeader
        enriched={enriched}
        resolvedValue={resolvedValue}
        contrastInfo={contrastInfo}
        brand={brand}
      />

      {/* ═══ 3. USAGE — "Como usar?" ═══ */}
      <UsageBlock
        enriched={enriched}
        resolvedValue={resolvedValue}
        brand={brand}
        mode={mode}
        guidelines={guidelines}
      />

      {/* ═══ 4. CONTEXT — surface, contrast, fallback ═══ */}
      <ContextBlock
        enriched={enriched}
        recommendedSurface={recommendedSurface}
        contrastInfo={contrastInfo}
      />

      {/* ═══ 5. TECHNICAL — progressive disclosure ═══ */}
      <TechnicalDetailsCollapse>
        <MetadataPanel enriched={enriched} />

        <ValueSection
          tokenName={tokenName}
          brand={brand}
          mode={mode}
          onBrandChange={onBrandChange}
          onModeChange={onModeChange}
          enriched={enriched}
        />

        {enriched.aliasChain && enriched.aliasChain.length > 0 && (
          <TokenMappingSection enriched={enriched} brand={brand} mode={mode} />
        )}

        <CodeSection enriched={enriched} brand={brand} resolvedValue={resolvedValue} />

        <TechnicalDetails enriched={enriched} generatedAt={generatedAt} />
      </TechnicalDetailsCollapse>

      {/* ═══ 6. RELATED ═══ */}
      <RelatedReferences relatedTokens={relatedTokens} onNavigate={onNavigate} />
    </div>
  );
}
