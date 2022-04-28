const knex = require('../conexao');

const listarProdutos = async (req, res) => {
    const { usuario } = req;
    const { categoria } = req.query;

    try {
        let condicao = '';
        const params = [];

        if (categoria) {
            condicao += 'categoria';
            params.push(`%${categoria}%`);

            const produtos = await knex('produtos').where('usuario_id', usuario[0].id).andWhere(condicao, 'ilike', params);

            return res.status(200).json(produtos);
        }

        const produtos = await knex('produtos').where('usuario_id', usuario[0].id);

        return res.status(200).json(produtos);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const produto = await knex('produtos').where('usuario_id', usuario[0].id).andWhere('id', id);

        if (produto.length === 0) {
            return res.status(404).json('Produto não encontrado');
        }

        return res.status(200).json(produto);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cadastrarProduto = async (req, res) => {
    const { usuario } = req;
    const { nome, estoque, preco, categoria, descricao, imagem } = req.body;

    if (!nome) {
        return res.status(404).json('O campo nome é obrigatório');
    }

    if (!estoque) {
        return res.status(404).json('O campo estoque é obrigatório');
    }

    if (!preco) {
        return res.status(404).json('O campo preco é obrigatório');
    }

    if (!descricao) {
        return res.status(404).json('O campo descricao é obrigatório');
    }

    try {
        const produto = {
            usuario_id: usuario[0].id,
            nome,
            estoque,
            preco,
            categoria,
            descricao,
            imagem
        }
        const produtoAdicionado = await knex('produtos').insert(produto).returning('*');

        if (produto.length === 0) {
            return res.status(400).json('O produto não foi cadastrado');
        }

        return res.status(200).json(produtoAdicionado);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;
    const { nome, estoque, preco, categoria, descricao, imagem } = req.body;

    if (!nome && !estoque && !preco && !categoria && !descricao && !imagem) {
        return res.status(404).json('Informe ao menos um campo para atualizaçao do produto');
    }

    try {

        const produto = await knex('produtos').where('usuario_id', usuario[0].id).andWhere('id', id);

        if (produto.length === 0) {
            return res.status(404).json('Produto não encontrado');
        }

        const body = {};
        const params = [];
        let n = 1;

        if (nome) {
            body.nome = nome;
            params.push(`nome`);
            n++;
        }

        if (estoque) {
            body.estoque = estoque;
            params.push(`estoque`);
            n++;
        }

        if (categoria) {
            body.categoria = categoria;
            params.push(`categoria`);
            n++;
        }

        if (descricao) {
            body.descricao = descricao;
            params.push(`descricao`);
            n++;
        }

        if (preco) {
            body.preco = preco;
            params.push(`preco`);
            n++;
        }

        if (imagem) {
            body.imagem = imagem;
            params.push(`imagem`);
            n++;
        }

        const valores = Object.values(body);
        
        const parametro = {};

        for (let i = 0; i < params.length; i++) {
            parametro[params[i]] = valores[i];
        }

        const produtoAtualizado = await knex('produtos').update(parametro).where('id', id).returning('*');
           
        console.log(produtoAtualizado)
        if (produtoAtualizado.length === 0) {
            return res.status(400).json("O produto não foi atualizado");
        }

        return res.status(200).json('produto foi atualizado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    try {
         const produto = await knex('produtos').where('usuario_id', usuario[0].id).andWhere('id', id).debug();

        if (produto.length === 0) {
            return res.status(404).json('Produto não encontrado');
        }

        const produtoExcluido = await knex('produtos').delete().where('id', id);

        if (produtoExcluido.rowCount === 0) {
            return res.status(400).json("O produto não foi excluido");
        }

        return res.status(200).json('Produto excluido com sucesso');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    listarProdutos,
    obterProduto,
    cadastrarProduto,
    atualizarProduto,
    excluirProduto
}