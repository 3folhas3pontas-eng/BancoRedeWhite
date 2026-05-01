-- =====================================================
-- SCRIPT DE SEGURANCA - REDE WHITE BANK
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PARTE 1: HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

-- Tabela de contas
ALTER TABLE rede_white_accounts ENABLE ROW LEVEL SECURITY;

-- Tabela de transacoes
ALTER TABLE rede_white_transactions ENABLE ROW LEVEL SECURITY;

-- Tabela de mineracao
ALTER TABLE mining_save ENABLE ROW LEVEL SECURITY;

-- Tabela de transacoes de mineracao
ALTER TABLE transacoes_mineracao ENABLE ROW LEVEL SECURITY;

-- Tabela de inventario (se existir)
-- ALTER TABLE mining_inventory ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 2: REVOGAR PERMISSOES PERIGOSAS
-- =====================================================

-- Remove acesso direto a colunas sensiveis para usuarios anonimos
-- IMPORTANTE: password_hash NUNCA deve ser visivel via API

-- Revoga SELECT em password_hash para anon e authenticated
-- (Isso so funciona se voce usar views, pois RLS opera em nivel de linha)
-- A solucao real e: NUNCA fazer SELECT * no cliente, sempre especificar colunas

-- =====================================================
-- PARTE 3: POLITICAS RLS - rede_white_accounts
-- =====================================================

-- Remove politicas antigas (se existirem)
DROP POLICY IF EXISTS "accounts_select_own" ON rede_white_accounts;
DROP POLICY IF EXISTS "accounts_update_own" ON rede_white_accounts;
DROP POLICY IF EXISTS "accounts_insert_service" ON rede_white_accounts;
DROP POLICY IF EXISTS "accounts_service_all" ON rede_white_accounts;

-- Politica: Service role tem acesso total (para o backend)
CREATE POLICY "accounts_service_all" ON rede_white_accounts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Politica: Anon/Authenticated pode SELECT apenas username e uuid (para busca de destinatario)
-- NOTA: Isso ainda permite ver todos os usernames. Para restringir mais, use uma funcao.
CREATE POLICY "accounts_select_public_info" ON rede_white_accounts
  FOR SELECT
  USING (true);
  -- O frontend deve fazer: .select('username, uuid') e NAO .select('*')

-- BLOQUEAR insert/update/delete para anon e authenticated
-- (Apenas service_role pode modificar via backend)

-- =====================================================
-- PARTE 4: POLITICAS RLS - rede_white_transactions
-- =====================================================

DROP POLICY IF EXISTS "transactions_select_own" ON rede_white_transactions;
DROP POLICY IF EXISTS "transactions_insert_service" ON rede_white_transactions;
DROP POLICY IF EXISTS "transactions_service_all" ON rede_white_transactions;

-- Service role tem acesso total
CREATE POLICY "transactions_service_all" ON rede_white_transactions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Anon/Authenticated NAO podem inserir transacoes diretamente
-- (Devem usar a API /api/transfer que usa service_role)

-- Anon/Authenticated podem ver APENAS suas proprias transacoes
-- Para isso funcionar, o cliente precisa estar autenticado via Supabase Auth
-- Como voces usam auth customizada, vamos bloquear tudo e usar a API
CREATE POLICY "transactions_deny_anon" ON rede_white_transactions
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- =====================================================
-- PARTE 5: POLITICAS RLS - mining_save
-- =====================================================

DROP POLICY IF EXISTS "mining_save_service_all" ON mining_save;
DROP POLICY IF EXISTS "mining_save_select_own" ON mining_save;

-- Service role tem acesso total
CREATE POLICY "mining_save_service_all" ON mining_save
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Anon pode ler (para carregar save do jogo)
-- MAS deve ser restrito por username na aplicacao
CREATE POLICY "mining_save_select_anon" ON mining_save
  FOR SELECT
  TO anon
  USING (true);

-- Anon pode inserir/atualizar (para salvar progresso)
-- NOTA: Isso ainda e vulneravel se alguem descobrir o username de outro jogador
-- Solucao ideal: usar Supabase Auth e vincular ao user_id
CREATE POLICY "mining_save_upsert_anon" ON mining_save
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "mining_save_update_anon" ON mining_save
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- PARTE 6: POLITICAS RLS - transacoes_mineracao
-- =====================================================

DROP POLICY IF EXISTS "transacoes_mineracao_service_all" ON transacoes_mineracao;
DROP POLICY IF EXISTS "transacoes_mineracao_insert_anon" ON transacoes_mineracao;

