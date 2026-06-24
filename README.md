# 7a0 Scout

Catálogo de elencos do jogo [7a0](https://7a0.com.br) com as forças reais do modo
clássico (valores de 1 a 99). O banco é alimentado por capturas de tela do jogo,
processadas via Claude Vision e enviadas para as rotas de API descritas abaixo.

## Stack

- Next.js 14 (App Router) + TypeScript
- Supabase (Postgres) como banco
- Tailwind CSS (tema escuro, accent verde-campo)

## Como rodar

1. **Crie um projeto no [Supabase](https://supabase.com)** e rode o SQL de
   `supabase/schema.sql` no SQL Editor para criar `squads`, `players` e a view
   `squad_stats`.

2. **Configure as variáveis de ambiente**:

   ```bash
   cp .env.local.example .env.local
   ```

   Preencha:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` *(usada apenas server-side nas rotas `/api/*`)*

3. **Instale e rode**:

   ```bash
   npm install
   npm run dev
   ```

   App em `http://localhost:3000`.

## Páginas

| Rota                       | Descrição                                                          |
| -------------------------- | ------------------------------------------------------------------- |
| `/`                        | Lista de elencos ordenada por força média. Filtros: posição, copa, busca. |
| `/squad/[sel]/[copa]`      | Elenco completo com barra de força, distribuição por posição e badge de lenda. |
| `/players`                 | Ranking global de jogadores cadastrados.                            |
| `/admin`                   | Importar squad (cola JSON) e atualizar forças manualmente.         |

## API

### `POST /api/import`

Aceita o JSON exato da API do 7a0. O campo `f` é **ignorado** (não é a força real).

```json
{
  "sel": "BRA",
  "copa": 2022,
  "squad": [
    {
      "playerId": "neymar",
      "name": "Neymar",
      "positions": ["PE", "CA"],
      "number": 10,
      "legend": true
    }
  ]
}
```

Faz upsert por `(sel, copa)` e `(squad_id, player_id)`. Resposta:

```json
{ "ok": true, "sel": "BRA", "copa": 2022, "inserted_or_updated": 23 }
```

### `POST /api/update-force`

Atualiza apenas o campo `force` dos jogadores informados.

```json
{
  "sel": "BRA",
  "copa": 2022,
  "players": [
    { "playerId": "neymar", "force": 92 },
    { "playerId": "vinicius-junior", "force": 97 }
  ]
}
```

Valores devem ser inteiros de 1–99, ou `null` para limpar. Resposta:

```json
{ "ok": true, "updated": 2, "received": 2 }
```

## Notas

- O campo `f` que vem na API do 7a0 é ruído de seed — nunca usado.
- A mesma `playerId` pode aparecer em copas diferentes; a chave única é
  `(playerId, sel, copa)` via `(squad_id, player_id)`.
- O Admin destaca em amarelo os elencos com jogadores sem força cadastrada.
- A barra de força usa três faixas: vermelho `1–49`, amarelo `50–74`,
  verde `75–99`.
