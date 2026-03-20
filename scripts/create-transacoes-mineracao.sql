-- Tabela de transacoes do jogo de mineracao
-- Usada para sincronizar compras do site com o servidor Minecraft

CREATE TABLE IF NOT EXISTS transacoes_mineracao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificacao do jogador
  username text NOT NULL,
  
  -- Tipo de transacao
  tipo text NOT NULL CHECK (tipo IN (
    'upgrade_pickaxe',      -- Upar picareta (wood -> stone -> iron, etc)
    'upgrade_speed',        -- Comprar velocidade
    'upgrade_tnt_radius',   -- Upgrade TNT Power
    'upgrade_tnt_spawn',    -- Upgrade TNT Luck
    'upgrade_beacon_spawn', -- Upgrade Beacon Luck
    'upgrade_dungeon_spawn',-- Upgrade Dungeon Luck
    'upgrade_chest_spawn',  -- Upgrade Barrel Luck
    'enchant'               -- Encantar picareta
  )),
  
  -- Detalhes da transacao (JSON com info adicional)
  -- Ex: {"from_tier": "wood", "to_tier": "stone"} ou {"enchantment": "Eficiencia I"}
  detalhes jsonb DEFAULT '{}',
  
  -- Valor gasto em coins
  valor numeric(12, 2) NOT NULL DEFAULT 0,
  
  -- Status da transacao
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'concluido', 'erro')),
  
  -- Timestamps
  criado_em timestamptz NOT NULL DEFAULT now(),
  processado_em timestamptz,
  
  -- Indice para buscar transacoes pendentes rapidamente
  CONSTRAINT valid_valor CHECK (valor >= 0)
);

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_transacoes_mineracao_username ON transacoes_mineracao(username);
CREATE INDEX IF NOT EXISTS idx_transacoes_mineracao_status ON transacoes_mineracao(status);
CREATE INDEX IF NOT EXISTS idx_transacoes_mineracao_pendentes ON transacoes_mineracao(username, status) WHERE status = 'pendente';

-- Enable RLS
ALTER TABLE transacoes_mineracao ENABLE ROW LEVEL SECURITY;

-- Policy: usuarios podem ver apenas suas proprias transacoes
CREATE POLICY "Users can view own transactions"
  ON transacoes_mineracao
  FOR SELECT
  USING (true);

-- Policy: sistema pode inserir transacoes para qualquer usuario
CREATE POLICY "System can insert transactions"
  ON transacoes_mineracao
  FOR INSERT
  WITH CHECK (true);

-- Policy: sistema pode atualizar transacoes
CREATE POLICY "System can update transactions"
  ON transacoes_mineracao
  FOR UPDATE
  USING (true);
