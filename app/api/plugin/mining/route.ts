import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usa service role para operacoes do plugin
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAdmin = createClient(
  supabaseUrl!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Valida a chave secreta do plugin
function validatePluginSecret(secret: string): boolean {
  return secret === process.env.PLUGIN_API_SECRET;
}

// GET - Buscar dados de mineracao do jogador
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const secret = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!secret || !validatePluginSecret(secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!username) {
      return NextResponse.json({ error: 'username obrigatorio' }, { status: 400 });
    }

    const { data: mining, error } = await supabaseAdmin
      .from('mining_save')
      .select('*')
      .eq('username', username.trim())
      .single();

    if (error || !mining) {
      return NextResponse.json({ 
        exists: false, 
        username,
        inventory: {},
        coins: 0,
        level: 1,
        xp: 0,
      });
    }

    return NextResponse.json({
      exists: true,
      ...mining,
    });

  } catch (err) {
    console.error('[Plugin/Mining GET] Erro:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Salvar/atualizar dados de mineracao
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, ...miningData } = body;
    const secret = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!secret || !validatePluginSecret(secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!username) {
      return NextResponse.json({ error: 'username obrigatorio' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('mining_save')
      .upsert({ username, ...miningData }, { onConflict: 'username' });

    if (error) {
      console.error('[Plugin/Mining POST] Erro:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[Plugin/Mining POST] Erro:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT - Coletar minerios (converter para coins e creditar na conta)
export async function PUT(request: NextRequest) {
  try {
    const { username, minerals_to_collect, conversion_rate } = await request.json();
    const secret = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!secret || !validatePluginSecret(secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!username || !minerals_to_collect) {
      return NextResponse.json({ error: 'username e minerals_to_collect obrigatorios' }, { status: 400 });
    }

    // Busca dados de mineracao
    const { data: mining, error: miningError } = await supabaseAdmin
      .from('mining_save')
      .select('*')
      .eq('username', username.trim())
      .single();

    if (miningError || !mining) {
      return NextResponse.json({ error: 'Dados de mineracao nao encontrados' }, { status: 404 });
    }

    // Busca conta do jogador
    const { data: account, error: accountError } = await supabaseAdmin
      .from('rede_white_accounts')
      .select('uuid, balance')
      .ilike('username', username.trim())
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 });
    }

    // Calcula coins a adicionar baseado nos minerios
    // minerals_to_collect: { "diamond": 5, "gold": 10, ... }
    // conversion_rate: { "diamond": 100, "gold": 50, ... } (opcional, usa default se nao passar)
    const defaultRates: Record<string, number> = {
      diamond: 100,
      emerald: 80,
      gold: 50,
      iron: 20,
      coal: 5,
      copper: 10,
      lapis: 15,
      redstone: 10,
    };

    const rates = conversion_rate || defaultRates;
    let totalCoins = 0;
    const collected: Record<string, number> = {};

    for (const [mineral, quantity] of Object.entries(minerals_to_collect)) {
      const qty = Number(quantity);
      if (qty > 0 && rates[mineral]) {
        totalCoins += qty * rates[mineral];
        collected[mineral] = qty;
      }
    }

    if (totalCoins === 0) {
      return NextResponse.json({ error: 'Nenhum minerio valido para coletar' }, { status: 400 });
    }

    // Atualiza saldo da conta
    const currentBalance = parseFloat(account.balance || '0');
    const newBalance = currentBalance + totalCoins;

    const { error: updateError } = await supabaseAdmin
      .from('rede_white_accounts')
      .update({ balance: newBalance })
      .eq('uuid', account.uuid);

    if (updateError) {
      console.error('[Plugin/Mining PUT] Erro ao atualizar saldo:', updateError);
      return NextResponse.json({ error: 'Erro ao creditar coins' }, { status: 500 });
    }

    // Atualiza inventario de mineracao (remove minerios coletados)
    const currentInventory = mining.inventory || {};
    for (const [mineral, quantity] of Object.entries(collected)) {
      if (currentInventory[mineral]) {
        currentInventory[mineral] = Math.max(0, currentInventory[mineral] - quantity);
      }
    }

    await supabaseAdmin
      .from('mining_save')
      .update({ inventory: currentInventory })
      .eq('username', username.trim());

    return NextResponse.json({
      success: true,
      collected,
      coinsAdded: totalCoins,
      previousBalance: currentBalance,
      newBalance,
    });

  } catch (err) {
    console.error('[Plugin/Mining PUT] Erro:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Limpar dados de mineracao (reset)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const secret = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!secret || !validatePluginSecret(secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!username) {
      return NextResponse.json({ error: 'username obrigatorio' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('mining_save')
      .delete()
      .eq('username', username.trim());

    if (error) {
      console.error('[Plugin/Mining DELETE] Erro:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[Plugin/Mining DELETE] Erro:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
