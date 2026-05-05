import React from 'react';
import LfHeading from '@lift/ds-web/components/LfHeading/';

const TERMS = [
  { term: 'A11y', def: 'Abreviação de "accessibility" (acessibilidade), refere-se a práticas que garantem que produtos sejam acessíveis para todas as pessoas.' },
  { term: 'Alias Token', def: 'Token que faz referência a outro token mais genérico, agregando um significado semântico, como color-primary = color-blue-500.' },
  { term: 'Assets', def: 'Recursos visuais e de design, como ícones, imagens, logotipos e fontes que são utilizados nos componentes para a construção de interfaces.' },
  { term: 'Atomic Design', def: 'Metodologia que organiza interfaces em átomos, moléculas, organismos, templates e páginas, promovendo reutilização e consistência.' },
  { term: 'Bibliotecas', def: 'Coleções organizadas de componentes, padrões ou ícones, usadas para agilizar o desenvolvimento e manter consistência.' },
  { term: 'Breakpoints', def: 'Pontos de corte que definem mudanças no layout da interface com base na largura da tela para garantir responsividade.' },
  { term: 'Component Tokens', def: 'Tokens aplicados a componentes específicos, definindo estilos como cor e espaçamento para cada estado do componente.' },
  { term: 'Componentes', def: 'Elementos funcionais reutilizáveis de uma interface, como botões, modais ou campos de formulário.' },
  { term: 'Content Design System', def: 'Sistema que define diretrizes para conteúdo e comunicação, garantindo tom, voz e consistência textual em todas as interfaces.' },
  { term: 'Design Ops', def: 'Práticas operacionais que otimizam processos e ferramentas para integrar melhor o trabalho de design com outras equipes.' },
  { term: 'Design Principles', def: 'Princípios orientadores que definem os valores e prioridades de um projeto ou produto.' },
  { term: 'Design System', def: 'Conjunto de diretrizes, componentes e recursos espelhados em design e tecnologia que garantem consistência e eficiência na construção de interfaces.' },
  { term: 'Design Tokens', def: 'Valores reutilizáveis e espelhados em design e tecnologia que representam decisões de design, como cores e espaçamentos, usados para criar consistência entre plataformas.' },
  { term: 'Figma', def: 'Ferramenta de design colaborativa utilizada nos projetos da YDUQS.' },
  { term: 'Gap', def: 'Espaçamento entre elementos internos de um mesmo container, especialmente em layouts baseados em grid ou flexbox. Define a distância entre itens filhos, como botões em um grupo ou cards em uma grade. Os tokens de gap garantem espaçamentos uniformes em componentes compostos.' },
  { term: 'Grid', def: 'Sistema de organização espacial que define alinhamento e estrutura da interface por meio de linhas e colunas.' },
  { term: 'Guidelines', def: 'Conjunto de diretrizes que orientam o uso e aplicação de componentes, estilos e práticas no design system.' },
  { term: 'Handoff', def: 'Etapa em que designers entregam especificações e assets para os desenvolvedores implementarem a interface.' },
  { term: 'Lift DS', def: 'Design System da YDUQS.' },
  { term: 'Margin', def: 'Espaço externo entre a borda de um elemento e os elementos ao seu redor. Serve para separar visualmente componentes distintos e controlar o espaçamento entre eles. Os tokens de margin padronizam essas distâncias externas.' },
  { term: 'Padding', def: 'Espaço interno entre o conteúdo de um elemento e sua borda. Usado para criar respiro interno, garantindo que o conteúdo não fique colado nas extremidades do componente. Os tokens de padding definem escalas padronizadas de preenchimento interno.' },
  { term: 'Patterns', def: 'Padrões recorrentes de design que resolvem problemas comuns de usabilidade e layout.' },
  { term: 'Primitive Tokens', def: 'Tokens básicos e genéricos, como cores e espaçamentos, que servem de base para tokens mais complexos.' },
  { term: 'Responsive Design', def: 'Prática de design que garante que a interface se adapte a diferentes tamanhos de dispositivos.' },
  { term: 'Semantic Tokens', def: 'Tokens que comunicam a intenção ou função de um estilo, como color-error.' },
  { term: 'Single Source of Truth', def: 'Fonte única e centralizada de informações para garantir que todas as partes do projeto utilizem dados consistentes e atualizados.' },
  { term: 'Storybook', def: 'Ferramenta que permite visualizar e testar componentes de forma isolada, facilitando o desenvolvimento e documentação.' },
  { term: 'Style Guide', def: 'Documento que define diretrizes de estilo, como paleta de cores, tipografia e branding, para garantir consistência visual.' },
  { term: 'Team Components', def: 'Componentes criados pelas equipes que garantem o nível de personalização necessário para a criação de cada produto.' },
  { term: 'UI Kit', def: 'Conjunto de componentes visuais e de interface prontos para uso em design, facilitando o desenvolvimento rápido de protótipos.' },
  { term: 'Versionamento', def: 'Controle e gestão de diferentes versões do design system, garantindo rastreabilidade e continuidade na evolução do projeto.' },
];

export default function Glossary() {
  return (
    <div>
      <LfHeading as="h1">Glossário</LfHeading>
      <p className="subtitle">Termos e definições utilizados no Lift Design System.</p>

      <table>
        <thead>
          <tr><th style={{ width: 200 }}>Termo</th><th>Definição</th></tr>
        </thead>
        <tbody>
          {TERMS.map((t) => (
            <tr key={t.term}>
              <td><strong>{t.term}</strong></td>
              <td>{t.def}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
