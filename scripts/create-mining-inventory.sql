-- Tabela para armazenar os minerios coletados por cada jogador
CREATE TABLE IF NOT EXISTS mining_inventory (
  id              uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  username        text          NOT NULL UNIQUE,
  coal            integer       NOT NULL DEFAULT 0,
  raw_iron        integer       NOT NULL DEFAULT 0,
  raw_copper      integer       NOT NULL DEFAULT 0,
  lapis_lazuli    integer       NOT NULL DEFAULT 0,
  raw_gold        integer       NOT NULL DEFAULT 0,
  redstone        integer       NOT NULL DEFAULT 0,
  diamond         integer       NOT NULL DEFAULT 0,
  emerald         integer       NOT NULL DEFAULT 0,
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

-- Trigger para atualizar updated_at automaticamente
-- (usa a mesma funcao set_updated_at criada anteriormente)
DROP TRIGGER IF EXISTS trg_mining_inventory_updated_at ON mining_inventory;
CREATE TRIGGER trg_mining_inventory_updated_at
  BEFORE UPDATE ON mining_inventory
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Index para busca rapida por username
CREATE INDEX IF NOT EXISTS idx_mining_inventory_username ON mining_inventory (username);
