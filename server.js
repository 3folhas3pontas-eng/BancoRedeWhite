
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Configuração da conexão com a BedHosting
const db = mysql.createPool({
  host: 'mysql.bedhosting.com.br',
  user: 'u12708_CLdMo1eFsB',
  password: 'E.vJo34wJ5+^NRwvDi5pefl@',
  database: 's12708_Banco',
  port: 3306
});

// Rota de Login que o site consome
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Consulta utilizando os campos reais do seu banco
  const query = 'SELECT * FROM rede_white_accounts WHERE username = ? AND password_hash = ?';
  
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("Erro no banco de dados:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    
    if (results.length > 0) {
      // Retorna os dados do jogador para o React
      res.json({ 
        success: true, 
        player: results[0] 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Nick ou Senha incorretos!' 
      });
    }
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log("\x1b[36m%s\x1b[0m", "==========================================");
  console.log(`🚀 WhiteBank Backend online na porta ${PORT}`);
  console.log(`🔗 Conectado ao MySQL: mysql.bedhosting.com.br`);
  console.log("\x1b[36m%s\x1b[0m", "==========================================");
  console.log("Aguardando conexões do site...");
});
