import React from 'react';
import LfAlert from '@lift/ds-web/components/LfAlert/';
import LfHeading from '@lift/ds-web/components/LfHeading/';
import LfParagraph from '@lift/ds-web/components/LfParagraph/';
import { BRAND_LOGOS } from '../shared/brandLogos.js';
import { BRANDS } from '../shared/tokenData.js';

export default function AboutProject({ onNavigate }) {
  return (
    <div>
      <LfHeading as="h1">Sobre o Projeto Token Docs</LfHeading>
      <p className="subtitle">Tudo o que você precisa saber sobre este projeto, mesmo sem conhecimento técnico.</p>

      <LfHeading as="h2">O que é o Token Docs?</LfHeading>
      <LfParagraph>
        O Token Docs é uma ferramenta que <strong>documenta automaticamente</strong> os Design Tokens do Lift Design System.
        Pense nos Design Tokens como um &quot;dicionário de estilos&quot; — eles guardam todas as cores, espaçamentos, fontes e sombras
        que os produtos da YDUQS usam.
      </LfParagraph>
      <LfParagraph>
        O projeto garante que designers, desenvolvedores e até ferramentas de IA falem a mesma língua quando se trata de estilos visuais.
      </LfParagraph>


      <LfHeading as="h2">Para quem é este projeto?</LfHeading>
      <table>
        <thead>
          <tr><th>Público</th><th>O que encontra aqui</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Designers</strong></td>
            <td>Documentação visual dos tokens no Figma, guia de quando usar cada grupo, exemplos em componentes</td>
          </tr>
          <tr>
            <td><strong>Desenvolvedores</strong></td>
            <td>Nomes de tokens em JS e CSS, mapeamento de roles para propriedades CSS, regras de uso</td>
          </tr>
          <tr>
            <td><strong>Agentes de IA</strong></td>
            <td>Regras determinísticas, árvore de decisão, formato estruturado para consumo automático</td>
          </tr>
          <tr>
            <td><strong>Líderes de DS</strong></td>
            <td>Visão de cobertura, consistência entre Figma e código, auditoria de uso</td>
          </tr>
        </tbody>
      </table>


      <LfHeading as="h2">As 3 superfícies do projeto</LfHeading>
      <LfParagraph>
        O Token Docs gera documentação em <strong>3 lugares diferentes</strong>, todos com os mesmos dados:
      </LfParagraph>

      <div className="do-dont" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="do-box" style={{ background: '#E0ECFC', borderColor: '#076AEA' }}>
          <div className="do-box-t" style={{ color: '#076AEA' }}>Plugin Figma</div>
          <ul>
            <li style={{ color: '#0549A1' }}>Roda dentro do Figma</li>
            <li style={{ color: '#0549A1' }}>Gera boards visuais no canvas</li>
            <li style={{ color: '#0549A1' }}>Audita uso de tokens</li>
            <li style={{ color: '#0549A1' }}>Sugere tokens corretos</li>
          </ul>
        </div>
        <div className="do-box" style={{ background: '#F3E8FF', borderColor: '#603DA2' }}>
          <div className="do-box-t" style={{ color: '#603DA2' }}>Site HTML (esta página)</div>
          <ul>
            <li style={{ color: '#525252' }}>Documentação navegável</li>
            <li style={{ color: '#525252' }}>Consulta de tokens por marca</li>
            <li style={{ color: '#525252' }}>Árvore de decisão interativa</li>
            <li style={{ color: '#525252' }}>Regras para IA</li>
          </ul>
        </div>
        <div className="do-box" style={{ background: '#E5F8DF', borderColor: '#059669' }}>
          <div className="do-box-t" style={{ color: '#059669' }}>Markdown para IA</div>
          <ul>
            <li style={{ color: '#065f46' }}>Formato estruturado</li>
            <li style={{ color: '#065f46' }}>Regras determinísticas</li>
            <li style={{ color: '#065f46' }}>Consumível por agentes</li>
            <li style={{ color: '#065f46' }}>Nomenclaturas normalizadas</li>
          </ul>
        </div>
      </div>


      <LfHeading as="h2">Como tudo se conecta</LfHeading>
      <LfParagraph>
        O segredo do projeto é ter uma <strong>fonte única de verdade</strong>: o arquivo <code>token-schema.json</code>. Tudo parte dele:
      </LfParagraph>
      <pre>{`  token-schema.json          ← Fonte única de verdade
       │
       ▼
  generate-token-docs.js     ← Script que gera tudo
       │
       ├──▶ code.js (constantes ES5)     → Plugin Figma + Boards
       ├──▶ token-docs-data.json         → Este site HTML
       └──▶ token-docs-ai.md            → Markdown para IA`}</pre>
      <LfParagraph>
        Quando alguém edita o <code>token-schema.json</code> e roda o script, as 3 superfícies são atualizadas automaticamente.
        Isso garante que nunca haja informação desatualizada em nenhum lugar.
      </LfParagraph>


      <LfHeading as="h2">Estrutura de arquivos</LfHeading>
      <table>
        <thead>
          <tr><th>Arquivo</th><th>O que faz</th><th>Quem edita</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>token-schema.json</code></td>
            <td>Define grupos, regras, exemplos, árvore de decisão</td>
            <td>Time de DS</td>
          </tr>
          <tr>
            <td><code>scripts/generate-token-docs.js</code></td>
            <td>Lê o schema e gera os 3 artefatos</td>
            <td>Desenvolvedor (raro)</td>
          </tr>
          <tr>
            <td><code>code.js</code></td>
            <td>Lógica do plugin Figma</td>
            <td>Desenvolvedor</td>
          </tr>
          <tr>
            <td><code>ui.html</code></td>
            <td>Interface visual do plugin</td>
            <td>Desenvolvedor</td>
          </tr>
          <tr>
            <td><code>docs/index.html</code></td>
            <td>Este site de documentação</td>
            <td>Desenvolvedor</td>
          </tr>
          <tr>
            <td><code>docs/token-docs-data.json</code></td>
            <td>Dados gerados para o site</td>
            <td>Gerado automaticamente</td>
          </tr>
          <tr>
            <td><code>docs/token-docs-ai.md</code></td>
            <td>Markdown para IA</td>
            <td>Gerado automaticamente</td>
          </tr>
          <tr>
            <td><code>manifest.json</code></td>
            <td>Configuração do plugin Figma</td>
            <td>Desenvolvedor (raro)</td>
          </tr>
        </tbody>
      </table>


      <LfHeading as="h2">As 8 marcas do Lift DS</LfHeading>
      <LfParagraph>
        O Design System atende 8 marcas educacionais, cada uma com sua paleta de cores e identidade visual.
        Cada marca tem 2 modos: <strong>Default</strong> e <strong>High Contrast</strong>.
      </LfParagraph>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {[
          { id: 'estacio', brandsKey: 'estacio', name: 'Estácio' },
          { id: 'wyden', brandsKey: 'wyden', name: 'Wyden' },
          { id: 'yduqs', brandsKey: 'yduqs', name: 'YDUQS' },
          { id: 'ibmec', brandsKey: 'ibmec', name: 'Ibmec' },
          { id: 'idomed', brandsKey: 'idomed', name: 'Idomed' },
          { id: 'damasio', brandsKey: 'damasio', name: 'Damásio' },
          { id: 'ensineme', brandsKey: 'ensine-me', name: 'Ensine.me' },
          { id: 'estacio-ct', brandsKey: 'estacio-ct', name: 'Est. Técnico' },
        ].map((brand) => {
          const logo = BRAND_LOGOS[brand.id];
          const tokens = BRANDS[brand.brandsKey]?.default || {};
          const primary = tokens.LfThmBrandColorPrimary500;
          const secondary = tokens.LfThmBrandColorSecondary500;
          const tertiary = tokens.LfThmBrandColorTertiary500;
          return (
            <div key={brand.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              {logo ? (
                <div
                  style={{ height: '32px', width: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  dangerouslySetInnerHTML={{ __html: logo.positive }}
                />
              ) : (
                <div style={{ height: '32px', width: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px', color: '#171717' }}>
                  {brand.name}
                </div>
              )}
              <div style={{ display: 'flex', gap: '3px' }}>
                {primary && <div style={{ width: '20px', height: '12px', borderRadius: '3px', background: primary, border: '1px solid rgba(0,0,0,.08)' }} title="Primary" />}
                {secondary && <div style={{ width: '20px', height: '12px', borderRadius: '3px', background: secondary, border: '1px solid rgba(0,0,0,.08)' }} title="Secondary" />}
                {tertiary && <div style={{ width: '20px', height: '12px', borderRadius: '3px', background: tertiary, border: '1px solid rgba(0,0,0,.08)' }} title="Tertiary" />}
              </div>
            </div>
          );
        })}
      </div>

      <LfHeading as="h2">Os 6 grupos semânticos</LfHeading>
      <LfParagraph>
        Os tokens de uso (Usage Tokens) são organizados em 6 grupos baseados no <strong>comportamento do elemento</strong>, não na sua aparência:
      </LfParagraph>
      <table>
        <thead>
          <tr><th>Grupo</th><th>Quando usar</th><th>Exemplo</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong style={{ color: '#076AEA' }}>Dynamic</strong></td>
            <td>Elemento que dispara ação ou muda a navegação</td>
            <td>Botão de submit, CTA</td>
          </tr>
          <tr>
            <td><strong style={{ color: '#603DA2' }}>Interactive</strong></td>
            <td>Elemento que responde a interação local</td>
            <td>Accordion, Tabs</td>
          </tr>
          <tr>
            <td><strong style={{ color: '#059669' }}>Static</strong></td>
            <td>Elemento visual sem interação</td>
            <td>Card, Banner, Alerta</td>
          </tr>
          <tr>
            <td><strong style={{ color: '#d97706' }}>Inputable</strong></td>
            <td>Elemento que coleta dados do usuário</td>
            <td>Input, Checkbox, Select</td>
          </tr>
          <tr>
            <td><strong style={{ color: '#6b7280' }}>Core</strong></td>
            <td>Tokens fundamentais (não usar direto em UI)</td>
            <td>Texto, Borda, Link</td>
          </tr>
          <tr>
            <td><strong style={{ color: '#525252' }}>Elevation</strong></td>
            <td>Camadas elevadas com sombra</td>
            <td>Modal, Drawer, Popover</td>
          </tr>
        </tbody>
      </table>

      <LfAlert variant="info">
        Não sabe qual grupo usar? Vá até a seção{' '}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('engine'); }}
          style={{ color: '#076AEA', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Decision Engine
        </a>{' '}
        e responda as perguntas — o sistema escolhe para você.
      </LfAlert>
    </div>
  );
}
