import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
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
