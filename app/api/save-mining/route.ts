import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, ...rest } = body;

    if (!username) {
      return NextResponse.json({ error: 'username obrigatorio' }, { status: 400 });
    }

    const { error } = await supabase
      .from('mining_save')
      .upsert({ username, ...rest }, { onConflict: 'username' });

    if (error) {
      console.error('[save-mining] Erro:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[save-mining] Erro inesperado:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
