import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usa service role para operacoes criticas (nunca expor no cliente!)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAdmin = createClient(
  supabaseUrl!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Valida o token de sessao
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
    const { sessionToken, receiverUsername, amount } = await request.json();

    // 1. Valida sessao
    const session = validateSession(sessionToken);
    if (!session) {
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada' },
        { status: 401 }
      );
    }

    // 2. Valida amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      );
    }

    // 3. Nao pode transferir para si mesmo
    if (session.username.toLowerCase() === receiverUsername.toLowerCase()) {
      return NextResponse.json(
        { error: 'Não pode transferir para si mesmo' },
        { status: 400 }
      );
    }

    // 4. Busca sender pelo username (mais confiavel que uuid)
    console.log('[Transfer] Buscando sender:', session.username, 'uuid:', session.uuid);
    const { data: sender, error: senderError } = await supabaseAdmin
      .from('rede_white_accounts')
      .select('uuid, username, balance')
      .ilike('username', session.username)
      .single();

    if (senderError || !sender) {
      console.error('[Transfer] Sender nao encontrado:', senderError?.message);
      return NextResponse.json(
        { error: 'Conta do remetente não encontrada' },
        { status: 404 }
      );
    }
    console.log('[Transfer] Sender encontrado:', sender.username, 'balance:', sender.balance);

    const senderBalance = parseFloat(sender.balance || '0');
    if (senderBalance < parsedAmount) {
      return NextResponse.json(
        { error: 'Saldo insuficiente' },
        { status: 400 }
      );
    }

    // 5. Busca receiver
    const { data: receiver, error: receiverError } = await supabaseAdmin
      .from('rede_white_accounts')
      .select('uuid, username')
      .ilike('username', receiverUsername.trim())
      .single();

    if (receiverError || !receiver) {
      return NextResponse.json(
        { error: 'Destinatário não encontrado' },
        { status: 404 }
      );
    }

    // 6. Executa transferencia ATOMICA usando uma transacao
    // Como Supabase nao tem transacoes nativas via REST, usamos RPC
    // Por enquanto, fazemos as operacoes em sequencia com validacao extra
    
    // 6a. Debita do sender usando username (mais confiavel)
    console.log('[Transfer] Debitando', parsedAmount, 'de', sender.username, '- saldo atual:', senderBalance);
    const { error: debitError, count: debitCount } = await supabaseAdmin
      .from('rede_white_accounts')
      .update({ balance: senderBalance - parsedAmount })
      .ilike('username', sender.username)
      .gte('balance', parsedAmount)
      .select();

    console.log('[Transfer] Debito resultado - erro:', debitError?.message, 'count:', debitCount);

    if (debitError) {
      console.error('[Transfer] Erro ao debitar:', debitError);
      return NextResponse.json(
        { error: 'Erro ao processar débito' },
        { status: 500 }
      );
    }

    // 6b. Credita no receiver
    const { data: receiverData } = await supabaseAdmin
      .from('rede_white_accounts')
      .select('balance')
      .eq('uuid', receiver.uuid)
      .single();

    const receiverBalance = parseFloat(receiverData?.balance || '0');

    const { error: creditError } = await supabaseAdmin
      .from('rede_white_accounts')
      .update({ balance: receiverBalance + parsedAmount })
      .eq('uuid', receiver.uuid);

    if (creditError) {
      // ROLLBACK: devolve o dinheiro para o sender
      await supabaseAdmin
        .from('rede_white_accounts')
        .update({ balance: senderBalance })
        .eq('uuid', sender.uuid);

      console.error('[Transfer] Erro ao creditar, rollback executado:', creditError);
      return NextResponse.json(
        { error: 'Erro ao processar crédito' },
        { status: 500 }
      );
    }

    // 7. Registra a transacao no historico
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
      console.error('[Transfer] Aviso: falha ao registrar transacao no historico:', insertError.message);
      // Nao falha a transferencia por isso - saldo ja foi transferido
    }

    console.log(`[Transfer] Sucesso: ${sender.username} -> ${receiver.username}: ${parsedAmount}`);

    return NextResponse.json({
      success: true,
      transactionId,
      newBalance: senderBalance - parsedAmount,
    });

  } catch (err) {
    console.error('[Transfer] Erro:', err);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
