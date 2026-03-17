# Setup do Supabase

Para colocar a aplicação online no Vercel com Supabase, siga estes passos:

## 1. Criar a Tabela de Inventário

Acesse o **Supabase Console** → **SQL Editor** e execute este comando:

```sql
-- Tabela para armazenar os minerios e itens coletados por cada jogador
CREATE TABLE IF NOT EXISTS mining_inventory (
  id              uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  username        text          NOT NULL UNIQUE,
  -- Minerios
  coal            integer       NOT NULL DEFAULT 0,
  raw_iron        integer       NOT NULL DEFAULT 0,
  raw_copper      integer       NOT NULL DEFAULT 0,
  lapis_lazuli    integer       NOT NULL DEFAULT 0,
  raw_gold        integer       NOT NULL DEFAULT 0,
  redstone        integer       NOT NULL DEFAULT 0,
  diamond         integer       NOT NULL DEFAULT 0,
  emerald         integer       NOT NULL DEFAULT 0,
  -- Itens de dungeon
  string          integer       NOT NULL DEFAULT 0,
  rotten_flesh    integer       NOT NULL DEFAULT 0,
  bone            integer       NOT NULL DEFAULT 0,
  wheat           integer       NOT NULL DEFAULT 0,
  gunpowder       integer       NOT NULL DEFAULT 0,
  iron_ingot      integer       NOT NULL DEFAULT 0,
  gold_ingot      integer       NOT NULL DEFAULT 0,
  slimeball       integer       NOT NULL DEFAULT 0,
  bucket          integer       NOT NULL DEFAULT 0,
  name_tag        integer       NOT NULL DEFAULT 0,
  saddle          integer       NOT NULL DEFAULT 0,
  music_disc      integer       NOT NULL DEFAULT 0,
  golden_apple    integer       NOT NULL DEFAULT 0,
  enchanted_golden_apple integer NOT NULL DEFAULT 0,
  iron_horse_armor integer      NOT NULL DEFAULT 0,
  gold_horse_armor integer      NOT NULL DEFAULT 0,
  diamond_horse_armor integer   NOT NULL DEFAULT 0,
  enchantment_book integer      NOT NULL DEFAULT 0,
  experience_bottle integer     NOT NULL DEFAULT 0,
  -- Timestamps
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

-- Index para busca rapida por username
CREATE INDEX IF NOT EXISTS idx_mining_inventory_username ON mining_inventory (username);
```

## 2. Habilitar Row Level Security (RLS) - Opcional

Se quiser adicionar segurança, você pode habilitar RLS:

```sql
ALTER TABLE mining_inventory ENABLE ROW LEVEL SECURITY;

-- Política para que cada usuario acesse apenas seu inventário
CREATE POLICY "Users can access only their inventory"
  ON mining_inventory
  FOR ALL
  USING (username = current_user_id());
```

## 3. Deploy no Vercel

1. Certifique-se que todas as variáveis de ambiente estão configuradas no Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Push para o GitHub na branch `correcao-de-codigo`

3. O Vercel vai automaticamente:
   - Detectar as mudanças
   - Fazer o build (com `distDir: "dist"`)
   - Deployar a aplicação

4. Acesse sua aplicação em: `https://seu-projeto.vercel.app`

## 4. Verificar se está funcionando

- Faça login na aplicação
- Clique em "Minerar"
- Quebre alguns blocos de minério (carvão, ferro, etc.)
- Abra o Inventário (botão INV)
- Os minerios devem aparecer e ser salvos no Supabase

## Problemas Comuns

### "Could not find the 'mining_inventory' table"
- Execute o SQL acima no Supabase Console

### Erros de coluna no inventário
- Certifique-se que todas as 31 colunas foram criadas (8 minerios + 19 itens de dungeon + 3 timestamp/id/username + 1 username duplicado)

### Salvamento não funciona
- Verifique se as variáveis de ambiente do Supabase estão corretas no Vercel
- Verifique os logs do Vercel em `https://vercel.com/dashboard`
