# Guia de Seguranca - RedeWhite Bank

## Resumo das Vulnerabilidades Corrigidas

1. **Login com senha em plaintext** - Agora usa bcrypt via API segura
2. **Transferencias sem validacao** - Agora validado atomicamente no backend
3. **RLS desligado** - Script pronto para habilitar
4. **Acesso direto a tabelas** - Frontend agora usa APIs seguras

---

## Passo a Passo para Configurar

### 1. Executar o Script SQL no Supabase

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Va em **SQL Editor**
3. Copie todo o conteudo de `scripts/security-setup.sql`
4. Execute o script
5. Verifique se todas as tabelas mostram `rowsecurity = true`

### 2. Verificar Variaveis de Ambiente

O backend precisa da `SUPABASE_SERVICE_ROLE_KEY` para funcionar. Verifique se esta configurada no Vercel:

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (NUNCA exponha essa chave no cliente!)
```

### 3. Testar o Login

1. Acesse o site
2. Faca login com um usuario existente
3. A senha sera automaticamente migrada para bcrypt no primeiro login

### 4. Testar Transferencia

1. Faca login
2. Va em Pix > Transferir
3. Digite um nick valido e um valor
4. A transferencia agora e validada no servidor

---

## Como Funciona a Nova Arquitetura

### Antes (INSEGURO)
```
Cliente -> Supabase (direto)
         - SELECT * FROM rede_white_accounts (expoe senhas!)
         - INSERT INTO rede_white_transactions (sem validacao!)
```

### Depois (SEGURO)
```
Cliente -> API Route -> Supabase (via service_role)
         - POST /api/auth/login (valida senha com bcrypt)
         - POST /api/transfer (valida saldo atomicamente)
```

---

## Configuracao do Plugin Minecraft

O plugin Minecraft pode continuar usando a conexao direta ao banco, MAS:

1. **Use uma chave diferente** - Crie um role especifico para o plugin
2. **Nao processe transacoes com status PENDENTE** - Agora as transferencias ja vem com status CONCLUIDO
3. **Valide o sender** - Mesmo que a API valide, faca double-check

### Opcao Recomendada: Criar um Role para o Plugin

```sql
-- No Supabase SQL Editor
CREATE ROLE minecraft_plugin WITH LOGIN PASSWORD 'senha_segura_aqui';

-- Da permissoes especificas
GRANT SELECT, UPDATE ON rede_white_accounts TO minecraft_plugin;
GRANT SELECT, INSERT ON rede_white_transactions TO minecraft_plugin;
GRANT SELECT, INSERT, UPDATE ON mining_save TO minecraft_plugin;
GRANT SELECT, INSERT, UPDATE ON transacoes_mineracao TO minecraft_plugin;

-- Cria politicas RLS especificas para o plugin
CREATE POLICY "plugin_full_access" ON rede_white_accounts
  FOR ALL
  TO minecraft_plugin
  USING (true)
  WITH CHECK (true);
```

---

## Checklist de Seguranca

- [ ] RLS habilitado em todas as tabelas
- [ ] Script SQL executado com sucesso
- [ ] SUPABASE_SERVICE_ROLE_KEY configurada no Vercel
- [ ] Login testado e funcionando
- [ ] Transferencia testada e funcionando
- [ ] Plugin Minecraft atualizado (se aplicavel)
- [ ] Anon key rotacionada no Supabase (opcional mas recomendado)

---

## O que NAO foi alterado (voce precisa fazer manualmente)

1. **Reset de senhas dos jogadores** - Todas as senhas em plaintext foram comprometidas
   - Opcao 1: Force reset de senha para todos
   - Opcao 2: Deixe a migracao automatica acontecer no login

2. **Rotacao da anon key** - Se alguem ja tem a chave antiga, pode tentar explorar
   - Va em Supabase > Settings > API > Regenerate anon key

3. **Auditoria de transacoes suspeitas** - Verifique se houve exploits antes da correcao
   - Busque transacoes com valores muito altos ou de usuarios suspeitos

---

## Arquivos Criados/Modificados

### Novos Arquivos
- `app/api/auth/login/route.ts` - API segura de login com bcrypt
- `app/api/transfer/route.ts` - API segura de transferencia com validacao atomica
- `scripts/security-setup.sql` - Script para habilitar RLS e criar politicas

### Arquivos Modificados
- `components/LoginView.tsx` - Usa API ao inves de acesso direto
- `components/PixArea.tsx` - Usa API ao inves de acesso direto
- `components/WhiteBankApp.tsx` - Gerencia sessionToken

---

## Contato

Se tiver duvidas sobre a implementacao, entre em contato com o desenvolvedor.
