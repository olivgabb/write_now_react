# Minuta

Front-end para um agente que lê editais (PDF ou HTML) e propõe soluções para o problema descrito. Feito com Vite, React e TypeScript.

O nome "Minuta" é provisório. Troque em `src/config.ts` (`APP_NAME`).

## Telas

1. **Login** (`/login`): e-mail e senha.
2. **Link do edital** (`/`): saudação ao usuário, campo para a URL e histórico de editais em cartões (com miniatura, tag de estado e "editado há…").
3. **Chat de propostas** (`/edital/:id`): o agente lê o edital, apresenta propostas e continua a conversa para ajustes.

## Como rodar

```bash
npm install
cp .env.example .env
npm run dev
```

Abra http://localhost:5173. Por padrão o projeto roda em **modo demonstração** (`VITE_USE_MOCK=true`): qualquer e-mail e senha entram, e o agente devolve três propostas de exemplo. Os dados ficam no `localStorage` do navegador.

Outros comandos: `npm run typecheck`, `npm run build`, `npm run preview`.

## Conectar ao backend

Defina `VITE_USE_MOCK=false` no `.env`. Em desenvolvimento, chamadas a `/api/*` são encaminhadas para `VITE_PROXY_TARGET` (padrão `http://localhost:8000`) com o prefixo `/api` removido. Em produção, sirva a API em `/api` ou defina `VITE_API_URL`.

Todas as chamadas estão em `src/services/api.ts`. O token JWT vai no cabeçalho `Authorization: Bearer ...`. Uma resposta 401 encerra a sessão.

| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| POST | `/auth/login` | `{ email, senha }` | `{ token, usuario: { id, nome, email } }` |
| GET | `/editais` | | `Edital[]` |
| POST | `/editais` | `{ url }` | `Edital` |
| GET | `/editais/:id` | | `Edital` |
| GET | `/editais/:id/mensagens` | | `Mensagem[]` |
| POST | `/editais/:id/propostas` | | `Mensagem` (agente lê o edital e propõe) |
| POST | `/editais/:id/mensagens` | `{ texto }` | `Mensagem` (resposta do agente) |

Os tipos `Edital`, `Mensagem` e `Proposta` estão em `src/types.ts`.

O `Edital` carrega o estado exibido nas tags: `status` (`analisando`, `propostas`, `ajustando` ou `erro`), `totalPropostas` (opcional), `criadoEm` e `atualizadoEm`. O backend deve atualizar `status` e `atualizadoEm` a cada mudança, e `GET /editais` deve devolver a lista (o front ordena por `atualizadoEm`). O nome do usuário na saudação vem de `usuario.nome` no login.

O endpoint `POST /editais/:id/propostas` roda a análise inteira, então pode demorar. A tela mostra "Lendo o edital…" enquanto espera. Se a análise levar mais de um minuto, vale trocar por processamento assíncrono com polling ou streaming (SSE).

## Estrutura

```
src/
  auth/         AuthContext e ProtectedRoute
  components/   Layout, Carimbo, PropostaCard, EditalCard, StatusTag
  pages/        LoginPage, EditalPage, ChatPage
  services/     api (backend real), mock (demonstração), session (token)
  config.ts     nome do app e variáveis de ambiente
  styles.css    identidade visual
```
