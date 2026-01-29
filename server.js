
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Configurações do Supabase
const SUPABASE_URL = 'https://mmmazuwqcssymohcdzyj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bf0YEm9kQ92T5U9WFbKeeg_clS4zyLc';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const { data, error } = await supabase
      .from('rede_white_accounts')
      .select('*')
      .eq('username', username)
      .eq('password_hash', password)
      .single();

    if (error || !data) {
      return res.status(401).json({ success: false, message: 'Dados incorretos no Supabase.' });
    }

    res.json({ success: true, player: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log("\x1b[32m%s\x1b[0m", "==========================================");
  console.log(`🚀 WhiteBank LOCAL conectado ao SUPABASE`);
  console.log(`📡 Porta: ${PORT}`);
  console.log("\x1b[32m%s\x1b[0m", "==========================================");
});
