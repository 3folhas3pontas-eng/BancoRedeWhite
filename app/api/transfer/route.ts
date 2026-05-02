import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAdmin = createClient(
  supabaseUrl!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function validateSession(token: string): { uuid: string; username: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    if (decoded.exp < Date.now()) return null;
    return { uuid: decoded.uuid, username: decoded.username };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[v0] Transfer chamada com:', JSON.stringify({ ...body, sessionToken: '[REDACTED]' }));

    const { sessionToken, receiverUsername, amount } = body;

    // 1. Valida sessao
    const session = validateSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Sessão inválida ou expirada' }, { status: 401 });
    }
    console.log('[v0] Sessao valida para:', session.username);

    // 2. Valida amount
    const parsedAmount = parseFloat(String(amount));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 });
    }

    // 3. Nao pode transferir para si mesmo
    if (session.username.toLowerCase() === receiverUsername.toLowerCase()) {
      return NextResponse.json({ error: 'Não pode transferir para si mesmo' }, { status: 400 });
    }

    // 4. Busca sender
    const { data: sender, error: senderError } = await supabaseAdmin
      .from('rede_white_accounts')
      .select('uuid, username, balance')
      .ilike('username', session.username)
      .single();

    console.log('[v0] Sender:', JSON.stringify(sender), 'Erro:', senderError?.message);

    if (senderError || !sender) {
      return NextResponse.json({ error: 'Conta do remetente não encontrada' }, { status: 404 });
    }

    const senderBalance = parseFloat(String(sender.balance ?? 0));
    console.log('[v0] Saldo sender:', senderBalance, 'Valor a transferir:', parsedAmount);

    if (senderBalance < parsedAmount) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
    }

    // 5. Busca receiver
    const { data: receiver, error: receiverError } = await supabaseAdmin
      .from('rede_white_accounts')
      .select('uuid, username, balance')
      .ilike('username', receiverUsername.trim())
      .single();

    console.log('[v0] Receiver:', JSON.stringify(receiver), 'Erro:', receiverError?.message);

    if (receiverError || !receiver) {
      return NextResponse.json({ error: 'Destinatário não encontrado' }, { status: 404 });
    }

    const receiverBalance = parseFloat(String(receiver.balance ?? 0));
    const novoSaldoSender = senderBalance - parsedAmount;
    const novoSaldoReceiver = receiverBalance + parsedAmount;

    // 6a. Debita sender
    const { error: debitError } = await supabaseAdmin
      .from('rede_white_accounts')
      .update({ balance: novoSaldoSender })
      .ilike('username', sender.username);

    console.log('[v0] Debito erro:', debitError?.message);

    if (debitError) {
      return NextResponse.json({ error: 'Erro ao processar débito' }, { status: 500 });
    }

    // 6b. Credita receiver
    const { error: creditError } = await supabaseAdmin
      .from('rede_white_accounts')
      .update({ balance: novoSaldoReceiver })
      .ilike('username', receiver.username);

    console.log('[v0] Credito erro:', creditError?.message);

    if (creditError) {
      // Rollback do sender
      await supabaseAdmin
        .from('rede_white_accounts')
        .update({ balance: senderBalance })
        .ilike('username', sender.username);

      return NextResponse.json({ error: 'Erro ao processar crédito' }, { status: 500 });
    }

    // 7. Registra transacao
    const transactionId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const { error: insertError } = await supabaseAdmin
      .from('rede_white_transactions')
      .insert({
        sender_name: sender.username,
        receiver_name: receiver.username,
        amount: parsedAmount,
        status: 'CONCLUIDO',
      });

    if (insertError) {
      console.log('[v0] Aviso: erro ao registrar transacao:', insertError.message);
    }

    console.log(`[v0] Transferencia OK: ${sender.username} -> ${receiver.username}: ${parsedAmount}`);

    return NextResponse.json({
      success: true,
      transactionId,
      newBalance: novoSaldoSender,
    });

  } catch (err) {
    console.error('[v0] Erro transfer:', err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
