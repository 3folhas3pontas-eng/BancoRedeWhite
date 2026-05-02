import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { username, session_token } = await request.json();

    if (!username || !session_token) {
      return NextResponse.json(
        { error: 'Username e session_token são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verifica se a sessão é válida
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_token', session_token)
      .eq('username', username)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Sessão inválida' },
        { status: 401 }
      );
    }

    // Busca o saldo atualizado
    const { data: account, error: accountError } = await supabase
      .from('rede_white_accounts')
      .select('username, uuid, balance')
      .eq('username', username)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Conta não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      balance: parseFloat(account.balance || '0'),
      username: account.username,
      uuid: account.uuid
    });

  } catch (error) {
    console.error('Erro ao buscar saldo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
