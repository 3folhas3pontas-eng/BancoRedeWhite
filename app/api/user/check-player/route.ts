import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Busca o jogador pelo username (case insensitive)
    const { data, error } = await supabase
      .from('rede_white_accounts')
      .select('username, uuid')
      .ilike('username', username.trim())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Jogador não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      username: data.username,
      uuid: data.uuid
    });

  } catch (error) {
    console.error('Erro ao verificar jogador:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
