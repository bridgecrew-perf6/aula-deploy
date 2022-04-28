const conexao = require('../conexao');
const jwt = require('jsonwebtoken');
const senhaHash = require('../senhaHash');
const knex = require('../conexao');

const verificaLogin = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json('Não autorizado');
    }

    try {
        const token = authorization.replace('Bearer ', '').trim();

        const { id } = jwt.verify(token, senhaHash);

        const verificarUsuario = await knex('usuarios').where('id', id).debug();

        if (verificarUsuario.length === 0) {
            return res.status(404).json('Usuario não encontrado');
        }

        const { senha, ...usuario } = verificarUsuario;

        req.usuario = usuario;

        next();
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = verificaLogin