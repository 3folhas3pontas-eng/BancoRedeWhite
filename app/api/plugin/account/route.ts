import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usa service role para operacoes do plugin (nunca expor no cliente!)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAdmin = createClient(
  supabaseUrl!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Valida a chave secreta do plugin
function validatePluginSecret(request: NextRequest): boolean {
  const secret = request.headers.get('X-Plugin-Secret') || 
                 request.headers.get('Authorization')?.replace('Bearer ', '');
  return secret === process.env.PLUGIN_API_SECRET;
}

// POST - Todas as operacoes via action no body
export async function POST(request: NextRequest) {
  try {
    if (!validatePluginSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create':
        return handleCreate(body);
      case 'get-balance':
        return handleGetBalance(body);
      case 'set-balance':
        return handleSetBalance(body);
      case 'update-balance':
        return handleUpdateBalance(body);
      case 'update-shop':
        return handleUpdateShop(body);
      default:
        return NextResponse.json({ error: 'Acao invalida' }, { status: 400 });
    }

  } catch (err) {
    console.error('[Plugin/Account] Erro:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// Criar nova conta
async function handleCreate(body: any) {
  const { uuid, username, password_hash, initial_balance } = body;

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
      uuid: uuid || undefined,
      username: username.trim(),
      password_hash,
      balance: initial_balance || 0,
    })
    .select('uuid, username, balance')
    .single();

  if (error) {
    console.error('[Plugin/Account] Erro ao criar:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    uuid: newAccount.uuid,
    username: newAccount.username,
    balance: parseFloat(newAccount.balance || '0'),
  });
}

// Buscar saldo
async function handleGetBalance(body: any) {
  const { username } = body;

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
    success: true,
    exists: true,
    uuid: account.uuid,
    username: account.username,
    balance: parseFloat(account.balance || '0'),
  });
}

// Definir saldo (SET - substitui o valor)
async function handleSetBalance(body: any) {
  const { uuid, username, balance } = body;

  if (!username) {
    return NextResponse.json({ error: 'username obrigatorio' }, { status: 400 });
  }

  // Busca conta atual
  const { data: account, error: fetchError } = await supabaseAdmin
    .from('rede_white_accounts')
    .select('uuid, username, balance')
    .ilike('username', username.trim())
    .single();

  if (fetchError || !account) {
    // Se nao existe, cria a conta
    const { data: newAccount, error: createError } = await supabaseAdmin
      .from('rede_white_accounts')
      .insert({
        uuid: uuid || undefined,
        username: username.trim(),
        password_hash: 'auto_created',
        balance: balance || 0,
      })
      .select('uuid, username, balance')
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      created: true,
      uuid: newAccount.uuid,
      username: newAccount.username,
      new_balance: parseFloat(newAccount.balance || '0'),
    });
  }

  // Atualiza saldo
  const { error: updateError } = await supabaseAdmin
    .from('rede_white_accounts')
    .update({ balance: balance || 0 })
    .eq('uuid', account.uuid);

  if (updateError) {
    console.error('[Plugin/Account] Erro ao atualizar:', updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    uuid: account.uuid,
    username: account.username,
    previous_balance: parseFloat(account.balance || '0'),
    new_balance: parseFloat(String(balance || 0)),
  });
}

// Atualizar saldo (ADD/SUBTRACT - adiciona ou remove)
async function handleUpdateBalance(body: any) {
  const { username, amount, reason } = body;

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
  const newBalance = currentBalance + parsedAmount;

  if (newBalance < 0) {
    return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
  }

  // Atualiza saldo
  const { error: updateError } = await supabaseAdmin
    .from('rede_white_accounts')
    .update({ balance: newBalance })
    .eq('uuid', account.uuid);

  if (updateError) {
    console.error('[Plugin/Account] Erro ao atualizar:', updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    username: account.username,
    previous_balance: currentBalance,
    new_balance: newBalance,
    reason: reason || 'unknown',
  });
}

// Atualizar status da loja
async function handleUpdateShop(body: any) {
  const { shop_name, owner_name, status } = body;

  if (!shop_name || !status) {
    return NextResponse.json({ error: 'shop_name e status obrigatorios' }, { status: 400 });
  }

  // Aqui voce pode implementar a logica de lojas
  // Por enquanto, apenas retorna sucesso
  console.log(`[Shop] ${shop_name} (owner: ${owner_name}) -> ${status}`);

  return NextResponse.json({
    success: true,
    shop_name,
    status,
  });
}
