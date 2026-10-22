# Meu Financeiro

Controle financeiro pessoal: entradas, saídas e saldo mensal.

Next.js 16 (App Router), Prisma 5 e PostgreSQL.

## Variáveis de ambiente

Duas variáveis são obrigatórias. Sem elas o build para no primeiro passo,
com uma mensagem dizendo o que falta.

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | URL de conexão do PostgreSQL. Precisa começar com `postgresql://`. |
| `JWT_SECRET` | Segredo que assina os tokens de login. No mínimo 32 caracteres. |

Copie `.env.example` para `.env` e preencha os valores.

Para gerar um `JWT_SECRET`:

```bash
openssl rand -base64 32
```

### Observações sobre a `DATABASE_URL`

1. Cole apenas a URL. Provedores como o Neon mostram a conexão dentro de um
   comando `psql '...'`. Se você colar a linha inteira, o valor começa com
   `psql` e o Prisma recusa.
2. Não use aspas em volta do valor.
3. Use o papel dono do banco, por exemplo `neondb_owner` no Neon. Papéis
   restritos como `authenticator` não podem criar tabelas, então a migração
   falha.
4. Use a conexão direta, não a agrupada. No Neon, desligue a opção
   "Connection pooling". A URL agrupada tem `-pooler` no endereço e migração
   não funciona bem por ela.

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha os valores
npx prisma migrate dev
npm run dev
```

A aplicação sobe em `http://localhost:3000`.

## Deploy

O script de build cuida de tudo, nesta ordem:

```
node scripts/check-env.mjs   # valida as variáveis e falha cedo
prisma generate              # gera o cliente do Prisma
prisma migrate deploy        # aplica as migrações no banco
next build                   # compila a aplicação
```

Em um provedor como a Vercel, basta definir `DATABASE_URL` e `JWT_SECRET`
antes do primeiro deploy. As tabelas são criadas pelo próprio deploy.

## Estrutura

```
app/
  (auth)/login, (auth)/register   telas de acesso
  dashboard                       resumo do mês e histórico
  transactions                    cadastro e listagem
  api/                            rotas de autenticação e dados
lib/
  prisma.ts                       instância única do Prisma
  serialize.ts                    converte Decimal para número na API
prisma/
  schema.prisma                   modelos User e Transaction
  migrations/                     migrações do PostgreSQL
scripts/
  check-env.mjs                   validação de ambiente
```

### Sobre valores monetários

`Transaction.amount` é `Decimal` no banco, com precisão `NUMERIC(10,2)`,
para que somas não acumulem erro de arredondamento.

O Prisma devolve esse campo como um objeto `Decimal`, que o JSON converte em
texto. Por isso `lib/serialize.ts` converte para número na saída da API. Toda
rota que devolve transações passa por ele, e o navegador sempre recebe
número.
