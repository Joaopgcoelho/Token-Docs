import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * **Validates: Requirements 11.1, 11.2, 11.4, 11.5**
 *
 * Unit tests for the divergence tab button group reorganization.
 * Parses ui.html and verifies the structure of the three button groups,
 * separators, labels, and watch toggle behavior.
 */

let htmlContent;

beforeAll(() => {
  const htmlPath = resolve(__dirname, '../../ui.html');
  htmlContent = readFileSync(htmlPath, 'utf-8');
});

describe('Divergence Button Groups - Structure', () => {
  it('should have a div-action-bar container', () => {
    expect(htmlContent).toContain('class="div-action-bar"');
  });

  it('should have exactly 3 button groups with correct labels', () => {
    // Extract the div-action-bar section
    const actionBarStart = htmlContent.indexOf('class="div-action-bar"');
    expect(actionBarStart).toBeGreaterThan(-1);

    // Find the closing div of the action bar (look for the next section after it)
    const actionBarSection = htmlContent.substring(actionBarStart, actionBarStart + 3000);

    // Check for 3 group labels
    const groupLabelRegex = /class="div-btn-group-label"[^>]*>([^<]+)</g;
    const labels = [];
    let match;
    while ((match = groupLabelRegex.exec(actionBarSection)) !== null) {
      labels.push(match[1].trim());
    }

    expect(labels).toHaveLength(3);
    expect(labels[0]).toBe('Dados Figma');
    expect(labels[1]).toBe('Dados npm');
    expect(labels[2]).toBe('Ações');
  });

  it('should have separators between button groups', () => {
    const actionBarStart = htmlContent.indexOf('class="div-action-bar"');
    const actionBarSection = htmlContent.substring(actionBarStart, actionBarStart + 3000);

    const sepCount = (actionBarSection.match(/class="div-btn-sep"/g) || []).length;
    expect(sepCount).toBe(2);
  });

  it('should have btn-sync-docs and btn-sync-file in the Dados Figma group', () => {
    const actionBarStart = htmlContent.indexOf('class="div-action-bar"');
    const actionBarSection = htmlContent.substring(actionBarStart, actionBarStart + 3000);

    // Find the first group (Dados Figma)
    const firstGroupStart = actionBarSection.indexOf('Dados Figma');
    const firstSepStart = actionBarSection.indexOf('div-btn-sep');
    const firstGroupContent = actionBarSection.substring(firstGroupStart, firstSepStart);

    expect(firstGroupContent).toContain('id="btn-sync-docs"');
    expect(firstGroupContent).toContain('id="btn-sync-file"');
  });

  it('should have btn-div-file in the Dados npm group', () => {
    const actionBarStart = htmlContent.indexOf('class="div-action-bar"');
    const actionBarSection = htmlContent.substring(actionBarStart, actionBarStart + 3000);

    // Find the second group (Dados npm) - between first and second separator
    const npmLabelPos = actionBarSection.indexOf('Dados npm');
    const secondSepPos = actionBarSection.indexOf('div-btn-sep', actionBarSection.indexOf('div-btn-sep') + 1);
    const npmGroupContent = actionBarSection.substring(npmLabelPos, secondSepPos);

    expect(npmGroupContent).toContain('id="btn-div-file"');
  });

  it('should have btn-check-div and btn-watch-toggle in the Ações group', () => {
    const actionBarStart = htmlContent.indexOf('class="div-action-bar"');
    const actionBarSection = htmlContent.substring(actionBarStart, actionBarStart + 3000);

    // Find the third group (Ações)
    const acoesLabelPos = actionBarSection.indexOf('Ações');
    const acoesGroupContent = actionBarSection.substring(acoesLabelPos);

    expect(acoesGroupContent).toContain('id="btn-check-div"');
    expect(acoesGroupContent).toContain('id="btn-watch-toggle"');
  });

  it('should preserve hidden file inputs for div-file-enriched and div-file-npm', () => {
    expect(htmlContent).toContain('id="div-file-enriched"');
    expect(htmlContent).toContain('id="div-file-npm"');
  });
});

