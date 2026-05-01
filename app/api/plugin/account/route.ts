import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usa service role para operacoes do plugin (nunca expor no cliente!)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAdmin = createClient(
  supabaseUrl!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Valida a chave secreta do plugin
function validatePluginSecret(secret: string): boolean {
  return secret === process.env.PLUGIN_API_SECRET;
}

// GET - Buscar conta e saldo pelo username
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

    const { data: account, error } = await supabaseAdmin
      .from('rede_white_accounts')
      .select('uuid, username, balance')
      .ilike('username', username.trim())
      .single();

    if (error || !account) {
      return NextResponse.json({ error: 'Conta nao encontrada', exists: false }, { status: 404 });
    }

    return NextResponse.json({
      exists: true,
      uuid: account.uuid,
      username: account.username,
      balance: parseFloat(account.balance || '0'),
    });

  } catch (err) {
    console.error('[Plugin/Account GET] Erro:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar nova conta
export async function POST(request: NextRequest) {
  try {
    const { username, password_hash, initial_balance } = await request.json();
    const secret = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!secret || !validatePluginSecret(secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!username || !password_hash) {
      return NextResponse.json({ error: 'username e password_hash obrigatorios' }, { status: 400 });
    }

    // Verifica se ja existe
    const { data: existing } = await supabaseAdmin
      .from('rede_white_accounts')
      .select('uuid')
      .ilike('username', username.trim())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Conta ja existe', exists: true }, { status: 409 });
    }

    // Cria a conta
    const { data: newAccount, error } = await supabaseAdmin
      .from('rede_white_accounts')
      .insert({
        username: username.trim(),
        password_hash,
        balance: initial_balance || 0,
      })
      .select('uuid, username, balance')
      .single();

    if (error) {
      console.error('[Plugin/Account POST] Erro ao criar:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      uuid: newAccount.uuid,
      username: newAccount.username,
      balance: parseFloat(newAccount.balance || '0'),
    });

  } catch (err) {
    console.error('[Plugin/Account POST] Erro:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT - Atualizar saldo (adicionar ou remover)
export async function PUT(request: NextRequest) {
  try {
    const { username, amount, operation } = await request.json();
    const secret = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!secret || !validatePluginSecret(secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!username || amount === undefined) {
      return NextResponse.json({ error: 'username e amount obrigatorios' }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      return NextResponse.json({ error: 'amount invalido' }, { status: 400 });
    }

    // Busca conta atual
    const { data: account, error: fetchError } = await supabaseAdmin
      .from('rede_white_accounts')
      .select('uuid, username, balance')
      .ilike('username', username.trim())
      .single();

    if (fetchError || !account) {
      return NextResponse.json({ error: 'Conta nao encontrada' }, { status: 404 });
    }

    const currentBalance = parseFloat(account.balance || '0');
    let newBalance: number;

    // operation: 'add' (default), 'subtract', 'set'
    switch (operation) {
      case 'subtract':
        newBalance = currentBalance - parsedAmount;
        if (newBalance < 0) {
          return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
        }
        break;
      case 'set':
        newBalance = parsedAmount;
        break;
      case 'add':
      default:
        newBalance = currentBalance + parsedAmount;
        break;
    }

    // Atualiza saldo
    const { error: updateError } = await supabaseAdmin
      .from('rede_white_accounts')
      .update({ balance: newBalance })
      .eq('uuid', account.uuid);

    if (updateError) {
      console.error('[Plugin/Account PUT] Erro ao atualizar:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      username: account.username,
      previousBalance: currentBalance,
      newBalance,
      operation: operation || 'add',
    });

  } catch (err) {
    console.error('[Plugin/Account PUT] Erro:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