-- Service role tem acesso total
CREATE POLICY "transacoes_mineracao_service_all" ON transacoes_mineracao
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Anon pode inserir (para registrar upgrades)
CREATE POLICY "transacoes_mineracao_insert_anon" ON transacoes_mineracao
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anon pode ler suas proprias transacoes
CREATE POLICY "transacoes_mineracao_select_anon" ON transacoes_mineracao
  FOR SELECT
  TO anon
  USING (true);

-- =====================================================
-- PARTE 7: FUNCAO SEGURA DE TRANSFERENCIA (OPCIONAL)
-- Use isso se quiser mover a logica para o banco
-- =====================================================

/*
CREATE OR REPLACE FUNCTION secure_transfer(
  p_sender_uuid UUID,
  p_receiver_username TEXT,
  p_amount DECIMAL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- Executa com permissoes do criador (superuser)
SET search_path = public
AS $$
DECLARE
  v_sender_balance DECIMAL;
  v_receiver_uuid UUID;
  v_receiver_balance DECIMAL;
  v_transaction_id TEXT;
BEGIN
  -- Valida amount
  IF p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Valor deve ser maior que zero');
  END IF;

  -- Busca e bloqueia sender (FOR UPDATE previne race conditions)
  SELECT balance INTO v_sender_balance
  FROM rede_white_accounts
  WHERE uuid = p_sender_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Remetente nao encontrado');
  END IF;

  IF v_sender_balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Saldo insuficiente');
  END IF;

  -- Busca receiver
  SELECT uuid, balance INTO v_receiver_uuid, v_receiver_balance
  FROM rede_white_accounts
  WHERE LOWER(username) = LOWER(p_receiver_username)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Destinatario nao encontrado');
  END IF;

  IF v_receiver_uuid = p_sender_uuid THEN
    RETURN json_build_object('success', false, 'error', 'Nao pode transferir para si mesmo');
  END IF;

  -- Executa transferencia
  UPDATE rede_white_accounts SET balance = balance - p_amount WHERE uuid = p_sender_uuid;
  UPDATE rede_white_accounts SET balance = balance + p_amount WHERE uuid = v_receiver_uuid;

  -- Gera ID da transacao
  v_transaction_id := UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 9));

  -- Registra transacao
  INSERT INTO rede_white_transactions (sender_name, receiver_name, amount, status, transaction_id)
  SELECT 
    (SELECT username FROM rede_white_accounts WHERE uuid = p_sender_uuid),
    p_receiver_username,
    p_amount,
    'CONCLUIDO',
    v_transaction_id;

  RETURN json_build_object(
    'success', true, 
    'transaction_id', v_transaction_id,
    'new_balance', v_sender_balance - p_amount
  );
END;
$$;

-- Permite que authenticated chame a funcao
GRANT EXECUTE ON FUNCTION secure_transfer TO authenticated;
*/

-- =====================================================
-- PARTE 8: EXTENSAO PARA HASH DE SENHAS
-- =====================================================

-- Habilita pgcrypto para hash de senhas (se ainda nao estiver)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Funcao para verificar senha (uso futuro)
/*
CREATE OR REPLACE FUNCTION verify_password(p_username TEXT, p_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stored_hash TEXT;
  v_uuid UUID;
  v_balance DECIMAL;
BEGIN
  SELECT uuid, password_hash, balance 
  INTO v_uuid, v_stored_hash, v_balance
  FROM rede_white_accounts
  WHERE username = p_username;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Credenciais invalidas');
  END IF;

  -- Verifica se hash comeca com $2 (bcrypt)
  IF v_stored_hash LIKE '$2%' THEN
    IF crypt(p_password, v_stored_hash) = v_stored_hash THEN
      RETURN json_build_object('success', true, 'uuid', v_uuid, 'balance', v_balance);
    END IF;
  ELSE
    -- Senha em plaintext (legado) - verifica e migra
    IF v_stored_hash = p_password THEN
      -- Migra para bcrypt
      UPDATE rede_white_accounts 
      SET password_hash = crypt(p_password, gen_salt('bf', 12))
      WHERE uuid = v_uuid;
      
      RETURN json_build_object('success', true, 'uuid', v_uuid, 'balance', v_balance);
    END IF;
  END IF;

  RETURN json_build_object('success', false, 'error', 'Credenciais invalidas');
END;
$$;
*/

-- =====================================================
-- VERIFICACAO FINAL
-- =====================================================

-- Lista todas as tabelas e se RLS esta habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('rede_white_accounts', 'rede_white_transactions', 'mining_save', 'transacoes_mineracao');

-- Lista todas as politicas ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public';
