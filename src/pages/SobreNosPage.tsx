import { Link } from 'react-router-dom'
import { APP_NAME } from '../config'

const publicos = [
  {
    numero: '01',
    titulo: 'MEIs e empreendedores',
    descricao:
      'Transforme uma ideia em um projeto organizado, sem precisar dominar a linguagem dos editais ou depender de consultorias caras.',
    etiqueta: 'Do primeiro passo à proposta',
  },
  {
    numero: '02',
    titulo: 'Artistas e produtores culturais',
    descricao:
      'Organize portfólios, fichas técnicas e propostas de acordo com as exigências de editais culturais e audiovisuais.',
    etiqueta: 'Cultura e criação',
  },
  {
    numero: '03',
    titulo: 'Startups, OSCs e pesquisadores',
    descricao:
      'Estruture iniciativas de inovação, pesquisa e impacto social com objetivos e indicadores alinhados aos critérios de avaliação.',
    etiqueta: 'Inovação e impacto',
  },
  {
    numero: '04',
    titulo: 'Empresas e prefeituras',
    descricao:
      'Padronize documentos de diferentes equipes e mantenha unidade de linguagem e conformidade em projetos de captação.',
    etiqueta: 'Escala e padronização',
  },
]

const etapas = [
  {
    numero: '01',
    titulo: 'Entenda o edital',
    descricao:
      'A plataforma analisa o documento da chamada, identifica critérios de pontuação, estrutura, prazos e exigências obrigatórias.',
  },
  {
    numero: '02',
    titulo: 'Defina sua identidade',
    descricao:
      'Escolha o contexto de escrita — como Cultura ou Inovação — e use projetos anteriores como referência de linguagem e vocabulário.',
  },
  {
    numero: '03',
    titulo: 'Escreva com orientação',
    descricao:
      'Desenvolva sua proposta com o apoio de um agente de IA que aponta lacunas, inconsistências e ambiguidades durante a redação.',
  },
]

export default function SobreNosPage() {
  return (
    <div className="sobre-pagina">
      <div className="sobre-conteudo">
        <Link to="/" className="sobre-voltar">
          <span aria-hidden="true">←</span> Voltar para os editais
        </Link>

        <header className="sobre-hero">
          <span className="sobre-selo">CONHEÇA A PLATAFORMA</span>
          <h1>Boas ideias merecem <span>projetos bem escritos.</span></h1>
          <p className="sobre-lead">
            A {APP_NAME} usa inteligência artificial para simplificar a escrita de projetos para editais.
            Menos tempo tentando decifrar exigências, mais clareza para tirar ideias do papel.
          </p>
          <div className="sobre-resumo">
            <p>
              Analisamos as regras de cada chamada e acompanhamos sua redação, ajudando a construir
              propostas mais claras, organizadas e alinhadas ao que cada edital solicita.
            </p>
          </div>
        </header>

        <section className="sobre-secao" aria-labelledby="sobre-publico-titulo">
          <div className="sobre-cabecalho-secao">
            <span className="sobre-selo">PARA QUEM É</span>
            <h2 id="sobre-publico-titulo">Diferentes ideias. Um caminho mais simples.</h2>
            <p>Uma ferramenta para quem escreve projetos individualmente e para equipes que precisam trabalhar em conjunto.</p>
          </div>
          <div className="sobre-publicos">
            {publicos.map((publico) => (
              <article className="sobre-publico-card" key={publico.numero}>
                <div className="sobre-card-topo">
                  <span className="sobre-numero">{publico.numero}</span>
                  <span className="sobre-etiqueta">{publico.etiqueta}</span>
                </div>
                <h3>{publico.titulo}</h3>
                <p>{publico.descricao}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="sobre-secao sobre-como-funciona" aria-labelledby="sobre-como-titulo">
          <div className="sobre-cabecalho-secao">
            <span className="sobre-selo">COMO FUNCIONA</span>
            <h2 id="sobre-como-titulo">Da leitura do edital à proposta final.</h2>
            <p>O processo é dividido em etapas para que você tenha orientação sem perder o controle da sua ideia.</p>
          </div>
          <ol className="sobre-etapas">
            {etapas.map((etapa) => (
              <li className="sobre-etapa" key={etapa.numero}>
                <span className="sobre-etapa-numero">{etapa.numero}</span>
                <div>
                  <h3>{etapa.titulo}</h3>
                  <p>{etapa.descricao}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="sobre-fechamento">
          <div>
            <span className="sobre-selo">SEU PRÓXIMO PROJETO COMEÇA AQUI</span>
            <h2>Você traz a ideia. A {APP_NAME} ajuda com o caminho.</h2>
            <p>Volte à área de editais e comece a transformar uma chamada em uma proposta estruturada.</p>
          </div>
          <Link to="/" className="botao botao-primario">Ir para os editais <span aria-hidden="true">→</span></Link>
        </section>

        <footer className="sobre-rodape">{APP_NAME} <span>•</span> Inteligência artificial a serviço de boas ideias.</footer>
      </div>
    </div>
  )
}
