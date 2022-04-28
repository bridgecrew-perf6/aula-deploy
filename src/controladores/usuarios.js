const knex = require('../conexao');
const bcrypt = require('bcrypt');

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha, nome_loja } = req.body;

    if (!nome) {
        return res.status(404).json("O campo nome é obrigatório");
    }

    if (!email) {
        return res.status(404).json("O campo email é obrigatório");
    }

    if (!senha) {
        return res.status(404).json("O campo senha é obrigatório");
    }

    if (!nome_loja) {
        return res.status(404).json("O campo nome_loja é obrigatório");
    }

    try {
        const usuarioCadastrado = await knex('usuarios').where('email', email);

        if (usuarioCadastrado.length > 0) {
            return res.status(400).json("O email já existe");
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const usuario = await knex('usuarios').insert({nome, email, senha: senhaCriptografada, nome_loja}).returning('*');

        if (!usuario) {
            return res.status(400).json("O usuário não foi cadastrado.");
        }

        const retorno = {
            id: usuario[0].id,
            nome: usuario[0].nome,
            email: usuario[0].email,
            nome_loja: usuario[0].nome_loja
        };

        return res.status(200).json(retorno);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterPerfil = async (req, res) => {
    return res.status(200).json(req.usuario);
}

const atualizarPerfil = async (req, res) => {
    const { nome, email, senha, nome_loja } = req.body;

    if (!nome && !email && !senha && !nome_loja) {
        return res.status(404).json('É obrigatório informar ao menos um campo para atualização');
    }

    try {
        // update usuarios set nome = $1, email = $2...
        const body = {};
        const params = [];
        let n = 1;

        if (nome) {
            body.nome = nome;
            params.push(`nome`);
            n++;
        }

        if (email) {
            if (email !== req.usuario.email) {
                const usuario = await knex('usuarios').where('email', email);

                if (usuario.length > 0) {
                    return res.status(400).json("O email já existe");
                }
            }

            body.email = email;
            params.push(`email`);
            n++;
        }

        if (senha) {
            body.senha = await bcrypt.hash(senha, 10);
            params.push(`senha`);
            n++;
        }

        if (nome_loja) {
            body.nome_loja = nome_loja;
            params.push(`nome_loja`);
            n++;
        }

        const valores = Object.values(body);
        
        const parametro = {};

        for (let i = 0; i < params.length; i++) {
            parametro[params[i]] = valores[i];
        }

        const usuarioAtualizado = await knex('usuarios').update(parametro).where('id', req.usuario[0].id);
        
        if (usuarioAtualizado.length === 0) {
            return res.status(400).json("O usuario não foi atualizado");
        }

        return res.status(200).json('Usuario foi atualizado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    cadastrarUsuario,
    obterPerfil,
    atualizarPerfil
}