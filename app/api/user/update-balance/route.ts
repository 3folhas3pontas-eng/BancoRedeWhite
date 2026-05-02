import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
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

    // Valida o token de sessão (base64 encoded JSON)
    try {
      const sessionData = JSON.parse(Buffer.from(session_token, 'base64').toString());
      
      // Verifica se o token expirou
      if (sessionData.exp < Date.now()) {
        return NextResponse.json(
          { error: 'Sessão expirada' },
          { status: 401 }
        );
      }
      
      // Verifica se o username corresponde
      if (sessionData.username !== username) {
        return NextResponse.json(
          { error: 'Sessão inválida' },
          { status: 401 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Token de sessão inválido' },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
