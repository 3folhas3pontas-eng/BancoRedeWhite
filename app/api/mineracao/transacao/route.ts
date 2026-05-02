import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { username, tipo, valor, detalhes } = await req.json();

    if (!username || !tipo || valor === undefined) {
      return NextResponse.json({ error: 'username, tipo e valor sao obrigatorios' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('transacoes_mineracao')
      .insert({
        username,
        tipo,
        valor,
        detalhes: detalhes ?? {},
        status: 'pendente',
      })
      .select()
      .single();

    if (error) {
      console.error('[mineracao/transacao] erro:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, transacao: data });
  } catch (err) {
    console.error('[mineracao/transacao] Erro inesperado:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
