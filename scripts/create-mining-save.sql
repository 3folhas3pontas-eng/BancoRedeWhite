-- ============================================================
-- Tabela: mining_save
-- Salva o progresso do jogo de mineração por jogador (username)
-- ============================================================

CREATE TABLE IF NOT EXISTS mining_save (
  id              uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  username        text          NOT NULL UNIQUE,

  -- Progresso geral
  money           bigint        NOT NULL DEFAULT 0,
  xp              bigint        NOT NULL DEFAULT 0,
  level           integer       NOT NULL DEFAULT 1,
  depth           integer       NOT NULL DEFAULT 0,   -- profundidade SALVA (onde o jogador continua)
  blocks_mined    bigint        NOT NULL DEFAULT 0,

  -- Picareta
  pickaxe_tier    text          NOT NULL DEFAULT 'wood'
                    CHECK (pickaxe_tier IN ('wood','stone','iron','gold','diamond','netherite')),
  pick_strength   numeric(8,3)  NOT NULL DEFAULT 1,
  pick_speed      numeric(8,3)  NOT NULL DEFAULT 1,

  -- Upgrades de spawn / raio
  tnt_radius      integer       NOT NULL DEFAULT 1,
  tnt_spawn       numeric(8,4)  NOT NULL DEFAULT 0.02,
  beacon_spawn    numeric(8,4)  NOT NULL DEFAULT 0.01,
  dungeon_spawn   numeric(8,4)  NOT NULL DEFAULT 0.005,
  chest_spawn     numeric(8,4)  NOT NULL DEFAULT 0.03,

  -- Combo
  max_combo       integer       NOT NULL DEFAULT 0,

  -- Encantamentos ativos (array de IDs, ex: ["eff_1","fort_2"])
  enchantments    jsonb         NOT NULL DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now()
);

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mining_save_updated_at ON mining_save;
CREATE TRIGGER trg_mining_save_updated_at
  BEFORE UPDATE ON mining_save
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Índice para busca rápida por username
CREATE INDEX IF NOT EXISTS idx_mining_save_username ON mining_save (username);

-- RLS: cada jogador só acessa o próprio save (opcional mas recomendado)
-- ALTER TABLE mining_save ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "own_save" ON mining_save USING (username = current_user);