describe('Divergence Button Groups - CSS Styles', () => {
  it('should have div-action-bar CSS styles', () => {
    expect(htmlContent).toContain('.div-action-bar{');
    expect(htmlContent).toContain('.div-action-bar');
  });

  it('should have div-btn-group CSS styles', () => {
    expect(htmlContent).toContain('.div-btn-group{');
  });

  it('should have div-btn-group-label CSS styles', () => {
    expect(htmlContent).toContain('.div-btn-group-label{');
  });

  it('should have div-btn-group-buttons CSS styles', () => {
    expect(htmlContent).toContain('.div-btn-group-buttons{');
  });

  it('should have div-btn-sep CSS styles', () => {
    expect(htmlContent).toContain('.div-btn-sep{');
  });

  it('should have btn-watch-active CSS style with green background', () => {
    expect(htmlContent).toContain('.btn-watch-active{');
    expect(htmlContent).toMatch(/\.btn-watch-active\{[^}]*background:#059669/);
  });

  it('should have watch-pulse keyframe animation', () => {
    expect(htmlContent).toContain('@keyframes watch-pulse');
    expect(htmlContent).toMatch(/\.btn-watch-active\{[^}]*animation:watch-pulse/);
  });
});

describe('Divergence Button Groups - Watch Toggle Logic', () => {
  it('should use btn-watch-active class in the watch toggle click handler', () => {
    // Check the JS handler uses btn-watch-active instead of btn-success
    expect(htmlContent).toContain('btn.className = "btn btn-watch-active"');
  });

  it('should toggle between Ativado and Desativado labels in click handler', () => {
    expect(htmlContent).toContain('Monitoramento em Tempo Real: Ativado');
    expect(htmlContent).toContain('Monitoramento em Tempo Real: Desativado');
  });

  it('should update tooltip text on toggle', () => {
    expect(htmlContent).toContain('btn.title = "Desativar monitoramento contínuo de mudanças em tokens do Figma"');
    expect(htmlContent).toContain('btn.title = "Ativar monitoramento contínuo de mudanças em tokens do Figma"');
  });

  it('should use btn-watch-active class in watch-status message handler', () => {
    // The watch-status handler should also use btn-watch-active
    expect(htmlContent).toContain('wBtn.className = "btn btn-watch-active"');
  });

  it('should reset to plain btn class when deactivated', () => {
    // The click handler should reset className to "btn" when deactivated
    // Search in the JS section (after <script> tag)
    const scriptStart = htmlContent.indexOf('<script>');
    const jsSection = htmlContent.substring(scriptStart);
    const handlerStart = jsSection.indexOf('btn-watch-toggle').valueOf();
    const handlerSection = jsSection.substring(handlerStart, handlerStart + 800);
    expect(handlerSection).toContain('btn.className = "btn"');
  });
});

describe('Divergence Button Groups - Tooltips', () => {
  it('should have descriptive tooltip on btn-sync-docs', () => {
    expect(htmlContent).toMatch(/id="btn-sync-docs"[^>]*title="[^"]+"/);
  });

  it('should have descriptive tooltip on btn-sync-file', () => {
    expect(htmlContent).toMatch(/id="btn-sync-file"[^>]*title="[^"]+"/);
  });

  it('should have descriptive tooltip on btn-div-file', () => {
    expect(htmlContent).toMatch(/id="btn-div-file"[^>]*title="[^"]+"/);
  });

  it('should have descriptive tooltip on btn-check-div', () => {
    expect(htmlContent).toMatch(/id="btn-check-div"[^>]*title="[^"]+"/);
  });

  it('should have descriptive tooltip on btn-watch-toggle', () => {
    expect(htmlContent).toMatch(/id="btn-watch-toggle"[^>]*title="[^"]+"/);
  });
});
