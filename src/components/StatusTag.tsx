import type { StatusEdital } from '../types'

export const ROTULO_STATUS: Record<StatusEdital, string> = {
  analisando: 'Em análise',
  propostas: 'Propostas prontas',
  ajustando: 'Em ajuste',
  erro: 'Falha na leitura',
}

// O estado é sempre dito por texto; a cor só reforça.
export default function StatusTag({ status }: { status: StatusEdital }) {
  return (
    <span className={`tag tag-${status}`}>
      <span className="tag-ponto" aria-hidden="true" />
      {ROTULO_STATUS[status]}
    </span>
  )
}
