import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { username, session_token } = await request.json();

    if (!username || !session_token) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 });
    }

    // Valida o token de sessão
    try {
      const sessionData = JSON.parse(Buffer.from(session_token, 'base64').toString());
      if (sessionData.exp < Date.now()) {
        return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 });
      }
      if (sessionData.username.toLowerCase() !== username.toLowerCase()) {
        return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Busca transacoes onde o usuario e sender OU receiver (case-insensitive)
    const { data, error } = await supabase
      .from('rede_white_transactions')
      .select('*')
      .or(`sender_name.ilike.${username},receiver_name.ilike.${username}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Transactions] Erro:', error.message);
      return NextResponse.json({ error: 'Erro ao buscar transações' }, { status: 500 });
    }

    return NextResponse.json({ success: true, transactions: data ?? [] });
  } catch (e) {
    console.error('[Transactions] Erro inesperado:', e);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
