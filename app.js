const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();

// Configuração do body-parser para obter dados de formulários HTML
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mysql2024',
  database: 'cad_node'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao banco de dados MySQL!');
});

// Rota para exibir o formulário HTML de cadastro
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Rota para processar o formulário de cadastro
app.post('/cadastro', (req, res) => {
  const { nome, email, telefone } = req.body;
  const sql = 'INSERT INTO pessoas (nome, email, telefone) VALUES (?, ?, ?)';
  db.query(sql, [nome, email, telefone], (err, result) => {
    if (err) throw err;
    res.send('Cadastro realizado com sucesso!');
  });
});

// Rota para exibir os dados da tabela de pessoas
app.get('/lista', (req, res) => {
  const sql = 'SELECT * FROM pessoas';
  db.query(sql, (err, results) => {
    if (err) throw err;

    let html = `
      <!DOCTYPE html>
      <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lista de Pessoas</title>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          table, th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color:  #C0D9D9;
          }
        </style>
      </head>
      <body>
        <h1>Lista de Pessoas</h1>
        <table>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>`;

    results.forEach(person => {
      html += `
          <tr>
            <td>${person.id}</td>
            <td>${person.nome}</td>
            <td>${person.email}</td>
            <td>${person.telefone}</td>
            <td>
              <a href="/editar/${person.id}"style= color:#00FF00;">Editar</a>
              <a href="/remover/${person.id}" style="margin-left: 10px; color: red;">Remover</a>
            </td>
          </tr>`;
    });

    html += `
        </table>
        <br>
        <a href="/">Voltar para o cadastro</a>
      </body>
      </html>`;

    res.send(html);
  });
});

// Rota para exibir o formulário de edição de pessoa
app.get('/editar/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM pessoas WHERE id = ?';
  db.query(sql, id, (err, result) => {
    if (err) throw err;
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-br">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Editar Pessoa</title>
      </head>
      <body>
        <h1>Editar Pessoa</h1>
        <form action="/editar/${id}" method="POST">
          <label for="nome">Nome:</label><br>
          <input type="text" id="nome" name="nome" value="${result[0].nome}" required><br>
          <label for="email">Email:</label><br>
          <input type="email" id="email" name="email" value="${result[0].email}" required><br>
          <label for="telefone">Telefone:</label><br>
          <input type="text" id="telefone" name="telefone" value="${result[0].telefone}" required><br><br>
          <button type="submit">Salvar Alterações</button>
        </form>
      </body>
      </html>
    `);
  });
});

// Rota para processar o formulário de edição de pessoa
app.post('/editar/:id', (req, res) => {
  const id = req.params.id;
  const { nome, email, telefone } = req.body;
  const sql = 'UPDATE pessoas SET nome = ?, email = ?, telefone = ? WHERE id = ?';
  db.query(sql, [nome, email, telefone, id], (err, result) => {
    if (err) throw err;
    res.redirect('/lista');
  });
});

// Rota para deletar uma pessoa
app.get('/remover/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM pessoas WHERE id = ?';
  db.query(sql, id, (err, result) => {
    if (err) throw err;
    res.redirect('/lista');
  });
});

// Iniciar o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
