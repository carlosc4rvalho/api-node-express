const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');

const app = express();
const porta = process.env.PORT || 3000;

const uri = "mongodb+srv://admin:12345@database.gvux7j7.mongodb.net/faculdade?retryWrites=true&w=majority";

const clienteMongo = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.use(express.json());
app.use(cors());

// Função para conectar ao MongoDB Atlas
async function conectarAoMongoDB() {
  try {
    await clienteMongo.connect();
    console.log("Conectado ao MongoDB Atlas");
  } catch (erro) {
    console.error("Erro na conexão com o MongoDB:", erro);
  }
}

// Rota para cadastrar um novo produto
app.post('/produtos', async (req, res) => {
  const novoProduto = req.body;
  
  if (!isNaN(Number(novoProduto._id))) {
    try {
      const resultado = await clienteMongo.db("faculdade").collection("produtos").insertOne(novoProduto);
      res.status(200).json({ mensagem: "Produto cadastrado com sucesso" });
    } catch (erro) {
      console.error("Erro ao cadastrar produto:", erro);
      res.status(500).json({ mensagem: "Erro ao cadastrar produto" });
    }
  } else {
    res.status(400).json({ mensagem: "O campo _id não é um número válido" });
  }
});


// Rota para buscar todos os produtos
app.get('/produtos', async (req, res) => {
  try {
    const produtos = await clienteMongo.db("faculdade").collection("produtos").find({}).toArray();
    res.json(produtos);
  } catch (erro) {
    console.error("Erro ao buscar produtos:", erro);
    res.status(500).json({ mensagem: "Erro ao buscar produtos" });
  }
});

// Rota para buscar um produto pelo ID
app.get('/produtos/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const produto = await clienteMongo.db("faculdade").collection("produtos").findOne({ _id: id });
    if (produto) {
      res.json(produto);
    } else {
      res.status(404).json({ mensagem: "Produto não encontrado" });
    }
  } catch (erro) {
    console.error("Erro ao buscar produto:", erro);
    res.status(500).json({ mensagem: "Erro ao buscar produto" });
  }
});

// Rota para atualizar um produto pelo ID
app.put('/produtos/:id', async (req, res) => {
  const id = req.params.id;
  const novosDados = req.body;

  try {
    const resultado = await clienteMongo.db("faculdade").collection("produtos").updateOne({ _id: id }, { $set: novosDados });
    if (resultado.modifiedCount === 1) {
      res.json({ mensagem: "Produto atualizado com sucesso" });
    } else {
      res.status(404).json({ mensagem: "Produto não encontrado" });
    }
  } catch (erro) {
    console.error("Erro ao atualizar produto:", erro);
    res.status(500).json({ mensagem: "Erro ao atualizar produto" });
  }
});

// Rota para deletar um produto pelo ID
app.delete('/produtos/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const resultado = await clienteMongo.db("faculdade").collection("produtos").deleteOne({ _id: id });
    if (resultado.deletedCount === 1) {
      res.json({ mensagem: "Produto deletado com sucesso" });
    } else {
      res.status(404).json({ mensagem: "Produto não encontrado" });
    }
  } catch (erro) {
    console.error("Erro ao deletar produto:", erro);
    res.status(500).json({ mensagem: "Erro ao deletar produto" });
  }
});

// Função para iniciar o servidor após conectar ao MongoDB
async function iniciarServidor() {
  await conectarAoMongoDB();
  app.listen(porta, () => {
    console.log(`Servidor hospedado em http://localhost:${porta}`);
  });
}

iniciarServidor().catch(console.error);
