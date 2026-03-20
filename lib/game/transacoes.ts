import { supabase } from "@/lib/supabase";

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
  criado_em: string;
  processado_em: string | null;
}

// Registra uma nova transacao
export async function registrarTransacao(
  username: string,
  tipo: TipoTransacao,
  valor: number,
  detalhes: Record<string, unknown> = {}
): Promise<{ success: boolean; transacao?: TransacaoMineracao; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('transacoes_mineracao')
      .insert({
        username,
        tipo,
        valor,
        detalhes,
        status: 'pendente',
      })
      .select()
      .single();

    if (error) {
      console.error('[v0] Erro ao registrar transacao:', error);
      return { success: false, error: error.message };
    }

    return { success: true, transacao: data as TransacaoMineracao };
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
    .order('criado_em', { ascending: true });

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
      processado_em: status === 'concluido' || status === 'erro' ? new Date().toISOString() : null,
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
    .order('criado_em', { ascending: false })
    .limit(limite);

  if (error) {
    console.error('[v0] Erro ao buscar historico:', error);
    return [];
  }

  return (data as TransacaoMineracao[]) ?? [];
}
