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

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS trg_mining_inventory_updated_at ON mining_inventory;
CREATE TRIGGER trg_mining_inventory_updated_at
  BEFORE UPDATE ON mining_inventory
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Index para busca rapida por username
CREATE INDEX IF NOT EXISTS idx_mining_inventory_username ON mining_inventory (username);
