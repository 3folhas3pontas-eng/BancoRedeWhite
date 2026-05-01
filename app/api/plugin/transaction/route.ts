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

// POST - Fazer transferencia entre jogadores (via plugin)
export async function POST(request: NextRequest) {
  try {
    const { sender_username, receiver_username, amount, description } = await request.json();
    const secret = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!secret || !validatePluginSecret(secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!sender_username || !receiver_username || amount === undefined) {
      return NextResponse.json({ 
        error: 'sender_username, receiver_username e amount obrigatorios' 
      }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'amount invalido' }, { status: 400 });
    }

    // Nao pode transferir para si mesmo
    if (sender_username.toLowerCase() === receiver_username.toLowerCase()) {
      return NextResponse.json({ error: 'Nao pode transferir para si mesmo' }, { status: 400 });
    }

    // Busca sender
    const { data: sender, error: senderError } = await supabaseAdmin
      .from('rede_white_accounts')
      .select('uuid, username, balance')
      .ilike('username', sender_username.trim())
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
      .ilike('username', receiver_username.trim())
      .single();

    if (receiverError || !receiver) {
      return NextResponse.json({ error: 'Destinatario nao encontrado' }, { status: 404 });
    }

    const receiverBalance = parseFloat(receiver.balance || '0');

    // Debita do sender
    const { error: debitError } = await supabaseAdmin
      .from('rede_white_accounts')
      .update({ balance: senderBalance - parsedAmount })
      .eq('uuid', sender.uuid)
      .gte('balance', parsedAmount);

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
      sender: {
        username: sender.username,
        previousBalance: senderBalance,
        newBalance: senderBalance - parsedAmount,
      },
      receiver: {
        username: receiver.username,
        previousBalance: receiverBalance,
        newBalance: receiverBalance + parsedAmount,
      },
      amount: parsedAmount,
    });

  } catch (err) {
    console.error('[Plugin/Transaction] Erro:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// GET - Buscar historico de transacoes de um jogador
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const limit = parseInt(searchParams.get('limit') || '20');
    const secret = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!secret || !validatePluginSecret(secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      console.error('[Plugin/Transaction GET] Erro:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      username,
      transactions: transactions || [],
      count: transactions?.length || 0,
    });

  } catch (err) {
    console.error('[Plugin/Transaction GET] Erro:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
