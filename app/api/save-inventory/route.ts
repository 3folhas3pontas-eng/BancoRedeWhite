import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, action, inventory, delta } = body;

    if (!username) {
      return NextResponse.json({ error: 'username obrigatorio' }, { status: 400 });
    }

    // action=upsert: salva inventario completo
    if (action === 'upsert' && inventory) {
      const { error } = await supabase
        .from('mining_inventory')
        .upsert({ username, ...inventory, updated_at: new Date().toISOString() }, { onConflict: 'username' });

      if (error) {
        console.error('[save-inventory] upsert erro:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    // action=delta: soma o delta ao inventario atual de forma atomica
    if (action === 'delta' && delta) {
      // Busca valores atuais (ilike para ignorar diferenca de maiusculas)
      const { data: current, error: fetchError } = await supabase
        .from('mining_inventory')
        .select('*')
        .ilike('username', username)
        .single();

      if (fetchError || !current) {
        // Cria registro com o delta
        const { error: insertError } = await supabase
          .from('mining_inventory')
          .insert({ username, ...delta, updated_at: new Date().toISOString() });

        if (insertError) {
          console.error('[save-inventory] insert erro:', insertError);
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }
        return NextResponse.json({ ok: true });
      }

      // Soma delta ao atual
      const newValues: Record<string, unknown> = { updated_at: new Date().toISOString() };
      for (const key of Object.keys(delta)) {
        const cur = typeof current[key] === 'number' ? current[key] : 0;
        const add = typeof delta[key] === 'number' ? delta[key] : 0;
        newValues[key] = cur + add;
      }

      // Usa o username real do banco (preserva case original)
      const realUsername = current.username ?? username;
      const { error: updateError } = await supabase
        .from('mining_inventory')
        .update(newValues)
        .eq('username', realUsername);

      if (updateError) {
        console.error('[save-inventory] update erro:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'action invalida' }, { status: 400 });
  } catch (err) {
    console.error('[save-inventory] Erro inesperado:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
