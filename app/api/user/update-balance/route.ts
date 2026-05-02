import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { username, session_token, new_balance } = await request.json();

    if (!username || !session_token || new_balance === undefined) {
      return NextResponse.json(
        { error: 'Username, session_token e new_balance são obrigatórios' },
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

    // Atualiza o saldo
    const { error: updateError } = await supabase
      .from('rede_white_accounts')
      .update({ balance: new_balance })
      .eq('username', username);

    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao atualizar saldo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      new_balance: new_balance
    });

  } catch (error) {
    console.error('Erro ao atualizar saldo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
