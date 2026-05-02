import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: 'username obrigatorio' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('mining_save')
      .select('*')
      .ilike('username', username)
      .single();

    if (error || !data) {
      return NextResponse.json({ save: null });
    }

    return NextResponse.json({ save: data });
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
