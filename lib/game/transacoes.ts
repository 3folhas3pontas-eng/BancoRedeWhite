// Tipos de transacao
export type TipoTransacao = 
  | 'upgrade_pickaxe'
  | 'upgrade_speed'
  | 'upgrade_tnt_radius'
  | 'upgrade_tnt_spawn'
  | 'upgrade_beacon_spawn'
  | 'upgrade_dungeon_spawn'
  | 'upgrade_chest_spawn'
  | 'enchant';

// Status da transacao
export type StatusTransacao = 'pendente' | 'processando' | 'concluido' | 'erro';

// Interface da transacao
export interface TransacaoMineracao {
  id: string;
  username: string;
  tipo: TipoTransacao;
  detalhes: Record<string, unknown>;
  valor: number;
  status: StatusTransacao;
  created_at: string;
  processed_at: string | null;
}

// Registra uma nova transacao via API do backend (usa service_role_key)
export async function registrarTransacao(
  username: string,
  tipo: TipoTransacao,
  valor: number,
  detalhes: Record<string, unknown> = {}
): Promise<{ success: boolean; transacao?: TransacaoMineracao; error?: string }> {
  try {
    const res = await fetch('/api/mineracao/transacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, tipo, valor, detalhes }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, transacao: data.transacao };
  } catch (err) {
    console.error('[v0] Erro inesperado ao registrar transacao:', err);
    return { success: false, error: 'Erro inesperado' };
  }
}

// Busca transacoes pendentes de um usuario
export async function buscarTransacoesPendentes(
  username: string
): Promise<TransacaoMineracao[]> {
  const { data, error } = await supabase
    .from('transacoes_mineracao')
    .select('*')
    .eq('username', username)
    .eq('status', 'pendente')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[v0] Erro ao buscar transacoes:', error);
    return [];
  }

  return (data as TransacaoMineracao[]) ?? [];
}

// Atualiza status de uma transacao
export async function atualizarStatusTransacao(
  id: string,
  status: StatusTransacao
): Promise<boolean> {
  const { error } = await supabase
    .from('transacoes_mineracao')
    .update({
      status,
      processed_at: status === 'concluido' || status === 'erro' ? new Date().toISOString() : null,
    })
    .eq('id', id);

  if (error) {
    console.error('[v0] Erro ao atualizar transacao:', error);
    return false;
  }

  return true;
}

// Busca historico de transacoes de um usuario
export async function buscarHistoricoTransacoes(
  username: string,
  limite: number = 50
): Promise<TransacaoMineracao[]> {
  const { data, error } = await supabase
    .from('transacoes_mineracao')
    .select('*')
    .eq('username', username)
    .order('created_at', { ascending: false })
    .limit(limite);

  if (error) {
    console.error('[v0] Erro ao buscar historico:', error);
    return [];
  }

  return (data as TransacaoMineracao[]) ?? [];
}
