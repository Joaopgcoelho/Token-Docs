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
import HeaderSection from './token-detail/HeaderSection';
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
  // 2.4 — Memoize enriched lookup
  const enriched = useMemo(() => getEnrichedToken(tokenName), [tokenName]);
  const resolvedValue = getResolvedValue(tokenName, brand, mode);

  // Recommended surface (only for onSurface/text/icon tokens)
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

  // 2.4 — Memoize contrast info properly
  const contrastInfo = useMemo(() => {
    if (!enriched || !enriched.isColor || !resolvedValue || !recommendedSurface || !recommendedSurface.isColor || !recommendedSurface.value) {
      return null;
    }
    const ratio = contrastRatio(resolvedValue, recommendedSurface.value);
    if (ratio == null) return null;
    const level = wcagLevel(ratio);
    return { ratio, level, foreground: resolvedValue, background: recommendedSurface.value };
  }, [enriched?.isColor, resolvedValue, recommendedSurface?.isColor, recommendedSurface?.value]);

  // Guidelines
  const guidelines = useMemo(() => {
    return generateGuidelines(enriched);
  }, [enriched]);

  // 2.4 — Use enriched?.name as dependency instead of whole object
  const enrichedName = enriched?.name;
  const relatedTokens = useMemo(() => {
    if (!enriched) return [];
    return getRelatedTokens(enriched);
  }, [enrichedName]);

  // Generated at timestamp
  const generatedAt = enrichedData.generatedAt;

  // Error state: token not found
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

      {/* Breadcrumb: only if segments exist */}
      {enriched.segments && enriched.segments.length > 0 && (
        <BreadcrumbNavigator segments={enriched.segments} onNavigate={onNavigate} />
      )}

      {/* Header: always show */}
      <HeaderSection enriched={enriched} resolvedValue={resolvedValue} contrastInfo={contrastInfo} />

      {/* Metadata: always show */}
      <MetadataPanel enriched={enriched} />

      {/* Value: always show */}
      <ValueSection
        tokenName={tokenName}
        brand={brand}
        mode={mode}
        onBrandChange={onBrandChange}
        onModeChange={onModeChange}
        enriched={enriched}
      />

      {/* Preview: always show */}
      <VisualPreview enriched={enriched} resolvedValue={resolvedValue} />

      {/* Usage Examples: always show */}
      <UsageExamples enriched={enriched} resolvedValue={resolvedValue} brand={brand} mode={mode} />

      {/* Guidelines: only if guidelines array has items */}
      {guidelines && guidelines.length > 0 && (
        <GuidelinesPanel guidelines={guidelines} />
      )}

      {/* Context: only if there's context data or recommended surface */}
      {(enriched.context || recommendedSurface) && (
        <ContextSection
          enriched={enriched}
          recommendedSurface={recommendedSurface}
          contrastRatio={contrastInfo ? contrastInfo.ratio : undefined}
        />
      )}

      {/* Decision Engine: always show (derives from segments) */}
      <DecisionEngineSection enriched={enriched} />

      {/* Token Mapping: only if aliasChain exists and has items */}
      {enriched.aliasChain && enriched.aliasChain.length > 0 && (
        <TokenMappingSection enriched={enriched} brand={brand} mode={mode} />
      )}

      {/* Code: always show */}
      <CodeSection enriched={enriched} brand={brand} resolvedValue={resolvedValue} />

      {/* Technical: always show */}
      <TechnicalDetails enriched={enriched} generatedAt={generatedAt} />

      {/* Related: already conditional (returns null if empty) */}
      <RelatedReferences relatedTokens={relatedTokens} onNavigate={onNavigate} />
    </div>
  );
}
