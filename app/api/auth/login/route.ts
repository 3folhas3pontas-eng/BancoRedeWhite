import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Usa service role para validar login (nunca expor no cliente!)
// Tenta SUPABASE_URL primeiro (padrao da integracao), senao usa NEXT_PUBLIC
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAdmin = createClient(
  supabaseUrl!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    console.log('[v0] Login attempt:', { username, hasPassword: !!password });
    console.log('[v0] ENV check:', { 
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      urlUsed: supabaseUrl?.substring(0, 30) + '...'
    });

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Busca usuario pelo username (usando service role no backend)
    const { data: user, error } = await supabaseAdmin
      .from('rede_white_accounts')
      .select('uuid, username, password_hash, balance')
      .eq('username', username.trim())
      .single();

    console.log('[v0] Supabase response:', { 
      hasUser: !!user, 
      error: error?.message,
      userFound: user?.username
    });

    if (error || !user) {
      // Resposta generica para nao revelar se usuario existe
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verifica se a senha esta em bcrypt ou plaintext (migracao gradual)
    let isValidPassword = false;
    
    console.log('[v0] Password check:', { 
      isBcrypt: user.password_hash?.startsWith('$2'),
      storedLength: user.password_hash?.length,
      inputLength: password?.length
    });

    if (user.password_hash.startsWith('$2')) {
      // Senha ja esta em bcrypt
      isValidPassword = await bcrypt.compare(password, user.password_hash);
    } else {
      // Senha ainda em plaintext - compara e migra para bcrypt
      isValidPassword = user.password_hash === password;
      console.log('[v0] Plaintext compare:', { isValidPassword });
      
      if (isValidPassword) {
        // Migra para bcrypt automaticamente no primeiro login
        const hashedPassword = await bcrypt.hash(password, 12);
        await supabaseAdmin
          .from('rede_white_accounts')
          .update({ password_hash: hashedPassword })
          .eq('uuid', user.uuid);
        
        console.log(`[Security] Senha migrada para bcrypt: ${username}`);
      }
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Gera um token de sessao simples (em producao usar JWT ou session)
    const sessionToken = Buffer.from(
      JSON.stringify({
        uuid: user.uuid,
        username: user.username,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24h
      })
    ).toString('base64');

    // Retorna dados do usuario (sem a senha!)
    return NextResponse.json({
      success: true,
      user: {
        uuid: user.uuid,
        nick: user.username,
        balance: parseFloat(user.balance || '0'),
      },
      sessionToken,
    });

  } catch (err) {
    console.error('[Auth] Erro no login:', err);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
