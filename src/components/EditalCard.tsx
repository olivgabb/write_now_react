import { Link } from 'react-router-dom'
import type { Edital } from '../types'
import { formatoDe, hostDe, tempoRelativo } from '../utils'
import StatusTag from './StatusTag'

// Miniatura da "primeira página" do edital, como no histórico do Google Docs.
// É uma ilustração: o conteúdo real do documento não é exibido aqui.
function Miniatura({ edital }: { edital: Edital }) {
  const comPropostas = edital.status === 'propostas' || edital.status === 'ajustando'
  return (
    <div className="miniatura" aria-hidden="true">
      <div className="miniatura-folha">
        <span className="miniatura-formato">{formatoDe(edital.url)}</span>
        <span className="miniatura-titulo">{edital.titulo}</span>
        <span className="miniatura-linha" style={{ width: '100%' }} />
        <span className="miniatura-linha" style={{ width: '86%' }} />
        <span className="miniatura-linha" style={{ width: '64%' }} />
        {comPropostas && (
          <span className="miniatura-blocos">
            <i />
            <i />
            <i />
          </span>
        )}
      </div>
    </div>
  )
}

export default function EditalCard({ edital }: { edital: Edital }) {
  const quantas = edital.totalPropostas

  return (
    <Link to={`/edital/${edital.id}`} className="edital-card">
      <Miniatura edital={edital} />
      <div className="edital-card-corpo">
        <StatusTag status={edital.status} />
        <h3>{edital.titulo}</h3>
        <p className="edital-card-meta">
          {hostDe(edital.url)}
          {quantas ? ` – ${quantas} ${quantas === 1 ? 'proposta' : 'propostas'}` : ''}
        </p>
        <p className="edital-card-editado">Editado {tempoRelativo(edital.atualizadoEm)}</p>
      </div>
    </Link>
  )
}
