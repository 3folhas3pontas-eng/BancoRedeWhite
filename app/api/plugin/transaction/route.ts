import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usa service role para operacoes do plugin
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
      case 'transfer':
        return handleTransfer(body);
      case 'get-pending':
        return handleGetPending();
      case 'update-status':
        return handleUpdateStatus(body);
      case 'get-history':
        return handleGetHistory(body);
      default:
        return NextResponse.json({ error: 'Acao invalida' }, { status: 400 });
    }

  } catch (err) {
    console.error('[Plugin/Transaction] Erro:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// Transferir entre jogadores
async function handleTransfer(body: any) {
  const { from_username, to_username, amount, reason } = body;

  if (!from_username || !to_username || amount === undefined) {
    return NextResponse.json({ 
      error: 'from_username, to_username e amount obrigatorios' 
    }, { status: 400 });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json({ error: 'amount invalido' }, { status: 400 });
  }

  // Nao pode transferir para si mesmo
  if (from_username.toLowerCase() === to_username.toLowerCase()) {
    return NextResponse.json({ error: 'Nao pode transferir para si mesmo' }, { status: 400 });
  }

  // Busca sender
  const { data: sender, error: senderError } = await supabaseAdmin
    .from('rede_white_accounts')
    .select('uuid, username, balance')
    .ilike('username', from_username.trim())
    .single();

  if (senderError || !sender) {
    return NextResponse.json({ error: 'Remetente nao encontrado' }, { status: 404 });
  }

  const senderBalance = parseFloat(sender.balance || '0');
  if (senderBalance < parsedAmount) {
    return NextResponse.json({ 
      error: 'Saldo insuficiente',
      balance: senderBalance,
      required: parsedAmount,
    }, { status: 400 });
  }

  // Busca receiver
  const { data: receiver, error: receiverError } = await supabaseAdmin
    .from('rede_white_accounts')
    .select('uuid, username, balance')
    .ilike('username', to_username.trim())
    .single();

  if (receiverError || !receiver) {
    return NextResponse.json({ error: 'Destinatario nao encontrado' }, { status: 404 });
  }

  const receiverBalance = parseFloat(receiver.balance || '0');

  // Debita do sender
  const { error: debitError } = await supabaseAdmin
    .from('rede_white_accounts')
    .update({ balance: senderBalance - parsedAmount })
    .eq('uuid', sender.uuid);

  if (debitError) {
    console.error('[Plugin/Transaction] Erro ao debitar:', debitError);
    return NextResponse.json({ error: 'Erro ao processar debito' }, { status: 500 });
  }

  // Credita no receiver
  const { error: creditError } = await supabaseAdmin
    .from('rede_white_accounts')
    .update({ balance: receiverBalance + parsedAmount })
    .eq('uuid', receiver.uuid);

  if (creditError) {
    // Rollback
    await supabaseAdmin
      .from('rede_white_accounts')
      .update({ balance: senderBalance })
      .eq('uuid', sender.uuid);

    console.error('[Plugin/Transaction] Erro ao creditar, rollback:', creditError);
    return NextResponse.json({ error: 'Erro ao processar credito' }, { status: 500 });
  }

  // Registra transacao
  const transactionId = Math.random().toString(36).substr(2, 9).toUpperCase();
  
  await supabaseAdmin
    .from('rede_white_transactions')
    .insert({
      sender_name: sender.username,
      receiver_name: receiver.username,
      amount: parsedAmount,
      status: 'CONCLUIDO',
      transaction_id: transactionId,
    });

  return NextResponse.json({
    success: true,
    transactionId,
    from_balance: senderBalance - parsedAmount,
    to_balance: receiverBalance + parsedAmount,
  });
}

// Buscar transacoes PIX pendentes
async function handleGetPending() {
  const { data: transactions, error } = await supabaseAdmin
    .from('rede_white_transactions')
    .select('*')
    .eq('status', 'PENDENTE')
    .order('created_at', { ascending: true })
    .limit(50);

  if (error) {
    console.error('[Plugin/Transaction] Erro ao buscar pendentes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    transactions: transactions || [],
    count: transactions?.length || 0,
  });
}

// Atualizar status de transacao
async function handleUpdateStatus(body: any) {
  const { transaction_id, status } = body;

  if (!transaction_id || !status) {
    return NextResponse.json({ error: 'transaction_id e status obrigatorios' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('rede_white_transactions')
    .update({ status })
    .eq('id', transaction_id);

  if (error) {
    console.error('[Plugin/Transaction] Erro ao atualizar status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    transaction_id,
    new_status: status,
  });
}

// Buscar historico de transacoes
async function handleGetHistory(body: any) {
  const { username, limit = 20 } = body;

  if (!username) {
    return NextResponse.json({ error: 'username obrigatorio' }, { status: 400 });
  }

  const { data: transactions, error } = await supabaseAdmin
    .from('rede_white_transactions')
    .select('*')
    .or(`sender_name.ilike.${username},receiver_name.ilike.${username}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Plugin/Transaction] Erro ao buscar historico:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    username,
    transactions: transactions || [],
    count: transactions?.length || 0,
  });
}
